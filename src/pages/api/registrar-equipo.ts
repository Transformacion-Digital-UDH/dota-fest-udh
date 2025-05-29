import type { APIRoute } from 'astro';
import { turso } from '../../turso';

// Función para asegurar que la tabla exista
async function ensureTableExists() {
    try {
        await turso.execute(`
        CREATE TABLE IF NOT EXISTS equipos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre_equipo TEXT NOT NULL UNIQUE,
          codigo_integrante1 TEXT,
          nombre_integrante1 TEXT,
          programa_integrante1 TEXT,
          codigo_integrante2 TEXT,
          nombre_integrante2 TEXT,
          programa_integrante2 TEXT,
          codigo_integrante3 TEXT,
          nombre_integrante3 TEXT,
          programa_integrante3 TEXT,
          codigo_integrante4 TEXT, 
          nombre_integrante4 TEXT, 
          programa_integrante4 TEXT, 
          codigo_integrante5 TEXT, 
          nombre_integrante5 TEXT, 
          programa_integrante5 TEXT, 
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
        if (import.meta.env.DEV) {
            console.log("Tabla 'equipos' asegurada en registrar-equipo.ts.");
        }
    } catch (error) {
        console.error("Error creando/asegurando tabla 'equipos':", error);
        throw new Error("No se pudo asegurar la estructura de la base de datos.");
    }
}
const tableEnsuredPromise = ensureTableExists().catch(err => {
    console.error("Fallo crítico al asegurar la tabla al cargar el módulo registrar-equipo.ts:", err.message);
});


export const POST: APIRoute = async ({ request }) => {
    try {
        await tableEnsuredPromise;

        const data = await request.json();
        const {
            nombreEquipo,
            codigoIntegrante1, nombreIntegrante1, programaIntegrante1,
            codigoIntegrante2, nombreIntegrante2, programaIntegrante2,
            codigoIntegrante3, nombreIntegrante3, programaIntegrante3,
            codigoIntegrante4, nombreIntegrante4, programaIntegrante4,
            codigoIntegrante5, nombreIntegrante5, programaIntegrante5,
        } = data;

        if (!nombreEquipo || typeof nombreEquipo !== 'string' || nombreEquipo.trim() === '') {
            return new Response(
                JSON.stringify({ success: false, message: 'El nombre del equipo es requerido y debe ser válido.' }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }
        if (!codigoIntegrante1 || !nombreIntegrante1) {
            return new Response(
                JSON.stringify({ success: false, message: 'Se requiere al menos el capitán (Integrante 1) con código y nombre.' }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const existingTeam = await turso.execute({
            sql: "SELECT id FROM equipos WHERE LOWER(nombre_equipo) = LOWER(:nombreEquipo)",
            args: { nombreEquipo: nombreEquipo.trim() }
        });

        if (existingTeam.rows.length > 0) {
            return new Response(
                JSON.stringify({ success: false, message: 'El nombre del equipo ya está registrado.' }),
                { status: 409, headers: { "Content-Type": "application/json" } }
            );
        }

        const result = await turso.execute({
            sql: `INSERT INTO equipos (
                    nombre_equipo,
                    codigo_integrante1, nombre_integrante1, programa_integrante1,
                    codigo_integrante2, nombre_integrante2, programa_integrante2,
                    codigo_integrante3, nombre_integrante3, programa_integrante3,
                    codigo_integrante4, nombre_integrante4, programa_integrante4,
                    codigo_integrante5, nombre_integrante5, programa_integrante5
                  ) VALUES (
                    :nombreEquipo,
                    :codigoIntegrante1, :nombreIntegrante1, :programaIntegrante1,
                    :codigoIntegrante2, :nombreIntegrante2, :programaIntegrante2,
                    :codigoIntegrante3, :nombreIntegrante3, :programaIntegrante3,
                    :codigoIntegrante4, :nombreIntegrante4, :programaIntegrante4,
                    :codigoIntegrante5, :nombreIntegrante5, :programaIntegrante5
                  )`,
            args: {
                nombreEquipo: nombreEquipo.trim(),
                codigoIntegrante1: codigoIntegrante1 || null, nombreIntegrante1: nombreIntegrante1 || null, programaIntegrante1: programaIntegrante1 || null,
                codigoIntegrante2: codigoIntegrante2 || null, nombreIntegrante2: nombreIntegrante2 || null, programaIntegrante2: programaIntegrante2 || null,
                codigoIntegrante3: codigoIntegrante3 || null, nombreIntegrante3: nombreIntegrante3 || null, programaIntegrante3: programaIntegrante3 || null,
                codigoIntegrante4: codigoIntegrante4 || null, nombreIntegrante4: nombreIntegrante4 || null, programaIntegrante4: programaIntegrante4 || null,
                codigoIntegrante5: codigoIntegrante5 || null, nombreIntegrante5: nombreIntegrante5 || null, programaIntegrante5: programaIntegrante5 || null,
            },
        });

        const equipoId = result.lastInsertRowid ? String(result.lastInsertRowid) : null;


        return new Response(
            JSON.stringify({ success: true, message: 'Equipo registrado exitosamente.', equipoId: equipoId }),
            { status: 201, headers: { "Content-Type": "application/json" } }
        );

    } catch (error: any) {
        console.error('Error en el endpoint de registro de equipo:', error.message, error.stack);

        if (error.message.toLowerCase().includes("unique constraint failed")) {
            return new Response(
                JSON.stringify({ success: false, message: 'El nombre del equipo ya está registrado (constraint).' }),
                { status: 409, headers: { "Content-Type": "application/json" } }
            );
        }
        if (error instanceof SyntaxError && error.message.includes("JSON")) {
            return new Response(
                JSON.stringify({ success: false, message: 'JSON malformado en la solicitud.' }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }
        if (error.message === "No se pudo asegurar la estructura de la base de datos.") {
            return new Response(
                JSON.stringify({ success: false, message: 'Error de configuración del servidor al preparar la base de datos.' }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({ success: false, message: 'Error interno del servidor al registrar el equipo.' }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};

//Endpoint GET para listar equipos

export const GET: APIRoute = async () => {
    try {
        await tableEnsuredPromise;
        const result = await turso.execute("SELECT id, nombre_equipo, nombre_integrante1, creado_en FROM equipos ORDER BY creado_en DESC LIMIT 10");
        return new Response(JSON.stringify({ success: true, equipos: result.rows }), { status: 200 });
    } catch (error: any) {
        console.error("Error obteniendo equipos:", error.message);
        return new Response(JSON.stringify({ success: false, message: "Error al obtener equipos." }), { status: 500 });
    }
};