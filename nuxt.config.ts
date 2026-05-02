export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/color-mode'],
  
  colorMode: {
    classSuffix: '',
    storageKey: 'theme'
  },
  
  app: {
    head: {
      title: '状态监控',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '服务状态监控面板' }
      ]
    }
  },
  
  runtimeConfig: {
    public: {
      apiUrl: '',
      apiKey: ''
    }
  }
})