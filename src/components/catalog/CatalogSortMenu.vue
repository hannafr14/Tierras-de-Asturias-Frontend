<script setup>
import { onActivated, onBeforeUnmount, onDeactivated, onMounted, ref } from 'vue'
import filterIcon from '@/assets/filter.svg'

defineProps({
    modelValue: { type: String, default: 'default' },
    options: { type: Array, required: true },
})

const emit = defineEmits(['update:modelValue'])
const menu = ref(null)

function closeMenu(restoreFocus = true) {
    if (menu.value) {
        menu.value.open = false
        if (restoreFocus) menu.value.querySelector('summary')?.focus()
    }
}

function handleOutsideClick(event) {
    if (menu.value?.open && !menu.value.contains(event.target)) {
        closeMenu(false)
    }
}

function startListening() {
    // Capture also handles clicks on controls that stop event propagation.
    document.addEventListener('click', handleOutsideClick, true)
}

function stopListening() {
    document.removeEventListener('click', handleOutsideClick, true)
}

onMounted(startListening)
onActivated(startListening)
onBeforeUnmount(stopListening)
onDeactivated(() => {
    stopListening()
    closeMenu(false)
})

function chooseSort(value) {
    emit('update:modelValue', value)
    closeMenu()
}
</script>

<template>
    <details ref="menu" class="catalog-sort" @keydown.esc.stop.prevent="closeMenu()">
        <summary class="catalog-sort_trigger">
            <img :src="filterIcon" alt="">
            <span>Filtros</span>
        </summary>

        <div class="catalog-sort_list">
            <button
                v-for="option in options"
                :key="option.value"
                type="button"
                :class="{ 'is-active': modelValue === option.value }"
                :aria-pressed="modelValue === option.value"
                @click="chooseSort(option.value)"
            >
                {{ option.label }}
            </button>
        </div>
    </details>
</template>

<style scoped lang="scss">
.catalog-sort {
    position: relative;
    flex: 0 0 auto;

    &_trigger {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        height: 36px;
        padding: 0 18px;
        border: 1px solid #BECABA;
        border-radius: 6px;
        background: #E9EEFC;
        color: #3F4A3E;
        font-size: 14px;
        font-weight: 600;
        list-style: none;
        cursor: pointer;

        &::-webkit-details-marker { display: none; }

        &:focus-visible {
            outline: 2px solid #007A3D;
            outline-offset: 2px;
        }

        img { width: 14px; height: 14px; }
    }

    &_list {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        z-index: 50;
        width: 240px;
        max-width: calc(100vw - 32px);
        padding: 6px;
        border: 1px solid #DEE5DC;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 8px 24px rgba(17, 24, 39, 0.12);

        button {
            width: 100%;
            min-height: 38px;
            padding: 8px 12px;
            border: 0;
            border-radius: 4px;
            background: transparent;
            color: #3F4A3E;
            font: inherit;
            font-size: 14px;
            text-align: left;
            cursor: pointer;

            &:hover,
            &.is-active {
                background: #EDF6EF;
                color: #006B35;
            }
        }
    }
}
</style>
