import dotenv from "dotenv";
dotenv.config();

import { prisma } from "@test-system/database/lib/prisma";
import { hashPassword } from "@test-system/shared/auth";

// ─── Students ────────────────────────────────────────────────────────────────

const STUDENTS = [
  { email: "student1@test.com", password: "password123" },
  { email: "student2@test.com", password: "password123" },
];

// ─── Seed data ────────────────────────────────────────────────────────────────

const TESTS: {
  title: string;
  description: string;
  questions: { text: string; options: { text: string; isCorrect: boolean }[] }[];
}[] = [
  {
    title: "Mathematics",
    description: "Basic mathematics test covering arithmetic and algebra.",
    questions: [
      {
        text: "What is 12 × 12?",
        options: [
          { text: "124", isCorrect: false },
          { text: "144", isCorrect: true },
          { text: "132", isCorrect: false },
          { text: "148", isCorrect: false },
        ],
      },
      {
        text: "What is the square root of 81?",
        options: [
          { text: "7", isCorrect: false },
          { text: "8", isCorrect: false },
          { text: "9", isCorrect: true },
          { text: "10", isCorrect: false },
        ],
      },
      {
        text: "Solve: 2x + 6 = 14. What is x?",
        options: [
          { text: "3", isCorrect: false },
          { text: "4", isCorrect: true },
          { text: "5", isCorrect: false },
          { text: "6", isCorrect: false },
        ],
      },
      {
        text: "What is 15% of 200?",
        options: [
          { text: "25", isCorrect: false },
          { text: "30", isCorrect: true },
          { text: "35", isCorrect: false },
          { text: "40", isCorrect: false },
        ],
      },
      {
        text: "What is the value of π (pi) to two decimal places?",
        options: [
          { text: "3.12", isCorrect: false },
          { text: "3.14", isCorrect: true },
          { text: "3.16", isCorrect: false },
          { text: "3.18", isCorrect: false },
        ],
      },
      {
        text: "What is 2⁸?",
        options: [
          { text: "128", isCorrect: false },
          { text: "256", isCorrect: true },
          { text: "512", isCorrect: false },
          { text: "64", isCorrect: false },
        ],
      },
      {
        text: "A triangle has angles of 60° and 80°. What is the third angle?",
        options: [
          { text: "30°", isCorrect: false },
          { text: "40°", isCorrect: true },
          { text: "50°", isCorrect: false },
          { text: "60°", isCorrect: false },
        ],
      },
      {
        text: "What is the greatest common divisor (GCD) of 48 and 36?",
        options: [
          { text: "6", isCorrect: false },
          { text: "12", isCorrect: true },
          { text: "18", isCorrect: false },
          { text: "24", isCorrect: false },
        ],
      },
      {
        text: "What is 3/4 expressed as a decimal?",
        options: [
          { text: "0.50", isCorrect: false },
          { text: "0.70", isCorrect: false },
          { text: "0.75", isCorrect: true },
          { text: "0.80", isCorrect: false },
        ],
      },
      {
        text: "If a rectangle has length 8 and width 5, what is its area?",
        options: [
          { text: "26", isCorrect: false },
          { text: "35", isCorrect: false },
          { text: "40", isCorrect: true },
          { text: "45", isCorrect: false },
        ],
      },
    ],
  },
  {
    title: "History",
    description: "World history test covering key events and figures.",
    questions: [
      {
        text: "In which year did World War II end?",
        options: [
          { text: "1943", isCorrect: false },
          { text: "1944", isCorrect: false },
          { text: "1945", isCorrect: true },
          { text: "1946", isCorrect: false },
        ],
      },
      {
        text: "Who was the first President of the United States?",
        options: [
          { text: "Thomas Jefferson", isCorrect: false },
          { text: "George Washington", isCorrect: true },
          { text: "Abraham Lincoln", isCorrect: false },
          { text: "John Adams", isCorrect: false },
        ],
      },
      {
        text: "The French Revolution began in which year?",
        options: [
          { text: "1776", isCorrect: false },
          { text: "1783", isCorrect: false },
          { text: "1789", isCorrect: true },
          { text: "1799", isCorrect: false },
        ],
      },
      {
        text: "Which ancient wonder was located in Alexandria, Egypt?",
        options: [
          { text: "The Colossus of Rhodes", isCorrect: false },
          { text: "The Hanging Gardens", isCorrect: false },
          { text: "The Great Lighthouse", isCorrect: true },
          { text: "The Statue of Zeus", isCorrect: false },
        ],
      },
      {
        text: "Who wrote 'The Communist Manifesto'?",
        options: [
          { text: "Vladimir Lenin", isCorrect: false },
          { text: "Friedrich Engels and Karl Marx", isCorrect: true },
          { text: "Leon Trotsky", isCorrect: false },
          { text: "Joseph Stalin", isCorrect: false },
        ],
      },
      {
        text: "The Berlin Wall fell in which year?",
        options: [
          { text: "1987", isCorrect: false },
          { text: "1988", isCorrect: false },
          { text: "1989", isCorrect: true },
          { text: "1991", isCorrect: false },
        ],
      },
      {
        text: "Which empire was ruled by Genghis Khan?",
        options: [
          { text: "Ottoman Empire", isCorrect: false },
          { text: "Mongol Empire", isCorrect: true },
          { text: "Roman Empire", isCorrect: false },
          { text: "Persian Empire", isCorrect: false },
        ],
      },
      {
        text: "In which year did the Titanic sink?",
        options: [
          { text: "1910", isCorrect: false },
          { text: "1911", isCorrect: false },
          { text: "1912", isCorrect: true },
          { text: "1913", isCorrect: false },
        ],
      },
      {
        text: "Who was the first human to travel to space?",
        options: [
          { text: "Neil Armstrong", isCorrect: false },
          { text: "Buzz Aldrin", isCorrect: false },
          { text: "Yuri Gagarin", isCorrect: true },
          { text: "Alan Shepard", isCorrect: false },
        ],
      },
      {
        text: "The Renaissance period originated in which country?",
        options: [
          { text: "France", isCorrect: false },
          { text: "Spain", isCorrect: false },
          { text: "Italy", isCorrect: true },
          { text: "Germany", isCorrect: false },
        ],
      },
    ],
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Seed students
  const students: { id: string; email: string }[] = [];

  for (const s of STUDENTS) {
    const existing = await prisma.user.findUnique({ where: { email: s.email } });
    if (existing) {
      students.push({ id: existing.id, email: existing.email ?? "" });
    } else {
      const hashed = await hashPassword(s.password);
      const user = await prisma.user.create({
        data: { email: s.email, password: hashed, role: "STUDENT" },
      });
      students.push({ id: user.id, email: user.email ?? "" });
    }
  }

  // Need an admin to own the tests — use first admin found or first student as fallback
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  const ownerId = admin?.id ?? students[0]!.id;

  // Seed tests
  for (const testData of TESTS) {
    const existing = await prisma.test.findFirst({ where: { title: testData.title } });
    if (existing) {
      continue;
    }

    await prisma.test.create({
      data: {
        title: testData.title,
        description: testData.description,
        pointsPerQuestion: 1,
        timeLimitMinutes: 20,
        isAlwaysAvailable: true,
        createdById: ownerId,
        questions: {
          create: testData.questions.map((q) => ({
            text: q.text,
            options: {
              create: q.options.map((opt, idx) => ({
                text: opt.text,
                isCorrect: opt.isCorrect,
                order: idx,
              })),
            },
          })),
        },
      },
    });
  }

  process.exit(0);
}

main().catch(() => {
  process.exit(1);
});
