export function validateEnv() {
  const required = ["JWT_SECRET", "DATABASE_URL"];

  for (const key of required) {
    if (!process.env[key]) {
      console.error(`[startup] Missing required env var: ${key}`);
      process.exit(1);
    }
  }

  if (
    process.env.NODE_ENV === "production" &&
    process.env.JWT_SECRET === "secret"
  ) {
    console.error("[startup] JWT_SECRET must not be 'secret' in production");
    process.exit(1);
  }
}
