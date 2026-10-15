import { createRouter, createWebHistory } from 'vue-router';
import ProductsPage from '@/views/ProductsPage.vue';
import GranjasPage from '@/views/GranjasPage.vue';
import CartPage from '@/views/CartPage.vue'
import CheckoutPage from '@/views/CheckoutPage.vue';
import OrderSuccessPage from '@/views/OrderSuccessPage.vue';
import RegisterView from '@/views/RegisterView.vue';
import LoginView from '@/views/LoginView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/granjas',
    },
    {
      path: '/productos',
      name: 'productos',
      component: ProductsPage,
    },
    {
      path: '/granjas',
      name:  'granjas',
      component: GranjasPage,
    },
    {
      path: '/cart',
      name: 'cart',
      component: CartPage,
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: CheckoutPage,
    },
    {
      path: '/checkout/success',
      name: 'checkout-success',
      component: OrderSuccessPage,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
  ],
})

export default router
