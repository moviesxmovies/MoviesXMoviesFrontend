import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

export const loginWithGoogle = () => {
  const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  
  const params = {
    client_id: "262110500039-v7j7cj3ip27rqmdfmetvt0mf80v0r1qd.apps.googleusercontent.com", // Obtener de Google Cloud Console
    redirect_uri: "http://localhost:5173/accounts/google/login/callback/", // Tu ruta de Vue
    response_type: "code", // OBLIGATORIO para obtener el 'code' que pide Django
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account", // FORZA a Google a mostrar el selector de cuentas
  };

  const urlCompleta = `${googleAuthUrl}?${new URLSearchParams(params).toString()}`;
  
  // Esto abre la pestaña de Google
  window.location.href = urlCompleta;
};
