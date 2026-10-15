<script setup>
import carritoIcon from '@/assets/carrito.svg';
import { useCartStore } from '@/stores/cartStore';

const cartStore = useCartStore();
</script>

<template>
    <header class="header">
        <a class="header_logo" href="/">
            Tierras de Asturias
        </a>

        <nav class="header_nav">
            <RouterLink to="/productos">
                Productos
            </RouterLink>

            <RouterLink to="/granjas">
                Granjas
            </RouterLink>
        </nav>

        <div class="header_actions">
            <RouterLink class="header_icon" to="/cart" aria-label="Carrito">
                <img :src="carritoIcon" alt="Carrito">
                <span
                    v-if="cartStore.items.length > 0"
                    class="header_cart-count"
                >
                    {{ cartStore.items.length }}
                </span>
            </RouterLink>

            <RouterLink class="header_login" to="/login">
                Iniciar sesión
            </RouterLink>
        </div>
    </header>
</template>

<style scoped lang="scss">
.header {
    height: 59px;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    padding: 0 35px;
    background: #F9F9FF;
    gap: 26px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

    &_logo {
        color: #006727;
        font-size: 21px;
        font-weight: 700;
        text-decoration: none;
        white-space: nowrap;
        line-height: 27px;
    }

    &_nav {
        display: flex;
        align-items: center;
        gap: 28px;

        a {
            color: #3F4A3E;
            font-size: 14px;
            font-weight: 600;
            line-height: 21px;
            text-decoration: none;
        

            &:hover {
                color: #006727;
            }

            &.router-link-active {
                color: #006727;
                font-weight: 700;
                padding-bottom: 3px;
                border-bottom: 2px solid #006727;
            }
        }
    }

    &_actions {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    &_icon {
        position: relative;
        width: 36px;
        height: 36px;
        padding: 7px;
        border: none;
        background: transparent;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;

        img {
            width: 18px;
            height: 18px;
            display: block;
        }
    }

    &_cart-count {
        position: absolute;
        top: 2px;
        right: 2px;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        border-radius: 999px;
        background: #007A3D;
        color: #FFFFFF;
        font-size: 10px;
        font-weight: 700;
        line-height: 16px;
        text-align: center;
    }

    &_account {
        display: flex;
        align-items: center;
        border: none;
        background: transparent;
        color: #3F4A3E;
        font-size: 12px;
        font-weight: 600;
        line-height: 17px;
        cursor: pointer;
    }

    &_avatar {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        object-fit: cover;
        margin-right: 8px;
    }

    &_login {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        white-space: nowrap;
        padding: 7px 18px;
        border: none;
        border-radius: 999px;
        background: #006727;
        color: #ffffff;
        font-size: 12px;
        font-weight: 700;
        line-height: 17px;
        cursor: pointer;
    }
}

@media (max-width: 768px) {
    .header {
        padding: 0 20px;
        gap: 18px;

        &_logo {
            font-size: 18px;
            line-height: 24px;
        }

        &_nav {
            gap: 18px;

            a {
                font-size: 13px;
            }
        }

        &_actions {
            gap: 6px;
        }
    }
}

@media (max-width: 576px) {
    .header {
        height: 44px;
        padding: 0 12px;
        gap: 12px;

        &_logo {
            font-size: 17px;
        }

        &_nav {
            display: none;
        }

        &_actions {
            gap: 4px;
        }

        &_icon {
            width: 28px;
            height: 28px;
            padding: 0;    

            img {
                width: 18px;
                height: 18px;
            }
        }

        &_cart-count {
            top: -2px;
            right: -2px;
        }

        &_account {
            width: 28px;
            height: 28px;
            padding: 5px;

            span {
                display: none;
            }
        }

        &_avatar {
            width: 18px;
            height: 18px;
            margin-right: 0;
        }

        &_login {
            padding: 6px 12px;
            font-size: 11px;
            line-height: 14px;
        }
    }
}
</style>
