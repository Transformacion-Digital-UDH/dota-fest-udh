import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();
        const { nombre, email, password } = data;

        // Validación básica (puedes expandir esto mucho más)
        if (!nombre || !email || !password) {
            return new Response(
                JSON.stringify({ success: false, message: 'Todos los campos son requeridos.' }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Aquí iría la lógica para guardar el usuario en una base de datos.
        // Por ahora, solo lo mostraremos en la consola del servidor.
        console.log('Nuevo registro recibido:');
        console.log('Nombre:', nombre);
        console.log('Email:', email);
        // ¡NUNCA guardes contraseñas en texto plano en una base de datos real!
        // Deberías usar hashing (ej: bcrypt).
        console.log('Password (sin hashear, solo para demo):', password);


        // Simular guardado exitoso
        return new Response(
            JSON.stringify({ success: true, message: 'Usuario registrado exitosamente.' }),
            { status: 201, headers: { "Content-Type": "application/json" } } // 201 Created
        );

    } catch (error) {
        console.error('Error en el endpoint de registro:', error);
        // Si el error es por JSON malformado
        if (error instanceof SyntaxError) {
            return new Response(
                JSON.stringify({ success: false, message: 'JSON malformado en la solicitud.' }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }
        return new Response(
            JSON.stringify({ success: false, message: 'Error interno del servidor.' }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};