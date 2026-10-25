<script setup>
import { createApp, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import FarmCard from '@/components/cards/FarmCard.vue'
import markerIcon from '@/assets/marker-icon-granja.svg'
import selectedMarkerIcon from '@/assets/marker-icon-granja-selected.svg'

const mapElement = ref(null)
const emit = defineEmits(['view-farm', 'update:selectedFarmId'])

const props = defineProps({
    farms: {
        type: Array,
        default: () => [],
    },
    selectedFarmId: {
        type: Number,
        default: null,
    },
    showPopups: {
        type: Boolean,
        default: true,
    },
})

const customMarkerIcon = L.icon({
    iconUrl: markerIcon,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
    popupAnchor: [0, -23],
})

const activeMarkerIcon = L.icon({
    iconUrl: selectedMarkerIcon,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
    popupAnchor: [0, -23],
})

let map = null
let markersLayer = null

const markersByFarmId = new Map()

const updateMapSize = () => {
    if (map) {
        map.invalidateSize()
    }
}

const renderMarkers = () => {
    if (!map || !markersLayer) {
        return
    }

    markersLayer.clearLayers()
    markersByFarmId.clear()

    props.farms.forEach((farm) => {
        if (!farm.latitude || !farm.longitude) {
            return
        }

        const marker = L.marker([farm.latitude, farm.longitude], {
            icon: customMarkerIcon,
        }).addTo(markersLayer)

        marker.on('click', () => emit('update:selectedFarmId', farm.id))
        marker.on('keypress', (event) => {
            if (event.originalEvent.key === 'Enter' || event.originalEvent.key === ' ') {
                event.originalEvent.preventDefault()
                emit('update:selectedFarmId', farm.id)
            }
        })

        if (props.showPopups) {
            const popupContainer = document.createElement('div')
            popupContainer.className = 'map-popup'

            const farmPopupApp = createApp(FarmCard, {
                image: farm.image,
                name: farm.name,
                location: farm.address,
                tags: farm.categories,
                variant: 'compact',
                onViewFarm: () => emit('view-farm', farm.id),
            })

            farmPopupApp.mount(popupContainer)
            marker.bindPopup(popupContainer, { closeButton: false, autoPan: false })
        }

        markersByFarmId.set(farm.id, marker)
    })
}

const openSelectedFarmPopup = () => {
    markersByFarmId.forEach((marker, farmId) => {
        const isSelected = farmId === props.selectedFarmId

        const icon = isSelected ? activeMarkerIcon : customMarkerIcon

        if (marker.getIcon() !== icon) {
            marker.setIcon(icon)
        }
        marker.setZIndexOffset(isSelected ? 10000 : 0)
    })

    if (!props.selectedFarmId || !map) {
        return
    }

    const marker = markersByFarmId.get(props.selectedFarmId)

    if (!marker) {
        return
    }

    map.stop()

    if (props.farms.length === 1) {
        map.setView(marker.getLatLng(), 12, { animate: false })
    }

    if (props.showPopups && !marker.isPopupOpen()) {
        marker.openPopup()
    }

    const popupElement = props.showPopups ? marker.getPopup()?.getElement() : null
    const horizontalPadding = popupElement ? popupElement.offsetWidth / 2 + 24 : 40
    const topPadding = popupElement ? popupElement.offsetHeight + 60 : 40

    // Leave room for the popup above the marker without recentering visible farms.
    map.panInside(marker.getLatLng(), {
        paddingTopLeft: [horizontalPadding, topPadding],
        paddingBottomRight: [horizontalPadding, 40],
        animate: true,
        duration: 0.35,
    })
}

onMounted(() => {
    map = L.map(mapElement.value).setView([43.3619, -5.8494], 8)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    markersLayer = L.layerGroup().addTo(map)

    renderMarkers()
    openSelectedFarmPopup()

    setTimeout(updateMapSize, 0)
    window.addEventListener('resize', updateMapSize)
})

watch(
    () => props.farms,
    () => {
        renderMarkers()
        openSelectedFarmPopup()
    }
)

watch(
    () => props.selectedFarmId,
    () => {
        openSelectedFarmPopup()
    }
)

onBeforeUnmount(() => {
    window.removeEventListener('resize', updateMapSize)

    if (markersLayer) {
        markersLayer.clearLayers()
        markersLayer = null
    }

    if (map) {
        map.remove()
        map = null
    }
})
</script>

<template>
    <section class="map-section">
        <div ref="mapElement" class="map-section_map"></div>
    </section>
</template>

<style scoped lang="scss">
.map-section {
    width: 100%;
    height: 100%;
    min-height: 360px;

    &_map {
        width: 100%;
        height: 100%;
        min-height: 360px;
    }
}

:deep(.leaflet-popup-content-wrapper) {
    padding: 0;
    border-radius: 11px;
    background: transparent;
    box-shadow: none;
}

:deep(.leaflet-popup-content) {
    width: 130px !important;
    margin: 0;
}

:deep(.leaflet-popup-tip) {
    background: #FFFFFF;
}
</style>
