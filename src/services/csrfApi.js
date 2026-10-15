export async function getCsrfHeaders() {
    const response = await fetch('/api/auth/csrf', {
        credentials: 'same-origin',
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error('No se pudo preparar la solicitud. Inténtalo de nuevo.');
    }

    const { headerName, token } = await response.json();

    return {
        [headerName]: token,
    };
}