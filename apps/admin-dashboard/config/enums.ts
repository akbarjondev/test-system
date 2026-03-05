export enum ROUTES {
  ROOT = "/",
  DASHBOARD = "/dashboard",
  LOGIN = "/auth/login",
  REGISTER = "/auth/register",
  TESTS = "/dashboard/tests",
  STUDENTS = "/dashboard/students",
  STUDENT_DASHBOARD = "/dashboard/student",
  TESTS_NEW = "/dashboard/tests/new",
}

export enum API_ROUTES {
  LOGIN = "/api/auth/login",
  REGISTER = "/api/auth/register",
  TESTS = "/api/tests",
}

export enum UserRole {
  ADMIN = "ADMIN",
  STUDENT = "STUDENT",
}
