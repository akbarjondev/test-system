import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import authRoutes from "./routes/auth";
import testsRoutes from "./routes/tests";
import questionsRoutes from "./routes/questions";
import attemptsRoutes from "./routes/attempts";
import usersRoutes from "./routes/users";
import statsRoutes from "./routes/stats";
import rateLimit from "express-rate-limit";
import { validateEnv } from "./config/env";

dotenv.config();
validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());

const allowedOrigins = [
  "http://localhost:3000",
  process.env.MINI_APP_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(
  rateLimit({
    // @TODO: this is a temporary rate limit, we need to change it to a more secure one. And nned to check if the user is authenticated or not. Test with Telegram bot.
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: "Too many requests, please try again later",
      code: "TOO_MANY_REQUESTS",
    },
  }),
);

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (_, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/tests", testsRoutes);
app.use("/api", questionsRoutes);
app.use("/api", attemptsRoutes);

app.get("/health", (_, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
});
