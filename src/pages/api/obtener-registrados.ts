import { turso } from "@/turso";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
    try {
        const result = await turso.execute(
            "SELECT id, nombre_equipo, nombre_integrante1, codigo_operacion_yape, estado_pago, creado_en FROM equipos ORDER BY creado_en DESC"
        );
        return new Response(JSON.stringify({ success: true, equipos: result.rows }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error: any) {
        console.error("Error obteniendo equipos:", error.message);
        return new Response(JSON.stringify({ success: false, message: "Error al obtener equipos." }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};