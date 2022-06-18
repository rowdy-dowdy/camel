import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  plugins: ['~/plugins/vue-click-outside.ts'],
  buildModules: [
    '@nuxtjs/tailwindcss',
    // '@pinia/nuxt',
    // '@nuxtjs/sitemap'
  ],
})
