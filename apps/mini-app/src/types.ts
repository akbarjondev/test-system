export type Screen =
  | "loading"
  | "error"
  | "home"
  | "tests-list"
  | "test-unlock"
  | "test-detail"
  | "test-taking"
  | "results";

export interface TestItem {
  id: string;
  title: string;
  description: string | null;
  timeLimitMinutes: number | null;
  pointsPerQuestion: number;
  testPassword: string | null;
  isAlwaysAvailable: boolean;
  availableFrom: string | null;
  availableUntil: string | null;
  _count: { questions: number };
}

export interface AttemptQuestion {
  questionId: string;
  displayOrder: number;
  text: string;
  options: { id: string; text: string; order: number }[];
}

export interface AttemptResult {
  score: number;
  maxScore: number;
  passed: boolean | null;
  timedOut?: boolean;
}
