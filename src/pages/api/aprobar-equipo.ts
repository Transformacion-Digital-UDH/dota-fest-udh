import { turso } from "@/turso";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({request}) => {  
  try {
        const data = await request.json();
        const { id } = data;

        const result = await turso.execute(
          "UPDATE equipos SET estado_pago = 'VERIFICADO' WHERE id = ?",
          [id]
        );
        return new Response(JSON.stringify({ success: true, result }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error: any) {
        console.error("Error actualizando estado_pago:", error.message);
        return new Response(JSON.stringify({ success: false, message: "Error al actualizar estado_pago." }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};