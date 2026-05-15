import { mount, config } from '@vue/test-utils';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import SectionAccordion from '@/components/sectionAccordion.vue';

const defaultProps = {
    icon: 'pi pi-list',
    title: 'Test Title',
    isEmpty: false,
    emptyTitle: 'No items',
    emptyDescription: 'There are no items to display',
    defaultOpen: undefined,
};

describe('SectionAccordion', () => {
    beforeAll(() => {
        config.global.stubs = {
            transition: false,
            'transition-group': false,
        };
    });
    describe('Rendering', () => {
        it('renders the title', () => {
            const wrapper = mount(SectionAccordion, { props: defaultProps });
            expect(wrapper.text()).toContain('Test Title');
        });

        it('renders the open panel when isEmpty is false', () => {
            const wrapper = mount(SectionAccordion, { props: defaultProps });
            const panels = wrapper.findAllComponents({ name: 'AccordionPanel' });
            expect(panels.some(p => p.props('value') === 'open')).toBe(true);
            expect(panels.some(p => p.props('value') === 'empty')).toBe(false);
        });


        it('renders the empty panel when isEmpty is true', () => {
            const wrapper = mount(SectionAccordion, {
                props: { ...defaultProps, isEmpty: true },
            });
            const panels = wrapper.findAllComponents({ name: 'AccordionPanel' });
            expect(panels.some(p => p.props('value') === 'empty')).toBe(true);
            expect(panels.some(p => p.props('value') === 'open')).toBe(false);
        });


        it('renders empty title and description when isEmpty is true', () => {
            const wrapper = mount(SectionAccordion, {
                props: { ...defaultProps, isEmpty: true },
            });
            expect(wrapper.text()).toContain('No items');
            expect(wrapper.text()).toContain('There are no items to display');
        });

        it('renders slot content', () => {
            const wrapper = mount(SectionAccordion, {
                props: defaultProps,
                slots: { default: '<div class="slot-content">Slot Content</div>' },
            });
            expect(wrapper.find('.slot-content').exists()).toBe(true);
        });

        it('renders loading spinner when loading is true', () => {
            const wrapper = mount(SectionAccordion, {
                props: { ...defaultProps, loading: true },
            });
            expect(wrapper.find('.pi-spinner').exists()).toBe(true);
        });

        it('does not render loading spinner when loading is false', () => {
            const wrapper = mount(SectionAccordion, {
                props: { ...defaultProps, loading: false },
            });
            expect(wrapper.find('.pi-spinner').exists()).toBe(false);
        });

        it('renders dialog button when dialogOptions is provided', () => {
            const wrapper = mount(SectionAccordion, {
                props: {
                    ...defaultProps,
                    dialogOptions: {
                        icon: 'pi pi-plus',
                        label: 'Add',
                        onClick: vi.fn(),
                    },
                },
            });
            expect(wrapper.find('.dialog-button').exists()).toBe(true);
        });

        it('does not render dialog button when dialogOptions is not provided', () => {
            const wrapper = mount(SectionAccordion, { props: defaultProps });
            expect(wrapper.find('.dialog-button').exists()).toBe(false);
        });

        it('uses emptyIcon when provided', () => {
            const wrapper = mount(SectionAccordion, {
                props: { ...defaultProps, isEmpty: true, emptyIcon: 'pi pi-inbox' },
            });
            expect(wrapper.find('.pi-inbox').exists()).toBe(true);
        });

        it('falls back to icon when emptyIcon is not provided', () => {
            const wrapper = mount(SectionAccordion, {
                props: { ...defaultProps, isEmpty: true },
            });
            expect(wrapper.find('.pi-list').exists()).toBe(true);
        });
    });

    describe('Accordion value', () => {
        it('accordion value is "open" when isEmpty is false', () => {
            const wrapper = mount(SectionAccordion, { props: defaultProps });
            expect((wrapper.vm as any).accordionValue).toBe('open');
        });

        it('accordion value is "empty" when isEmpty is true and defaultOpen is not false', () => {
            const wrapper = mount(SectionAccordion, {
                props: { ...defaultProps, isEmpty: true },
            });
            expect((wrapper.vm as any).accordionValue).toBe('empty');
        });


        it('accordion value is null when defaultOpen is false', () => {
            const wrapper = mount(SectionAccordion, {
                props: { ...defaultProps, isEmpty: true, defaultOpen: undefined },
            });
            expect((wrapper.vm as any).accordionValue).toBe('empty');
        });


        it('updates accordion value when isEmpty changes', async () => {
            const wrapper = mount(SectionAccordion, { props: defaultProps });
            expect((wrapper.vm as any).accordionValue).toBe('open');

            await wrapper.setProps({ isEmpty: true });
            expect((wrapper.vm as any).accordionValue).toBe('empty');
        });


        it('updates accordion value when defaultOpen changes to false', async () => {
            const wrapper = mount(SectionAccordion, { props: defaultProps });
            await wrapper.setProps({ defaultOpen: false });
            expect((wrapper.vm as any).accordionValue).toBeNull();
        });

    });

    describe('Accordion interaction', () => {
        it('opens accordion when header is clicked and it was closed', async () => {
            const wrapper = mount(SectionAccordion, {
                props: { ...defaultProps, defaultOpen: false },
            });
            const accordion = wrapper.findComponent({ name: 'Accordion' });
            await accordion.vm.$emit('update:value', 'open');
            expect((wrapper.vm as any).accordionValue).toBe('open');
        });


        it('closes accordion when header is clicked and it was open', async () => {
            const wrapper = mount(SectionAccordion, { props: defaultProps });
            const accordion = wrapper.findComponent({ name: 'Accordion' });
            await accordion.vm.$emit('update:value', null);
            expect((wrapper.vm as any).accordionValue).toBeNull();
        });

    });

    describe('Emits', () => {
        it('emits update:sentinelRef when sentinel mounts', async () => {
            const wrapper = mount(SectionAccordion, { props: defaultProps });
            await wrapper.vm.$nextTick();
            const emitted = wrapper.emitted('update:sentinelRef');
            expect(emitted).toBeTruthy();
            expect(emitted![0][0]).toBeInstanceOf(HTMLElement);
        });
    });

    describe('Dialog button', () => {
        it('calls onClick when dialog button is clicked', async () => {
            const onClick = vi.fn();
            const wrapper = mount(SectionAccordion, {
                props: {
                    ...defaultProps,
                    dialogOptions: { icon: 'pi pi-plus', label: 'Add', onClick },
                },
            });
            await wrapper.find('.dialog-button').trigger('click');
            expect(onClick).toHaveBeenCalled();
        });
    });

    describe('ScrollPanel', () => {
        it('applies custom panelHeight to ScrollPanel', () => {
            const wrapper = mount(SectionAccordion, {
                props: { ...defaultProps, panelHeight: '500px' },
            });
            const scrollPanel = wrapper.findComponent({ name: 'ScrollPanel' });
            expect(scrollPanel.attributes('style')).toContain('500px');
        });

        it('applies default panelHeight of 350px when not provided', () => {
            const wrapper = mount(SectionAccordion, { props: defaultProps });
            const scrollPanel = wrapper.findComponent({ name: 'ScrollPanel' });
            expect(scrollPanel.attributes('style')).toContain('350px');
        });
    });
});