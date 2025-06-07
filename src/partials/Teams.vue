<script setup>
import { ref, onMounted, computed } from "vue";
import Title from "@/components/vue/Title.vue"; 
import dotaaegis from "@/assets/videos/dota.mp4";

const equipos = ref([]);
const loading = ref(true);
const error = ref(false);

const cargarEquipos = async () => {
  loading.value = true;
  error.value = false;

  try {
    const res = await fetch("/api/registrar-equipo");
    const data = await res.json();

    if (!res.ok || !data.success) throw new Error(data.message || "Error");
    // console.log("Equipos cargados:", data.equipos);

    equipos.value = data.equipos || [];
  } catch (err) {
    console.error("Error al cargar equipos:", err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const equiposVerificados = computed(() =>
  equipos.value.filter((e) => e.estado_pago === "VERIFICADO")
);

const formatFecha = (fecha) => {
  const date = new Date(fecha);
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

onMounted(() => {
  cargarEquipos();

  // Actualización automática opcional
  // setInterval(cargarEquipos, 30000);
});
</script>

<template>
  <section
    id="equipos"
    class="text-center w-full bg-black text-white relative overflow-hidden"
    :class="[equiposVerificados.length > 0 ? 'h-auto' : 'h-full']"
  >
    <video
      :src="dotaaegis"
      class="absolute top-0 left-0 w-full h-full object-cover sm:opacity-85 opacity-40 z-0 pointer-events-none select-none"
      style="
        -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 50%, black 50%, transparent 100%);
        mask-image: linear-gradient(to bottom, transparent 0%, black 50%, black 50%, transparent 100%);
        -webkit-mask-size: 100% 100%;
        mask-size: 100% 100%;
        -webkit-mask-repeat: no-repeat;
        mask-repeat: no-repeat;
      "
      autoplay
      muted
      loop
    ></video>

    <div class="relative z-10 flex flex-col h-full">
      <Title
        class="text-4xl lg:!text-6xl 2xl:!text-7xl !animate-blurred-fade-in !font-aminute relative top-5 !tracking-[0.2em]"
        label="Equipos"
      />

      <!-- Contenedor de equipos -->
      <div class="flex-1 px-4 sm:px-6 lg:px-8 pt-20 pb-8 overflow-hidden">
        <div class="max-w-6xl mx-auto h-full">
          <!-- Estado de carga -->
          <div v-if="loading" class="text-center py-8">
            <div class="inline-block animate-rotate-360 rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p class="mt-2 text-gray-300">Cargando equipos</p>
          </div>

          <!-- Mensaje de error -->
          <div v-if="error" class="text-center py-8">
            <p class="text-red-400 mb-4">Error al cargar los equipos</p>
            <button @click="cargarEquipos" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white">
              Reintentar
            </button>
          </div>

          <!-- Lista de equipos -->
          <div v-if="!loading && !error" class="h-full">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-6 p-4">
              <div
                v-for="(equipo, index) in equiposVerificados"
                :key="equipo.id"
                class="bg-gradient-to-br from-black/50 to-black/20 hover:to-black/70 rounded-md overflow-hidden transition-all transform hover:scale-[101%] duration-500 w-full max-w-sm mx-auto border-transparent hover:border-blue-500/50 border"
              >
                <div class="relative">
                  <img src="/aegis.png" alt="Imagen del equipo" class="w-full h-auto object-contain" />
                  <div class="absolute top-5 left-5 bg-green-200/20 backdrop-blur-lg text-white border border-green-300/10 text-xs font-semibold px-2 py-1 rounded-md">
                    ✓ Verificado
                  </div>
                  <div class="absolute top-5 right-5 text-white text-xs font-semibold px-2 py-1">
                    <span>#ID: {{ index + 1 }}</span>
                  </div>

                  <div class="p-5 space-y-3">
                    <h2 class="text-xl font-bold text-white truncate uppercase">{{ equipo.nombre_equipo }}</h2>

                    <div class="flex items-center gap-2 text-base text-gray-300">
                      <strong>Capitán:</strong>
                      <span class="text-white">{{ equipo.nombre_integrante1 }}</span>
                    </div>

                    <!-- <div class="flex items-center gap-2 text-sm text-gray-300">
                      <strong>Registrado:</strong>
                      <span class="text-white text-sm">{{ formatFecha(equipo.creado_en) }}</span>
                    </div> -->
                  </div>
                </div>
              </div>
            </div>

            <!-- Si no hay equipos registrados -->
            <div class="mt-4 text-center flex justify-center h-full gap-10 relative" v-if="equiposVerificados.length === 0">
              <!-- <p class="text-gray-300 text-sm">Total equipos verificados: {{ equiposVerificados.length }}</p> -->
               <p class="text-3xl sm:text-4xl text-white font-semibold absolute bottom-1/2 left-1/2 transform -translate-x-1/2 w-full">
                No hay equipos verificados
              </p>
               <div
                class="bg-gradient-to-br from-black/20 to-black/20 hover:to-black/30 rounded-md overflow-hidden w-full max-w-sm mx-auto h-[70%] sm:h-9/12"
               >
                <span class="opacity-55 text-7xl font-semibold h-full text-center flex justify-center items-center">?</span>
               </div>
               <div
                class="bg-gradient-to-br from-black/20 to-black/20 hover:to-black/30 rounded-md overflow-hidden w-full max-w-sm mx-auto h-[70%] sm:h-9/12 sm:block hidden"
               >
                <span class="opacity-55 text-7xl font-semibold h-full text-center flex justify-center items-center">?</span>
               </div>
               <div
                class="bg-gradient-to-br from-black/20 to-black/20 hover:to-black/30 rounded-md overflow-hidden w-full max-w-sm mx-auto h-[70%] sm:h-9/12 sm:block hidden"
               >
                <span class="opacity-55 text-7xl font-semibold h-full text-center flex justify-center items-center">?</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>