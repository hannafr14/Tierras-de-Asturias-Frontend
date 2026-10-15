export async function registerUser(userData) {
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
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