import { createApp } from 'vue'
import { router } from '../src/router/index'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Material from '@primeuix/themes/material';
import 'primeflex/primeflex.css'
import 'primeflex/themes/primeone-light.css'
import 'primeicons/primeicons.css'
import { ToastService } from 'primevue'

import App from './App.vue'

const app = createApp(App)

app.use(PrimeVue, {
  theme: {
    preset: Material,
  },
})
app.use(createPinia())
app.use(router)
app.use(ToastService)

app.mount('#app')
