import { Option, Question, Test, User } from "@test-system/database/prisma/generated/client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: "ADMIN" | "STUDENT";
  createdAt: Date;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface QuestionOption {
  text: string;
  isCorrect: boolean;
  order: number;
  explanation?: string;
}

export interface CreateQuestionRequest {
  text: string;
  options: QuestionOption[];
}

export interface UpdateQuestionRequest {
  text?: string;
  options?: QuestionOption[];
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export type TestWithRelations = Test & { createdBy?: Omit<User, "password">; questions?: (Question & { options: Option[] })[] }