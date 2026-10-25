import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi, beforeEach } from 'vitest'
import MapSection from '@/components/map/MapSection.vue'
import L from 'leaflet'

const markerMocks = []

enableAutoUnmount(afterEach)

vi.mock('leaflet', () => {
  return {
    default: {
      map: vi.fn(() => ({
        setView: vi.fn().mockReturnThis(),
        invalidateSize: vi.fn(),
        remove: vi.fn(),
        getZoom: vi.fn(() => 8),
        stop: vi.fn().mockReturnThis(),
        panInside: vi.fn().mockReturnThis(),
      })),
      tileLayer: vi.fn(() => ({
        addTo: vi.fn(),
      })),
      layerGroup: vi.fn(() => ({
        addTo: vi.fn().mockReturnThis(),
        clearLayers: vi.fn(),
      })),
      icon: vi.fn((options) => options),
      marker: vi.fn((coordinates, options) => {
        const marker = {
          coordinates,
          options,
          addTo: vi.fn().mockReturnThis(),
          bindPopup: vi.fn().mockReturnThis(),
          openPopup: vi.fn(),
          on: vi.fn().mockReturnThis(),
          setIcon: vi.fn((icon) => {
            marker.options.icon = icon
            return marker
          }),
          getIcon: vi.fn(() => marker.options.icon),
          isPopupOpen: vi.fn(() => false),
          getPopup: vi.fn(() => ({
            getElement: () => ({ offsetWidth: 130, offsetHeight: 190 }),
          })),
          setZIndexOffset: vi.fn().mockReturnThis(),
          getLatLng: vi.fn(() => coordinates),
        }

        markerMocks.push(marker)

        return marker
      }),
    },
  }
})

vi.mock('@/assets/marker-icon-granja.svg', () => ({
  default: 'marker-icon.svg',
}))

vi.mock('@/assets/marker-icon-granja-selected.svg', () => ({
  default: 'selected-marker-icon.svg',
}))

