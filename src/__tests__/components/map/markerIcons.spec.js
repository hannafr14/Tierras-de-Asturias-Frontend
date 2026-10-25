import { describe, expect, it } from 'vitest'
import markerSvg from '@/assets/marker-icon-granja.svg?raw'
import selectedMarkerSvg from '@/assets/marker-icon-granja-selected.svg?raw'

const parseIcon = (source) => new DOMParser().parseFromString(source, 'image/svg+xml')

describe('farm marker icons', () => {
  it('keeps the ordinary marker green with a white tractor and border', () => {
    const icon = parseIcon(markerSvg)

    expect(icon.querySelector('parsererror')).toBeNull()
    expect(icon.documentElement.firstElementChild.getAttribute('fill')).toBe('#006727')
    expect(icon.documentElement.firstElementChild.getAttribute('stroke')).toBe('white')
    expect(icon.querySelector('path').getAttribute('fill')).toBe('white')
  })

  it('uses a white circle, green tractor, and green border for selection', () => {
    const icon = parseIcon(selectedMarkerSvg)
    const matrices = icon.querySelectorAll('feColorMatrix')

    expect(icon.querySelector('parsererror')).toBeNull()
    expect(icon.documentElement.firstElementChild.getAttribute('fill')).toBe('white')
    expect(icon.documentElement.firstElementChild.getAttribute('stroke')).toBe('#2BB86A')
    expect(icon.querySelector('path').getAttribute('fill')).toBe('#006727')
    expect(matrices[matrices.length - 1].getAttribute('values')).toBe(
      '0 0 0 0 0.169 0 0 0 0 0.722 0 0 0 0 0.416 0 0 0 1 0',
    )
  })

  it('preserves the marker dimensions and tractor geometry when selected', () => {
    const ordinary = parseIcon(markerSvg)
    const selected = parseIcon(selectedMarkerSvg)

    for (const attribute of ['width', 'height', 'viewBox']) {
      expect(selected.documentElement.getAttribute(attribute)).toBe(
        ordinary.documentElement.getAttribute(attribute),
      )
    }
    expect(selected.querySelector('path').getAttribute('d')).toBe(
      ordinary.querySelector('path').getAttribute('d'),
    )
  })
})
