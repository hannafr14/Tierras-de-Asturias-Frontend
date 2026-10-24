<script setup>
import fallbackImage from '@/assets/image-placeholder.svg'
import locationIcon from '@/assets/location.svg'

const emit = defineEmits(['view-farm'])

const props = defineProps({
    image: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    tags: {
        type: Array,
        default: () => [],
    },
    variant: {
        type: String,
        default: 'default',
    },
})

function handleImageError(event) {
    event.target.src = fallbackImage
}
</script>

<template>
    <article
        class="farm-card"
        :class="{ 'farm-card--compact': props.variant === 'compact' }"
    >
        <img
            class="farm-card_image"
            :src="image"
            :alt="name"
            @error="handleImageError"
        >

        <div class="farm-card_body">
            <h3 class="farm-card_title">{{ name }}</h3>

            <p class="farm-card_location">
                <img
                    class="farm-card_location-icon"
                    :src="locationIcon"
                    alt=""
                >
                {{ location }}
            </p>

            <div class="farm-card_tags">
                <span
                    v-for="tag in tags"
                    :key="tag"
                    class="farm-card_tag"
                >
                    {{ tag }}
                </span>
            </div>

            <button
                class="farm-card_button"
                type="button"
                @click.stop="emit('view-farm')"
            >
                Ver granja
            </button>
        </div>
    </article>
</template>

<style scoped lang="scss">
.farm-card {
    width: 100%;
    max-width: 320px;
    min-width: 0;
    padding: 14px;
    border: 1px solid #BECABA;
    border-radius: 11px;
    background: #FFFFFF;
    box-shadow: 0 3px 8px rgba(17, 24, 39, 0.08);
    margin-bottom: 15px;

    &_image {
        width: 100%;
        height: 190px;
        display: block;
        object-fit: scale-down;
        padding: 12px;
        box-sizing: border-box;
        background: #fff;
        border-radius: 7px;
        margin: 0 auto;
    }

    &_body {
        padding-top: 14px;
    }

    &_title {
        color: #111827;
        font-size: 16px;
        font-weight: 500;
        line-height: 25px;
        margin: 0;
        margin-bottom: 6px;
    }

    &_location {
        display: flex;
        align-items: center;
        color: #6F7A6D;
        font-size: 12px;
        font-weight: 400;
        line-height: 17px;
        gap: 8px;
        margin: 0;
        margin-bottom: 6px;
    }

    &_location-icon {
        width: 14px;
        height: 14px;
        flex: 0 0 auto;
    }

    &_tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin: 4px 0 11px 0;
    }

    &_tag {
        padding: 4px 7px;
        border-radius: 5px;
        background: #E9EEFC;
        color: #3F4A3E;
        font-size: 9px;
        font-weight: 500;
        line-height: 13px;
    }

    &_button {
        width: 100%;
        height: 32px;
        border: none;
        border-radius: 7px;
        background: #007A3D;
        color: #FFFFFF;
        font-size: 12px;
        font-weight: 700;
        line-height: 17px;
        cursor: pointer;

        &:hover {
            background: #006727;
        }

        &:focus-visible {
            outline: 2px solid rgba(0, 122, 61, 0.35);
            outline-offset: 2px;
        }
    }
}

@media (max-width: 576px) {
    .farm-card {
        max-width: none;
        padding: 12px;

        &_image {
            width: 100%;
            height: 210px;
            margin: 0;
            border-radius: 7px;
        }

        &_body {
            padding: 12px 0 0;
        }

        &_button {
            height: 34px;
        }
    }
}

.farm-card--compact {
    max-width: 130px;
    padding: 8px;
    border-radius: 8px;
    margin-bottom: 0;

    .farm-card_image {
        height: 95px;
        border-radius: 6px;
    }

    .farm-card_body {
        padding-top: 8px;
    }

    .farm-card_title {
        margin-bottom: 3px;
        font-size: 11px;
        line-height: 15px;
    }

    .farm-card_location {
        gap: 4px;
        margin-bottom: 5px;
        font-size: 9px;
        line-height: 12px;
    }

    .farm-card_location-icon {
        width: 10px;
        height: 10px;
    }

    .farm-card_tags {
        margin: 3px 0 8px;
    }

    .farm-card_tag {
        padding: 3px 5px;
        font-size: 7px;
        line-height: 10px;
    }

    .farm-card_button {
        height: 24px;
        border-radius: 5px;
        font-size: 9px;
        line-height: 12px;
    }
}
.farm-card:not(.farm-card--compact) {
    padding: 0;
    overflow: hidden;

    .farm-card_image {
        padding: 0;
        object-fit: contain;
        border-radius: 0;
    }

    .farm-card_body {
        padding: 14px;
    }
}
</style>
