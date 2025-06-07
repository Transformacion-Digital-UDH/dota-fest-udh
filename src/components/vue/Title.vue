<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  className: {
    type: String,
    default: "",
  },
});
</script>

<template>

  <h1 :class="['uppercase text-5xl xs:text-5xl lg:text-8xl 2xl:text-[7rem] font-extrabold font-alifira tracking-wider animate-fade-in-up animate-delay-300', className]">
    {{ label }}
  </h1>
</template>
