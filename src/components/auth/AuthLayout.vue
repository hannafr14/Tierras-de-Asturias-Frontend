<template>
  <section class="auth-layout">
    <div class="auth-layout__hero">
      <div class="auth-layout__hero-content">
        <p class="auth-layout__brand">Tierras de Asturias</p>
        <h1>Productos locales, directamente de nuestras granjas.</h1>
        <p>
          Unete a nuestra comunidad y apoya a los productores de la tierrina.
        </p>
      </div>
    </div>

    <div class="auth-layout__content">
      <div class="auth-layout__card">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.auth-layout {
    min-height: calc(100vh - 59px - 94px);
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(420px, 1fr);
    background: #f4f6ff;

    &__hero {
        min-height: 720px;
        display: flex;
        align-items: flex-end;
        padding: 72px 76px;
        color: #ffffff;
        background-image:
        linear-gradient(180deg, rgba(0, 103, 39, 0.02), rgba(0, 103, 39, 0.86)),
        url('@/assets/register-hero-generated.png');
        background-size: cover;
        background-position: center;
    }

    &__hero-content {
        max-width: 460px;
    }

    &__brand {
        margin: 0 0 20px;
        font-size: 25px;
        font-weight: 700;
        line-height: 32px;
    }

    h1 {
        margin: 0;
        font-size: 38px;
        font-weight: 800;
        line-height: 46px;
    }

    &__hero-content p:last-child {
        margin: 28px 0 0;
        max-width: 370px;
        font-size: 16px;
        font-weight: 500;
        line-height: 25px;
    }

    &__content {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px 28px;
    }

    &__card {
        width: min(100%, 480px);
        padding: 48px;
        border-radius: 8px;
        background: #ffffff;
        box-shadow: 0 18px 45px rgba(39, 49, 65, 0.12);
    }
}

.auth-layout--top .auth-layout__content {
  align-items: flex-start;
}

@media (max-width: 900px) {
  .auth-layout {
    grid-template-columns: 1fr;

    &__hero {
        min-height: 360px;
        padding: 52px 28px;
    }

    &__content {
        padding: 38px 20px 48px;
    }
  }
}

@media (max-width: 576px) {
  .auth-layout {
    min-height: calc(100vh - 44px - 76px);

    &__hero {
        min-height: 300px;
        padding: 42px 20px;
    }

    &__brand {
        margin-bottom: 14px;
        font-size: 20px;
        line-height: 26px;
    }

    h1 {
        font-size: 30px;
        line-height: 37px;
    }

    &__hero-content p:last-child {
        margin-top: 18px;
        font-size: 14px;
        line-height: 22px;
    }

    &__content {
        align-items: flex-start;
        padding: 24px 14px 36px;
    }

    &__card {
        padding: 28px 20px;
    }
  }
}
</style>