import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import OauthCallback from '@/views/OauthCallbackView.vue'; 
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';

// 1. Mock de dependencias
vi.mock('axios');
const mockPush = vi.fn();
vi.mock('vue-router', () => ({ useRouter: () => ({ push: mockPush }) }));
const mockToast = { add: vi.fn() };
vi.mock('primevue/usetoast', () => ({ useToast: () => mockToast }));
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({ handleLogin: vi.fn() })
}));

describe('OauthCallback logic', () => {
  const mockPush = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup de variables de entorno para el test
    vi.stubEnv('VITE_URL_PROTOCOL', 'http://localhost:8000');
    
    // Mock de useRouter
    (useRouter as any).mockReturnValue({ push: mockPush });
  });

  it('debería redirigir a /login si no hay código en la URL', async () => {
    // Mock de useRoute sin query params
    (useRoute as any).mockReturnValue({ query: {} });

    mount(OauthCallback);

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('debería hacer login con éxito cuando el servidor responde 200', async () => {
    // Mock de useRoute con código
    (useRoute as any).mockReturnValue({ query: { code: 'google-code-123' } });
    
    // Simular respuesta exitosa de axios
    (axios.post as any).mockResolvedValue({
      data: { access: 'token-acc', refresh: 'token-ref' }
    });

    mount(OauthCallback);
    
    // Esperamos a que se resuelvan las promesas
    await vi.dynamicImportSettled();

    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:8000/api/oauth/google/',
      { code: 'google-code-123' }
    );
    // Aquí podrías verificar si el store fue llamado (si mockeas el store más a fondo)
  });

  it('debería mostrar error y redirigir si el código es inválido (400)', async () => {
    (useRoute as any).mockReturnValue({ query: { code: 'bad-code' } });
    
    // Simular error 400
    (axios.post as any).mockRejectedValue({
      response: { status: 400 }
    });

    mount(OauthCallback);
    await vi.dynamicImportSettled();

    expect(mockPush).toHaveBeenCalledWith('/login', {
      query: { error: 'failed_google_auth' }
    });
  });
});