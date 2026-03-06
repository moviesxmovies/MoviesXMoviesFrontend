export interface JWTPayload {
  username: string;
  boarded: boolean;
  verified: boolean;
  exp: number; 
  user_id: number;
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