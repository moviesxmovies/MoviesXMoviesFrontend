import { describe, it, expect, vi } from 'vitest';
import PrimeVue from 'primevue/config';
import { ToastService } from 'primevue';

vi.mock('vue', async (importOriginal) => {
    const current = await importOriginal<typeof import('vue')>();
    return {
        ...current,
        createApp: vi.fn(() => ({
            use: vi.fn().mockReturnThis(),
            mount: vi.fn()
        }))
    };
});

vi.mock('pinia', async (importOriginal) => {
    const current = await importOriginal<typeof import('pinia')>();
    return {
        ...current,
        createPinia: vi.fn(() => ({ name: 'MockedPinia', install: vi.fn() }))
    };
});

vi.mock('../../src/router/index', () => ({
    router: { name: 'MockedRouter' }
}));

vi.mock('@primeuix/themes/material', () => ({ default: {} }));

import { createApp } from 'vue';

describe('Main Application Initialization', () => {

    it('should initialize the app with all necessary plugins', async () => {
        await import('../../src/main');

        expect(createApp).toHaveBeenCalled();

        const appInstance = vi.mocked(createApp).mock.results[0]?.value;

        if (!appInstance) {
            throw new Error('The app instance was not created correctly');
        }

        const mockedRouter = (await import('../../src/router/index')).router;
        expect(appInstance.use).toHaveBeenCalledWith(mockedRouter);

        expect(appInstance.use).toHaveBeenCalledWith(expect.objectContaining({ name: 'MockedPinia' }));

        expect(appInstance.use).toHaveBeenCalledWith(PrimeVue, expect.objectContaining({
            theme: expect.any(Object)
        }));

        expect(appInstance.use).toHaveBeenCalledWith(ToastService);
        expect(appInstance.mount).toHaveBeenCalledWith('#app');
    });
});