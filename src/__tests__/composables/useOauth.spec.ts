import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginWithGoogle } from '../../composables/useOAUTH.ts';

describe('loginWithGoogle', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id');
    vi.stubEnv('VITE_CALLBACK_URI', 'http://localhost:5173');

    vi.stubGlobal('location', {
      href: ''
    });
  });

  it('redirects to Google OAuth URL with correct parameters', () => {
    loginWithGoogle();

    const expectedBaseUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const expectedParams = new URLSearchParams({
      client_id: 'test-client-id',
      redirect_uri: 'http://localhost:5173/accounts/google/login/callback/',
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "select_account",
    }).toString();

    const urlFinal = `${expectedBaseUrl}?${expectedParams}`;

    expect(globalThis.location.href).toBe(urlFinal);
  });
});