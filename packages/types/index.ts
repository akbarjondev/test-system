export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: "ADMIN" | "STUDENT";
    createdAt: Date;
  };
}
