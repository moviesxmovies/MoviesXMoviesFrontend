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
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  image: File | null;
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
  { label: "EN", value: "en" },
  { label: "FR", value: "fr" },
  { label: "DE", value: "de" },
];
