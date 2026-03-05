declare global {
  interface Window {
    __ENV__?: {
      VITE_GOOGLE_CLIENT_ID: string
      VITE_CALLBACK_URI: string
      VITE_API_URL: string
    }
  }
}

export const config = {
  googleClientId: window.__ENV__?.VITE_GOOGLE_CLIENT_ID ?? import.meta.env.VITE_GOOGLE_CLIENT_ID,
  callbackUri:    window.__ENV__?.VITE_CALLBACK_URI    ?? import.meta.env.VITE_CALLBACK_URI,
  apiUrl:         window.__ENV__?.VITE_API_URL         ?? import.meta.env.VITE_API_URL,
}