// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    vue(),
  ], 
  server: {
    host: true,
    port: 3011
  },
  adapter: node({mode: 'standalone'}),
  output: 'server'
});
