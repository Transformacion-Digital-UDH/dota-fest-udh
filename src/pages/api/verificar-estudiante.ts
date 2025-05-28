import type { APIRoute } from 'astro';

const UDH_API_BASE_URL = "http://www.udh.edu.pe/websauh/secretaria_general/gradosytitulos/datos_estudiante_json.aspx?_c_3456=";

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { codigoEstudiante } = body;

        if (!codigoEstudiante) {
            return new Response(
                JSON.stringify({ success: false, message: 'Código de estudiante es requerido.' }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const response = await fetch(`${UDH_API_BASE_URL}${codigoEstudiante}`);

        if (!response.ok) {
            console.error(`Error desde API UDH: ${response.status} ${response.statusText}`);
            return new Response(
                JSON.stringify({ success: false, message: `Error al contactar servicio externo: ${response.status}` }),
                { status: response.status, headers: { "Content-Type": "application/json" } }
            );
        }

        const externalData = await response.json();

        if (externalData && externalData.length > 0) {
            const estudianteOriginal = externalData[0];
            // Crear un nuevo objeto solo con los campos deseados
            const estudianteFiltrado = {
                stu_nombres: estudianteOriginal.stu_nombres,
                stu_apellido_paterno: estudianteOriginal.stu_apellido_paterno,
                stu_apellido_materno: estudianteOriginal.stu_apellido_materno,
                stu_programa: estudianteOriginal.stu_programa,
                // Opcional: puedes incluir el código para referencia si lo necesitas en el frontend
                // stu_codigo: estudianteOriginal.stu_codigo 
            };

            return new Response(
                JSON.stringify({ success: true, data: [estudianteFiltrado] }), // Enviar el objeto filtrado
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        } else {
            // Si la API externa no devuelve datos o un array vacío
            return new Response(
                JSON.stringify({ success: false, message: 'No se encontraron datos para el código proporcionado.' }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

    } catch (error: any) {
        console.error('Error en el proxy API /api/verificar-estudiante:', error);
        if (error instanceof SyntaxError && error.message.includes("JSON")) {
            return new Response(
                JSON.stringify({ success: false, message: 'JSON malformado en la solicitud.' }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }
        return new Response(
            JSON.stringify({ success: false, message: 'Error interno del servidor en el proxy.' }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};