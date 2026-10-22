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

export async function getMyOrder(id) {
    const response = await fetch(
        `/api/orders/mine/${encodeURIComponent(id)}`,
        {
            credentials: 'same-origin',
            cache: 'no-store',
        }
    );

    if (response.status === 401) {
        throw new Error('Tu sesión ha caducado. Inicia sesión de nuevo.');
    }

    if (response.status === 404) {
        throw new Error('Pedido no encontrado o no disponible.');
    }

    if (!response.ok) {
        throw new Error('No se pudo cargar el pedido. Inténtalo de nuevo.');
    }

    return response.json();
}