import swaggerJsdoc from "swagger-jsdoc";
import yaml from "js-yaml";
import fs from "fs";
import path from "path";

// Load YAML documentation files
const docsDir = path.join(__dirname, "../docs");
const docFiles = [
  "auth.docs.yaml",
  "tests.docs.yaml",
  "questions.docs.yaml",
  "attempts.docs.yaml",
];

let paths: any = {};
for (const file of docFiles) {
  const filePath = path.join(docsDir, file);
  if (fs.existsSync(filePath)) {
    const fileContents = fs.readFileSync(filePath, "utf8");
    const doc = yaml.load(fileContents) as any;
    if (doc.paths) {
      paths = { ...paths, ...doc.paths };
    }
  }
}

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Test System API",
      version: "1.0.0",
      description:
        "API documentation for the Test System - A platform for creating and taking tests with questions, options, and time limits.",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
      {
        url: "https://api.test-system.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Enter JWT token obtained from /api/auth/login or /api/auth/register",
        },
      },
      schemas: {
        // User schemas
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["ADMIN", "STUDENT"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        // Auth schemas
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password" },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password", minLength: 6 },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            token: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
          },
        },
        // Test schemas
        Test: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            description: { type: "string", nullable: true },
            pointsPerQuestion: { type: "number", nullable: true },
            timeLimitMinutes: { type: "integer" },
            isAlwaysAvailable: { type: "boolean" },
            availableFrom: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            availableUntil: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            createdById: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        CreateTestRequest: {
          type: "object",
          required: ["title", "timeLimitMinutes"],
          properties: {
            title: { type: "string" },
            description: { type: "string", nullable: true },
            pointsPerQuestion: { type: "number", nullable: true },
            timeLimitMinutes: { type: "integer", minimum: 1 },
            isAlwaysAvailable: { type: "boolean", default: true },
            availableFrom: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            availableUntil: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
          },
        },
        UpdateTestRequest: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string", nullable: true },
            pointsPerQuestion: { type: "number", nullable: true },
            timeLimitMinutes: { type: "integer", minimum: 1 },
            isAlwaysAvailable: { type: "boolean" },
            availableFrom: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            availableUntil: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
          },
        },
        // Question schemas
        Option: {
          type: "object",
          properties: {
            id: { type: "string" },
            questionId: { type: "string" },
            text: { type: "string" },
            isCorrect: { type: "boolean" },
            order: { type: "integer" },
            explanation: { type: "string", nullable: true },
          },
        },
        QuestionOption: {
          type: "object",
          required: ["text", "isCorrect", "order"],
          properties: {
            text: { type: "string" },
            isCorrect: { type: "boolean" },
            order: { type: "integer", minimum: 0 },
            explanation: { type: "string", nullable: true },
          },
        },
        Question: {
          type: "object",
          properties: {
            id: { type: "string" },
            testId: { type: "string" },
            text: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            options: {
              type: "array",
              items: { $ref: "#/components/schemas/Option" },
            },
          },
        },
        CreateQuestionRequest: {
          type: "object",
          required: ["text", "options"],
          properties: {
            text: { type: "string" },
            options: {
              type: "array",
              items: { $ref: "#/components/schemas/QuestionOption" },
              minItems: 2,
            },
          },
        },
        UpdateQuestionRequest: {
          type: "object",
          properties: {
            text: { type: "string" },
            options: {
              type: "array",
              items: { $ref: "#/components/schemas/QuestionOption" },
              minItems: 2,
            },
          },
        },
        // Attempt schemas
        TestAttempt: {
          type: "object",
          properties: {
            id: { type: "string" },
            testId: { type: "string" },
            studentId: { type: "string" },
            startedAt: { type: "string", format: "date-time" },
            submittedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            score: { type: "number", nullable: true },
          },
        },
        StartAttemptResponse: {
          type: "object",
          properties: {
            id: { type: "string" },
            testId: { type: "string" },
            studentId: { type: "string" },
            startedAt: { type: "string", format: "date-time" },
            submittedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            score: { type: "number", nullable: true },
            timeLimitMinutes: { type: "integer" },
            timeRemaining: {
              type: "integer",
              description: "Time remaining in seconds",
            },
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  questionId: { type: "string" },
                  displayOrder: { type: "integer" },
                  text: { type: "string" },
                  options: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        text: { type: "string" },
                        order: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        SubmitAnswerRequest: {
          type: "object",
          required: ["questionId", "optionId"],
          properties: {
            questionId: { type: "string" },
            optionId: { type: "string" },
          },
        },
        SubmitTestResponse: {
          type: "object",
          properties: {
            id: { type: "string" },
            testId: { type: "string" },
            studentId: { type: "string" },
            startedAt: { type: "string", format: "date-time" },
            submittedAt: { type: "string", format: "date-time" },
            score: { type: "number" },
            maxPossibleScore: { type: "number" },
            message: { type: "string" },
          },
        },
        AttemptResult: {
          type: "object",
          properties: {
            id: { type: "string" },
            testId: { type: "string" },
            studentId: { type: "string" },
            startedAt: { type: "string", format: "date-time" },
            submittedAt: { type: "string", format: "date-time" },
            score: { type: "number" },
            maxPossibleScore: { type: "number" },
            answers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  questionId: { type: "string" },
                  questionText: { type: "string" },
                  optionId: { type: "string", nullable: true },
                  pointsEarned: { type: "number" },
                  isCorrect: { type: "boolean" },
                  correctOptionId: { type: "string" },
                },
              },
            },
          },
        },
        // Error schemas
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string", nullable: true },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Tests", description: "Test management endpoints" },
      { name: "Questions", description: "Question management endpoints" },
      { name: "Attempts", description: "Test attempt endpoints" },
    ],
  },
  apis: [], // We're loading YAML files manually, so no need for JSDoc scanning
};

// Generate base spec and merge with paths from YAML files
const baseSpec = swaggerJsdoc(options);
const swaggerSpec = {
  ...baseSpec,
  paths,
};

export { swaggerSpec };
