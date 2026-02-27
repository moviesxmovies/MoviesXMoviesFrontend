export const loginWithGoogle = () => {
  const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  
  const params = {
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID, 
    redirect_uri: import.meta.env.VITE_CALLBACK_URI+'/accounts/google/login/callback/',
    response_type: "code", 
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account", 
  };
  
  globalThis.location.href = `${googleAuthUrl}?${new URLSearchParams(params).toString()}`;
};
