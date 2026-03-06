import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import LangComponent from '@/components/langComponent.vue'

vi.mock('@/stores/langStore', () => ({
    useLangStore: () => ({
        language: 'en',
        setLanguage: vi.fn()
    })
}))

describe('LangComponent', () => {

    beforeEach(() => {
        setActivePinia(createPinia())
    })

    it('SelectedCountry is null by default', () => {
        const wrapper = mount(LangComponent)
        expect(wrapper.vm.selectedCountry).toBeNull()
    })

    it('contains ES and US countries', () => {
        const wrapper = mount(LangComponent)
        expect(wrapper.vm.countries).toContain('ES')
        expect(wrapper.vm.countries).toContain('US')
        expect(wrapper.vm.countries).toContain('FR')
        expect(wrapper.vm.countries).toContain('DE')
        expect(wrapper.vm.countries).toHaveLength(4)
    })

    it('getFlagUrl returns correct URL', () => {
        const wrapper = mount(LangComponent)
        expect(wrapper.vm.getFlagUrl('ES')).toBe('https://flagcdn.com/w20/es.png')
        expect(wrapper.vm.getFlagUrl('US')).toBe('https://flagcdn.com/w20/us.png')
        expect(wrapper.vm.getFlagUrl('FR')).toBe('https://flagcdn.com/w20/fr.png')
        expect(wrapper.vm.getFlagUrl('DE')).toBe('https://flagcdn.com/w20/de.png')
    })
})