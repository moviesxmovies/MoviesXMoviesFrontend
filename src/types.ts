export interface JWTPayload {
  username: string;
  boarded: boolean;
  verified: boolean;
  exp: number;
  user_id: number;
  preferred_language: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export const availableCountries = [
  { label: "ES", value: "es" },
  { label: "US", value: "en" },
  { label: "FR", value: "fr" },
  { label: "DE", value: "de" },
];
