export async function getMyOrders(page = 0) {
    const response = await fetch(`/api/orders/mine?page=${page}`, {
        credentials: 'same-origin',
        cache: 'no-store',
    });

    if (response.status === 401) {
        throw new Error('Tu sesión ha caducado. Inicia sesión de nuevo.');
    }

    if (!response.ok) {
        throw new Error('No se pudieron cargar los pedidos. Inténtalo de nuevo.');
    }

    return response.json();
}