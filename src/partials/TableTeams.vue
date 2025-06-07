<script setup>
import { onMounted, ref } from 'vue';

const teams = ref([]);

const fetchTeams = async () => {
  try {
    const response = await fetch('/api/obtener-registrados');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log(data)
    if (data.success) {
      teams.value = data.equipos;
    } else {
      teams.value = [];
    }
  } catch (error) {
    console.error('Error fetching teams:', error);
  }
};

const deleteteam = async (id) => {
  try {
    const response = await fetch(`/api/eliminar-equipo`, {
      method: 'DELETE',
      body: JSON.stringify({ id }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    if (data.success) {
      teams.value = teams.value.filter(team => team.id !== id);
      alert('Equipo eliminado correctamente');
    } else {
      alert('Error al eliminar el equipo');
    }
  } catch (error) {
    console.error('Error deleting team:', error);
  }
};

const aproveteam = async (id) => {
  try {
    const response = await fetch(`/api/aprobar-equipo`, {
      method: 'POST',
      body: JSON.stringify({ id }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    if (data.success) {
      teams.value = teams.value.map(team => 
        team.id === id ? { ...team, estado_pago: 'VERIFICADO' } : team
      );
      alert('Equipo aprobado correctamente');
    } else {
      alert('Error al aprobar el equipo');
    }
  } catch (error) {
    console.error('Error approving team:', error);
  }
};

onMounted(() => {
  fetchTeams();
});

</script>

<template>
  <div class="p-4 sm:p-8 bg-black min-h-screen text-white">
    <div class="overflow-x-auto">
      <table class="min-w-full border border-gray-700 rounded-lg overflow-hidden">
        <thead class="bg-gray-800">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-semibold">#ID</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">Capitán</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">Código Yape</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">Estado</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="teams.length > 0" v-for="team in teams" :key="team.id"
            class="border-t border-gray-700 hover:bg-gray-800 transition-colors">
            <td class="px-4 py-2">{{ team.id }}</td>
            <td class="px-4 py-2">{{ team.nombre_equipo }}</td>
            <td class="px-4 py-2">{{ team.nombre_integrante1 }}</td>
            <td class="px-4 py-2">{{ team.codigo_operacion_yape }}</td>
            <td class="px-4 py-2">
              <span :class="[team.estado_pago === 'PENDIENTE_VERIFICACION' ? 'text-red-400' : 'text-green-400']">
                {{ team.estado_pago }}
              </span>
            </td>
            <td class="px-4 py-2">{{
              new Date(team.creado_en).toLocaleDateString(
                "es-PE",
                {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                },
              )
            }}</td>
            <td class="px-4 py-2 flex gap-2">
              <button class="bg-red-600 text-white p-2 rounded-lg" @click="deleteteam(team.id)">Eliminar</button>
              <button class="bg-green-500 text-white p-2 rounded-lg" @click="aproveteam(team.id)">Aprobar</button>
            </td>
          </tr>
          <tr v-else>
            <td colspan="7" class="text-center py-4 text-gray-400">
              No hay equipos registrados
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
