import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';
import { defineComponent, onMounted, ref } from 'vue';
import App from '@/App.vue';
import { useAuthStore } from '@/stores/authStore';
import { getCurrentUser } from '@/services/authApi';

vi.mock('@/services/authApi', () => ({
    getCurrentUser: vi.fn(),
    logoutUser: vi.fn(),
}));

const Page = { template: '<div />' };
const message = 'No se pudo comprobar tu sesión. Inténtalo de nuevo.';
let wrapper;

async function mountApp() {
    const pinia = createPinia();
    const authStore = useAuthStore(pinia);
    authStore.sessionError = message;
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/login', name: 'login', component: Page },
            { path: '/mi-cuenta', component: Page, meta: { requiresAuth: true } },
            ...['/productos', '/granjas', '/cart'].map((path) => ({
                path, component: Page,
            })),
        ],
    });
    await router.push('/login');
    await router.isReady();
    wrapper = mount(App, { global: { plugins: [pinia, router] } });
    return { authStore, router };
}

describe('App session recovery', () => {
    beforeEach(() => {
        getCurrentUser.mockReset();
        localStorage.clear();
    });
    afterEach(() => {
        wrapper?.unmount();
        wrapper = undefined;
        vi.restoreAllMocks();
    });

    it('renders the app, session error and retry button', async () => {
        await mountApp();
        expect(wrapper.get('header').text()).toContain('Tierras de Asturias');
        expect(wrapper.get('[role="alert"]').text()).toBe(message);
        expect(wrapper.get('.app-session-error button').text()).toBe('Reintentar');
    });

    it('clears the error and opens the account after recovering the session', async () => {
        getCurrentUser.mockResolvedValue({ id: 1, firstName: 'Ana', email: 'ana@example.com' });
        const { authStore, router } = await mountApp();
        await wrapper.get('.app-session-error button').trigger('click');
        await flushPromises();
        expect(getCurrentUser).toHaveBeenCalledTimes(1);
        expect(authStore.isAuthenticated).toBe(true);
        expect(wrapper.find('.app-session-error').exists()).toBe(false);
        expect(router.currentRoute.value.path).toBe('/mi-cuenta');
    });
    
    it('keeps the error visible when retry fails', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      getCurrentUser.mockRejectedValueOnce(new Error('Network error'));
      const { router } = await mountApp();

      await wrapper.get('.app-session-error button').trigger('click');
      await flushPromises();

      expect(wrapper.get('[role="alert"]').text()).toBe(message);
      expect(wrapper.get('.app-session-error button').element.disabled).toBe(false);
      expect(router.currentRoute.value.path).toBe('/login');
  });

  it('blocks repeated clicks while checking the session', async () => {
      let resolveRequest;
      getCurrentUser.mockReturnValueOnce(new Promise((resolve) => {
          resolveRequest = resolve;
      }));
      const { authStore } = await mountApp();
      const button = wrapper.get('.app-session-error button');

      await button.trigger('click');
      expect(button.element.disabled).toBe(true);
      expect(button.attributes('aria-busy')).toBe('true');
      expect(button.text()).toBe('Comprobando...');

      await button.trigger('click');
      expect(getCurrentUser).toHaveBeenCalledTimes(1);

      resolveRequest(null);
      await flushPromises();

      expect(authStore.isRestoringSession).toBe(false);
      expect(wrapper.find('.app-session-error').exists()).toBe(false);
  });

  it.each(['/login', '/mi-cuenta'])(
      'shows login after confirming an expired session from %s',
      async (path) => {
          getCurrentUser.mockResolvedValue(null);
          const { authStore, router } = await mountApp();
          await router.push(path);

          await wrapper.get('.app-session-error button').trigger('click');
          await flushPromises();

          expect(authStore.isAuthenticated).toBe(false);
          expect(wrapper.find('.app-session-error').exists()).toBe(false);
          expect(router.currentRoute.value.path).toBe('/login');
      }
  );
});

describe.each(['granjas', 'productos'])('App %s catalog scroll restoration', (catalogName) => {
    let router;
    let catalogMounts;
    const catalogPath = `/${catalogName}`;
    const otherCatalogName = catalogName === 'granjas' ? 'productos' : 'granjas';
    const otherCatalogPath = `/${otherCatalogName}`;
    const componentNames = { granjas: 'GranjasPage', productos: 'ProductsPage' };

    beforeEach(async () => {
        localStorage.clear();
        catalogMounts = 0;
        const Catalog = defineComponent({
            name: componentNames[catalogName],
            setup() {
                const search = ref('');
                onMounted(() => { catalogMounts += 1; });
                return { search };
            },
            template: '<input v-model="search" type="search" />',
        });
        const OtherCatalog = defineComponent({
            name: componentNames[otherCatalogName],
            template: '<div>Other catalog</div>',
        });
        router = createRouter({
            history: createMemoryHistory(),
            routes: [
                { path: catalogPath, name: catalogName, component: Catalog },
                { path: `${catalogPath}/:id`, component: Page },
                { path: otherCatalogPath, name: otherCatalogName, component: OtherCatalog },
            ],
        });
        await router.push(catalogPath);
        await router.isReady();
        wrapper = mount(App, {
            global: {
                plugins: [createPinia(), router],
                stubs: { HeaderComponent: true, FooterComponent: true },
            },
        });
    });

    afterEach(() => {
        wrapper?.unmount();
        wrapper = undefined;
    });

    it('opens details at the top and restores the list on browser back', async () => {
        const container = wrapper.get('.app-main').element;
        container.scrollTop = 1450;

        await router.push(`${catalogPath}/7`);
        await flushPromises();
        expect(container.scrollTop).toBe(0);

        container.scrollTop = 360;
        router.back();
        await flushPromises();

        expect(router.currentRoute.value.name).toBe(catalogName);
        expect(container.scrollTop).toBe(1450);
        expect(catalogMounts).toBe(1);
    });

    it('preserves the search and position when returning through a catalog link', async () => {
        const container = wrapper.get('.app-main').element;
        await wrapper.get('input').setValue('queso');
        container.scrollTop = 820;

        await router.push(`${catalogPath}/7`);
        await flushPromises();
        await router.push(catalogPath);
        await flushPromises();

        expect(container.scrollTop).toBe(820);
        expect(wrapper.get('input').element.value).toBe('queso');
        expect(catalogMounts).toBe(1);
    });

    it('updates the saved position and keeps the two catalog positions independent', async () => {
        const container = wrapper.get('.app-main').element;
        container.scrollTop = 500;
        await router.push(`${catalogPath}/7`);
        await router.push(catalogPath);
        await flushPromises();

        container.scrollTop = 1200;
        await router.push(`${catalogPath}/8`);
        await flushPromises();
        expect(container.scrollTop).toBe(0);
        await router.push(catalogPath);
        await flushPromises();
        expect(container.scrollTop).toBe(1200);

        await router.push(otherCatalogPath);
        await flushPromises();
        expect(container.scrollTop).toBe(0);
        container.scrollTop = 325;
        await router.push(catalogPath);
        await flushPromises();
        expect(container.scrollTop).toBe(1200);
        await router.push(otherCatalogPath);
        await flushPromises();
        expect(container.scrollTop).toBe(325);
    });
});
