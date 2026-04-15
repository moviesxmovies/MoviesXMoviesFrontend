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

export interface ForgotPasswordPayload {
  forgot_password_code: string;
  new_password: string;
  email: string;
}


export interface Movie {
  id: number;
  title: string;
  slug: string;
  release_date: string;
  synopsis: string;
  cover: string;
  genres: Genre[];
  awards: any[];
  platforms: Platform[];
  actors: string[];
  directors: string[];
}

export interface Person {
  id: number;
  name: string;
  slug: string;
  image: string;
  awards: any[];
}

interface Platform {
  id: number;
  name: string;
  slug: string;
  url: null;
  image: string | null;
}

interface Genre {
  id: number;
  name: string;
  slug: string;
}