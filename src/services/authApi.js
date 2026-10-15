import { getCsrfHeaders } from '@/services/csrfApi';

export async function registerUser(userData) {
    const csrfHeaders = await getCsrfHeaders();

    const response = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
        },
        body: JSON.stringify(userData),
    });

    if (response.status === 409) {
        throw new Error('Este correo electrónico ya está registrado.');
    }

    if (response.status === 400) {
        throw new Error('Revisa los datos de registro.');
    }

    if (!response.ok) {
        throw new Error('No se pudo crear la cuenta. Inténtalo de nuevo.');
    }

    return response.json();
}

export async function loginUser(credentials) {
    const csrfHeaders = await getCsrfHeaders();

    const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
        },
        body: JSON.stringify(credentials),
    });

    if (response.status === 401) {
        throw new Error('El correo electrónico o la contraseña son incorrectos.');
    }

    if (response.status === 400) {
        throw new Error('Revisa los datos de acceso.');
    }

    if (!response.ok) {
        throw new Error('No se pudo iniciar sesión. Inténtalo de nuevo.');
    }

    return response.json();
}

export async function getCurrentUser() {
    const response = await fetch('/api/auth/me', {
        credentials: 'same-origin',
        cache: 'no-store',
    });

    if (response.status === 401) {
        return null;
    }

    if (!response.ok) {
        throw new Error('No se pudo comprobar la sesión.');
    }

    return response.json();
}
