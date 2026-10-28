<template>
    <section class="checkout-payment-info">
        <h2 class="checkout-payment-info_title">Pago fuera de la web</h2>
        <p class="checkout-payment-info_text">
            Por ahora, el pago se realiza fuera de la web.
            Al confirmar el pedido no se realiza ningún cobro.
            Más adelante se añadirá el pago online con Stripe.
        </p>
    </section>
</template>
<style scoped lang="scss">
.checkout-payment-info {
    padding: 24px;
    border: 1px solid #DCE3EF;
    border-radius: 8px;
    background: #FFFFFF;
}

.checkout-payment-info_title {
    margin: 0 0 8px;
    color: #111827;
    font-size: 20px;
    font-weight: 700;
    line-height: 28px;
}

.checkout-payment-info_text {
    margin: 0;
    color: #3F4A3E;
    font-size: 15px;
    line-height: 22px;
}
</style>