describe('MapSection', () => {
  beforeEach(() => {
    markerMocks.length = 0
  })

  it('renders one marker for each farm with coordinates', () => {
    mount(MapSection, {
      props: {
        farms: [
          {
            id: 1,
            name: 'Finca La Vara',
            address: 'Oviedo',
            image: 'finca.jpg',
            latitude: 43.36,
            longitude: -5.84,
            categories: ['Quesos'],
          },
          {
            id: 2,
            name: 'Granja Norte',
            address: 'Gijon',
            image: 'granja.jpg',
            latitude: 43.53,
            longitude: -5.66,
            categories: ['Miel'],
          },
        ],
      },
    })

    expect(markerMocks).toHaveLength(2)
    expect(markerMocks[0].coordinates).toEqual([43.36, -5.84])
    expect(markerMocks[1].coordinates).toEqual([43.53, -5.66])
  })

  it('opens the selected farm marker popup', async () => {
    const wrapper = mount(MapSection, {
      props: {
        farms: [
          {
            id: 1,
            name: 'Finca La Vara',
            address: 'Oviedo',
            image: 'finca.jpg',
            latitude: 43.36,
            longitude: -5.84,
            categories: ['Quesos'],
          },
        ],
      },
    })

    await wrapper.setProps({ selectedFarmId: 1 })

    expect(markerMocks[0].openPopup).toHaveBeenCalled()
    expect(markerMocks[0].setIcon).toHaveBeenLastCalledWith(
      expect.objectContaining({ iconUrl: 'selected-marker-icon.svg' }),
    )
    expect(markerMocks[0].setZIndexOffset).toHaveBeenLastCalledWith(10000)
  })

  it('emits the selected farm when its marker is clicked', async () => {
    const wrapper = mount(MapSection, {
      props: {
        farms: [
          { id: 1, latitude: 43.36, longitude: -5.84 },
          { id: 2, latitude: 43.53, longitude: -5.66 },
        ],
        showPopups: false,
      },
    })

    const clickHandler = markerMocks[1].on.mock.calls.find(
      ([event]) => event === 'click',
    )[1]
    clickHandler()

    expect(wrapper.emitted('update:selectedFarmId')).toEqual([[2]])

    await wrapper.setProps({ selectedFarmId: 2 })

    expect(markerMocks[1].setIcon).toHaveBeenLastCalledWith(
      expect.objectContaining({ iconUrl: 'selected-marker-icon.svg' }),
    )
    expect(markerMocks[1].setZIndexOffset).toHaveBeenLastCalledWith(10000)
  })

  it('restores the previous marker when selection changes or is cleared', async () => {
    const wrapper = mount(MapSection, {
      props: {
        farms: [
          { id: 1, latitude: 43.36, longitude: -5.84 },
          { id: 2, latitude: 43.53, longitude: -5.66 },
        ],
        selectedFarmId: 1,
        showPopups: false,
      },
    })

    expect(markerMocks[0].setIcon).toHaveBeenLastCalledWith(
      expect.objectContaining({ iconUrl: 'selected-marker-icon.svg' }),
    )
    expect(markerMocks[0].openPopup).not.toHaveBeenCalled()
    expect(markerMocks[1].getIcon().iconUrl).toBe('marker-icon.svg')
    expect(markerMocks[1].setIcon).not.toHaveBeenCalled()

    await wrapper.setProps({ selectedFarmId: 2 })

    expect(markerMocks[0].setIcon).toHaveBeenLastCalledWith(
      expect.objectContaining({ iconUrl: 'marker-icon.svg' }),
    )
    expect(markerMocks[0].setZIndexOffset).toHaveBeenLastCalledWith(0)
    expect(markerMocks[1].setIcon).toHaveBeenLastCalledWith(
      expect.objectContaining({ iconUrl: 'selected-marker-icon.svg' }),
    )
    expect(markerMocks[1].setZIndexOffset).toHaveBeenLastCalledWith(10000)

    await wrapper.setProps({ selectedFarmId: null })

    markerMocks.forEach((marker) => {
      expect(marker.setIcon).toHaveBeenLastCalledWith(
        expect.objectContaining({ iconUrl: 'marker-icon.svg' }),
      )
      expect(marker.setZIndexOffset).toHaveBeenLastCalledWith(0)
    })
  })

  it('preserves selection after farm markers are rebuilt', async () => {
    const wrapper = mount(MapSection, {
      props: {
        farms: [{ id: 1, latitude: 43.36, longitude: -5.84 }],
        selectedFarmId: 1,
        showPopups: false,
      },
    })

    await wrapper.setProps({
      farms: [
        { id: 1, latitude: 43.36, longitude: -5.84 },
        { id: 2, latitude: 43.53, longitude: -5.66 },
      ],
    })

    expect(markerMocks).toHaveLength(3)
    expect(markerMocks[1].setIcon).toHaveBeenLastCalledWith(
      expect.objectContaining({ iconUrl: 'selected-marker-icon.svg' }),
    )
    expect(markerMocks[1].setZIndexOffset).toHaveBeenLastCalledWith(10000)
    expect(markerMocks[2].getIcon().iconUrl).toBe('marker-icon.svg')
  })

  it('pans only as needed with popup padding instead of recentering the catalog', async () => {
    const wrapper = mount(MapSection, {
      props: {
        farms: [
          { id: 1, name: 'Farm One', address: 'Oviedo', image: 'one.jpg', latitude: 43.36, longitude: -5.84 },
          { id: 2, name: 'Farm Two', address: 'Gijon', image: 'two.jpg', latitude: 43.53, longitude: -5.66 },
        ],
      },
    })
    const map = L.map.mock.results.at(-1).value

    await wrapper.setProps({ selectedFarmId: 1 })
    await wrapper.setProps({ selectedFarmId: 2 })

    expect(map.setView).toHaveBeenCalledTimes(1)
    expect(map.stop).toHaveBeenCalledTimes(2)
    expect(map.panInside).toHaveBeenLastCalledWith([43.53, -5.66], {
      paddingTopLeft: [89, 250],
      paddingBottomRight: [89, 40],
      animate: true,
      duration: 0.35,
    })
    expect(markerMocks[1].bindPopup).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      { closeButton: false, autoPan: false },
    )
  })

  it('keeps the single-farm location map framed at zoom twelve', () => {
    mount(MapSection, {
      props: {
        farms: [{ id: 1, latitude: 43.36, longitude: -5.84 }],
        selectedFarmId: 1,
        showPopups: false,
      },
    })
    const map = L.map.mock.results.at(-1).value

    expect(map.setView).toHaveBeenLastCalledWith([43.36, -5.84], 12, { animate: false })
    expect(markerMocks[0].openPopup).not.toHaveBeenCalled()
    expect(map.panInside).toHaveBeenCalledWith([43.36, -5.84], {
      paddingTopLeft: [40, 40],
      paddingBottomRight: [40, 40],
      animate: true,
      duration: 0.35,
    })
  })

  it('does not reopen an already open popup when its marker becomes selected', async () => {
    const wrapper = mount(MapSection, {
      props: {
        farms: [{ id: 1, name: 'Farm One', address: 'Oviedo', image: 'one.jpg', latitude: 43.36, longitude: -5.84 }],
      },
    })
    markerMocks[0].isPopupOpen.mockReturnValue(true)

    await wrapper.setProps({ selectedFarmId: 1 })

    expect(markerMocks[0].openPopup).not.toHaveBeenCalled()
  })

  it.each(['Enter', ' '])('selects the focused marker using %s', (key) => {
    const wrapper = mount(MapSection, {
      props: {
        farms: [{ id: 1, latitude: 43.36, longitude: -5.84 }],
        showPopups: false,
      },
    })
    const keypressHandler = markerMocks[0].on.mock.calls.find(
      ([event]) => event === 'keypress',
    )[1]
    const preventDefault = vi.fn()

    keypressHandler({ originalEvent: { key, preventDefault } })

    expect(wrapper.emitted('update:selectedFarmId')).toEqual([[1]])
    expect(preventDefault).toHaveBeenCalled()
  })
})
