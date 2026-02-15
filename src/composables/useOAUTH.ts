export const loginWithGoogle = () => {
  const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  
  const params = {
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID, 
    redirect_uri: 'http://localhost:5173/accounts/google/login/callback/',
    response_type: "code", 
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account", 
  };

  const urlCompleta = `${googleAuthUrl}?${new URLSearchParams(params).toString()}`;
  
  globalThis.location.href = urlCompleta;
};
