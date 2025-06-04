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
          codigo_operacion_yape TEXT,
          estado_pago TEXT DEFAULT 'PENDIENTE_VERIFICACION',
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
            codigoOperacionYape,
        } = data;

        if (!nombreEquipo || typeof nombreEquipo !== 'string' || nombreEquipo.trim() === '') {
            return new Response(
                JSON.stringify({ success: false, message: 'El nombre del equipo es requerido y debe ser válido.' }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        if (!codigoOperacionYape || typeof codigoOperacionYape !== 'string' || codigoOperacionYape.trim() === '') {
            return new Response(
                JSON.stringify({ success: false, message: 'El código de operación de Yape es requerido.' }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }
        const codigoOperacionTrimmed = codigoOperacionYape.trim();

        // Validación para cada integrante
        const integrantes = [
            { codigo: codigoIntegrante1, nombre: nombreIntegrante1, programa: programaIntegrante1, numero: 1 },
            { codigo: codigoIntegrante2, nombre: nombreIntegrante2, programa: programaIntegrante2, numero: 2 },
            { codigo: codigoIntegrante3, nombre: nombreIntegrante3, programa: programaIntegrante3, numero: 3 },
            { codigo: codigoIntegrante4, nombre: nombreIntegrante4, programa: programaIntegrante4, numero: 4 },
            { codigo: codigoIntegrante5, nombre: nombreIntegrante5, programa: programaIntegrante5, numero: 5 },
        ];

        const nombresProgramas = new Set<string>();
        const codigosParaValidar = [];

        for (const integrante of integrantes) {
            const codigoTrimmed = integrante.codigo ? String(integrante.codigo).trim() : "";
            const nombreTrimmed = integrante.nombre ? String(integrante.nombre).trim() : "";
            const programaTrimmed = integrante.programa ? String(integrante.programa).trim() : "";

            if (!codigoTrimmed) {
                return new Response(
                    JSON.stringify({ success: false, message: `El código del integrante ${integrante.numero} es requerido.` }),
                    { status: 400, headers: { "Content-Type": "application/json" } }
                );
            }

            codigosParaValidar.push(codigoTrimmed);

            if (!nombreTrimmed) {
                return new Response(
                    JSON.stringify({ success: false, message: `El nombre del integrante ${integrante.numero} es requerido (asegúrate de verificar el código).` }),
                    { status: 400, headers: { "Content-Type": "application/json" } }
                );
            }
            if (!programaTrimmed) {
                return new Response(
                    JSON.stringify({ success: false, message: `El programa del integrante ${integrante.numero} es requerido (asegúrate de verificar el código).` }),
                    { status: 400, headers: { "Content-Type": "application/json" } }
                );
            }

            // Para validación de nombre y programa únicos
            const nombreProgramaKey = `${nombreTrimmed.toLowerCase()}|${programaTrimmed.toLowerCase()}`;
            nombresProgramas.add(nombreProgramaKey);
        }

        // Validación de códigos de integrantes únicos dentro del equipo
        const codigosIntegrantes = integrantes.map(i => (i.codigo ? String(i.codigo).trim() : ""));
        const codigosUnicos = new Set(codigosIntegrantes);
        if (codigosUnicos.size !== codigosIntegrantes.length) {
            return new Response(
                JSON.stringify({ success: false, message: 'Los códigos de los integrantes del equipo deben ser diferentes entre sí.' }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }


        if (nombresProgramas.size < integrantes.length) {
            return new Response(
                JSON.stringify({ success: false, message: 'Los datos (nombre y programa) de los integrantes del equipo deben ser diferentes entre sí. Parece que un estudiante está registrado más de una vez.' }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        for (const codigoEstudiante of codigosParaValidar) {
            const checkEstudianteSql = `
                SELECT id FROM equipos WHERE
                (codigo_integrante1 = :codigo OR
                codigo_integrante2 = :codigo OR
                codigo_integrante3 = :codigo OR
                codigo_integrante4 = :codigo OR
                codigo_integrante5 = :codigo)
                AND estado_pago != 'RECHAZADO'
                LIMIT 1;
            `;
            const estudianteExistente = await turso.execute({
                sql: checkEstudianteSql,
                args: { codigo: codigoEstudiante }
            });

            if (estudianteExistente.rows.length > 0) {
                return new Response(
                    JSON.stringify({ success: false, message: `El estudiante con código ${codigoEstudiante} ya está registrado en otro equipo.` }),
                    { status: 409, headers: { "Content-Type": "application/json" } } // 409 Conflict es apropiado aquí
                );
            }
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
                    codigo_integrante5, nombre_integrante5, programa_integrante5,
                    codigo_operacion_yape, estado_pago
                  ) VALUES (
                    :nombreEquipo,
                    :codigoIntegrante1, :nombreIntegrante1, :programaIntegrante1,
                    :codigoIntegrante2, :nombreIntegrante2, :programaIntegrante2,
                    :codigoIntegrante3, :nombreIntegrante3, :programaIntegrante3,
                    :codigoIntegrante4, :nombreIntegrante4, :programaIntegrante4,
                    :codigoIntegrante5, :nombreIntegrante5, :programaIntegrante5,
                    :codigoOperacionYape, 'PENDIENTE_VERIFICACION'
                  ) RETURNING id;`,
            args: {
                nombreEquipo: nombreEquipo.trim(),
                codigoIntegrante1: String(codigoIntegrante1 || "").trim() || null, nombreIntegrante1: String(nombreIntegrante1 || "").trim() || null, programaIntegrante1: String(programaIntegrante1 || "").trim() || null,
                codigoIntegrante2: String(codigoIntegrante2 || "").trim() || null, nombreIntegrante2: String(nombreIntegrante2 || "").trim() || null, programaIntegrante2: String(programaIntegrante2 || "").trim() || null,
                codigoIntegrante3: String(codigoIntegrante3 || "").trim() || null, nombreIntegrante3: String(nombreIntegrante3 || "").trim() || null, programaIntegrante3: String(programaIntegrante3 || "").trim() || null,
                codigoIntegrante4: String(codigoIntegrante4 || "").trim() || null, nombreIntegrante4: String(nombreIntegrante4 || "").trim() || null, programaIntegrante4: String(programaIntegrante4 || "").trim() || null,
                codigoIntegrante5: String(codigoIntegrante5 || "").trim() || null, nombreIntegrante5: String(nombreIntegrante5 || "").trim() || null, programaIntegrante5: String(programaIntegrante5 || "").trim() || null,
                codigoOperacionYape: codigoOperacionTrimmed,
            },
        });

        const equipoId = result.rows.length > 0 && result.rows[0].id ? String(result.rows[0].id) : null;

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