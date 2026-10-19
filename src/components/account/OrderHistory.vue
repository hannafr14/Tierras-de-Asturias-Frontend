<template>
    <section class="order-history" aria-labelledby="order-history-title">
        <h2 id="order-history-title">Historial de Pedidos</h2>
        <p class="order-history__description">
            Gestiona tus compras recientes y descarga tus facturas.
        </p>

        <div class="order-history__empty" role="status">
            Todavía no tienes pedidos.
        </div>

        <nav class="order-history__pagination" aria-label="Paginación de pedidos">
            <button type="button" disabled aria-label="Página anterior">
                &lsaquo;
            </button>
            <span aria-current="page">1</span>
            <button type="button" disabled aria-label="Página siguiente">
                &rsaquo;
            </button>
        </nav>
    </section>
</template>

<style scoped>
.order-history { margin-top: 24px; }
.order-history h2 { margin: 0 0 6px; font-size: 16px; }
.order-history__description { margin: 0; color: #4f5a4f; font-size: 14px; }

.order-history__empty {
    display: grid;
    place-items: center;
    min-height: 180px;
    margin-top: 24px;
    padding: 24px;
    border: 1px solid #cbd5c6;
    border-radius: 8px;
    color: #4f5a4f;
    text-align: center;
}

.order-history__pagination {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 24px;
}

.order-history__pagination button,
.order-history__pagination span {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border: 1px solid #cbd5c6;
    border-radius: 4px;
    font-size: 13px;
}

.order-history__pagination button { background: #fff; opacity: 0.5; }
.order-history__pagination span { background: #006727; color: #fff; }
</style>