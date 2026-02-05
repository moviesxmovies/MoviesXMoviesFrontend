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