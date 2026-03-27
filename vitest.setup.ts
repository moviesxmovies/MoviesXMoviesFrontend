import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import PrimeVue from 'primevue/config'
import { beforeEach, vi } from 'vitest'
import i18n from '@/i18n' 
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: { template: '<div></div>' } }]
})

beforeEach(() => {
  const pinia = createPinia()
  setActivePinia(pinia)

  config.global.plugins = [pinia, router, PrimeVue, i18n]
  config.global.stubs = {
    'router-link': true,
    'router-view': true
  }
})