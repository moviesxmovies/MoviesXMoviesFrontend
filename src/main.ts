import { createApp } from 'vue'
import { router } from '../src/router/index'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Material from '../node_modules/@primeuix/themes/dist/material'
import '../node_modules/primeicons/primeicons.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/700.css'

import App from './App.vue'

const app = createApp(App)

app.use(PrimeVue, {
  theme: {
    preset: Material,
  },
})
app.use(createPinia())
app.use(router)

app.mount('#app')
