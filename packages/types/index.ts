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
