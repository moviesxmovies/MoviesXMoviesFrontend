import { config } from '@/config'

export const loginWithGoogle = () => {
  const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  
  const params = {
    client_id: config.googleClientId,
    redirect_uri: config.callbackUri+'/accounts/google/login/callback/',
    response_type: "code", 
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account", 
  };
  
  globalThis.location.href = `${googleAuthUrl}?${new URLSearchParams(params).toString()}`;
};
