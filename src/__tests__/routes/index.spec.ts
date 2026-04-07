import { describe, it, expect, vi, beforeEach } from 'vitest';
import { router } from '../../router/index';
import { useAuthStore } from '../../stores/authStore';

vi.mock('../../views/OnBoardingView.vue', () => ({ default: {} }));
vi.mock('../../views/VerifyEmail.vue', () => ({ default: {} }));
vi.mock('../../views/LoginView.vue', () => ({ default: {} }));
vi.mock('../../views/SignupView.vue', () => ({ default: {} }));
vi.mock('../../views/HomeView.vue', () => ({ default: {} }));
vi.mock('../../views/WelcomeView.vue', () => ({ default: {} }));
vi.mock('../../views/NotFoundView.vue', () => ({ default: {} }));
vi.mock('../../views/ForgotPasswordView.vue', () => ({ default: {} }));
vi.mock('../../views/ResetPasswordView.vue', () => ({ default: {} }));
vi.mock('../../views/CheckEmailView.vue', () => ({ default: {} }));

vi.mock('../../stores/authStore', () => ({
    useAuthStore: vi.fn()
}));
let vi_storage: Record<string, string> = {};
vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => vi_storage[key] || null),
    setItem: vi.fn((key: string, value: string) => { vi_storage[key] = value.toString(); }),
    removeItem: vi.fn((key: string) => { delete vi_storage[key]; }),
    clear: vi.fn(() => { vi_storage = {}; }),
});

describe('Router & LocalStorage Isolation', () => {

    beforeEach(async () => {
        vi.clearAllMocks();
        localStorage.clear();
        vi.mocked(useAuthStore).mockImplementation(() => ({
            isAuthenticated: false,
            user: null
        } as any));
        await router.push('/');
    });

    it('should redirect to /login if there is no session', async () => {
        vi.mocked(useAuthStore).mockReturnValue({
            isAuthenticated: false,
            user: null
        } as any);

        await router.push('/home');

        expect(router.currentRoute.value.path).toBe('/login');

        expect(useAuthStore).toHaveBeenCalled();
    });

    it('should allow navigation if the store confirms authentication', async () => {
        vi.mocked(useAuthStore).mockReturnValue({
            isAuthenticated: true,
            user: { verified: true, boarded: true }
        } as any);

        await router.push('/home');

        expect(router.currentRoute.value.path).toBe('/home');
    });

    it('should handle the unverified email flow regardless of storage', async () => {
        vi.mocked(useAuthStore).mockReturnValue({
            isAuthenticated: true,
            user: { verified: false, boarded: false }
        } as any);

        await router.push('/home');

        expect(router.currentRoute.value.path).toBe('/verify-email');
    });
    it('should redirect to onboarding if user is verified but not boarded', async () => {
        vi.mocked(useAuthStore).mockReturnValue({
            isAuthenticated: true,
            user: { verified: true, boarded: false }
        } as any);

        await router.push('/home');

        expect(router.currentRoute.value.path).toBe('/onboarding');
    });
    it('should redirect to home if user is verified and boarded but tries to access login/signup/verify-email/onboarding', async () => {
        vi.mocked(useAuthStore).mockReturnValue({
            isAuthenticated: true,
            user: { verified: true, boarded: true }
        } as any);

        await router.push('/login');
        expect(router.currentRoute.value.path).toBe('/home');

        await router.push('/signup');
        expect(router.currentRoute.value.path).toBe('/home');

        await router.push('/verify-email');
        expect(router.currentRoute.value.path).toBe('/home');

        await router.push('/onboarding');
        expect(router.currentRoute.value.path).toBe('/home');
    });

    it('should allow access to public routes without authentication', async () => {
        vi.mocked(useAuthStore).mockReturnValue({
            isAuthenticated: false,
            user: null
        } as any);

        await router.push('/');

        expect(router.currentRoute.value.path).toBe('/');

        await router.push('/login');

        expect(router.currentRoute.value.path).toBe('/login');

        await router.push('/signup');

        expect(router.currentRoute.value.path).toBe('/signup');

        await router.push('/accounts/google/login/callback/');

        expect(router.currentRoute.value.path).toBe('/accounts/google/login/callback/');

        await router.push('/non-existent');

        expect(router.currentRoute.value.path).toBe('/non-existent');

        await router.push('/forgot-password');

        expect(router.currentRoute.value.path).toBe('/forgot-password');

        await router.push('/reset-password');

        expect(router.currentRoute.value.path).toBe('/reset-password');

        await router.push('/check-email');

        expect(router.currentRoute.value.path).toBe('/check-email');
    });
});