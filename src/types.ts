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

export interface MovieDynamicPagination {
  results: Movie[];
  next_last_id: number;
}

export interface MoviePagination {
  results: Movie[];
  total_pages: number;
  count: number;
  has_next: boolean;
  has_previous: boolean;
  current_page: number;
}

interface Platform {
  id: number;
  name: string;
  slug: string;
  url: null;
  image: string;
}

interface Genre {
  id: number;
  name: string;
  slug: string;
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
  biography: string;
  birthday: string;
  deathday: string;
  gender: number;
}

export interface User {
  id: number;
  username: string;
  bio: string;
  friendship: Friendship;
  picture: string;
}
interface Friendship {
  is_friend: boolean;
  status: string;
}
interface Platform {
  id: number;
  name: string;
  slug: string;
  url: null;
  image: string;
}

interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface Rating {
  id: number;
  rating: number;
  user: string;
  movie: string;
  created_at: string;
}

export interface MovieListPagination {
  results: MovieList[];
  total_pages: number;
  count: number;
  has_next: boolean;
  has_previous: boolean;
  current_page: number;
}

export interface MovieList {
  id: number;
  name: string;
  slug: string;
  description: string;
  privacity: string;
  user: string;
  movies: string[];
  created_at: string;
  updated_at: string;
}

export type UserMovieList = {
  list: MovieList;
  containsMovie?: boolean;
};

export type CreateList = {
  name: string,
  description?: string,
  privacity: string,
}