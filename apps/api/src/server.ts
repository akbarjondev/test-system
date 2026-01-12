import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import testsRoutes from "./routes/tests";
import questionsRoutes from "./routes/questions";
import attemptsRoutes from "./routes/attempts";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
// app.use("/api/users", usersRoutes); // to create student users
app.use("/api/tests", testsRoutes);
app.use("/api", questionsRoutes);
app.use("/api", attemptsRoutes);

app.get("/health", (_, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
});
