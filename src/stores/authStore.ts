import { defineStore } from "pinia";
import { jwtDecode } from "jwt-decode";
import type { JWTPayload } from "../types";

export const useAuthStore = defineStore("auth", {
  state: () => {
    let token = null;
    let refreshToken = null;
    try {
      token = localStorage.getItem("access_token");
      refreshToken = localStorage.getItem("refresh_token");
    } catch {
      // Testing environment without localStorage, or SSR. Tokens will be null, which is fine.
    }
    return { token, refreshToken };
  },

  getters: {
    user: (state): JWTPayload | null => {
      if (!state.token) return null;
      return jwtDecode<JWTPayload>(state.token);
    },
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    isTokenExpired(): boolean {
      if (!this.token) return true;
      try {
        const decoded = jwtDecode<JWTPayload>(this.token);
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime + 10;
      } catch {
        return true;
      }
    },
    setTokens(access: string, refresh?: string) {
      this.token = access;
      localStorage.setItem("access_token", access);
      if (refresh) {
        this.refreshToken = refresh;
        localStorage.setItem("refresh_token", refresh);
      }
    },
    logout() {
      this.token = null;
      this.refreshToken = null;
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    },
  },
});
