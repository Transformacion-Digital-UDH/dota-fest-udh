import { turso } from "@/turso";
import type { APIRoute } from "astro";

export const DELETE: APIRoute = async ({request}) => {  
  try {
        const data = await request.json();
        const { id } = data;

        const result = await turso.execute(
            "DELETE FROM equipos WHERE id = ?",
            [id]
        );
        return new Response(JSON.stringify({
            success: true,
            message: `Equipo con ID ${id} eliminado.`,
            changes: result?.rowsAffected ?? 0
          }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error: any) {
        console.error("Error eliminando equipo:", error.message);
        return new Response(JSON.stringify({ success: false, message: "Error al eliminar el equipo." }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};