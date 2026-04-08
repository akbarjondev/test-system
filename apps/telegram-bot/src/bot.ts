import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { Bot, Context, InlineKeyboard, session, SessionFlavor, webhookCallback } from "grammy";
import { prisma } from "@test-system/database/lib/prisma";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AttemptQuestion {
  questionId: string;
  displayOrder: number;
  text: string;
  options: { id: string; text: string; order: number }[];
}

interface SessionData {
  token?: string;
  state:
    | "idle"
    | "reg_email"
    | "reg_password"
    | "login_email"
    | "login_password";
  tempEmail?: string;
  currentAttempt?: {
    id: string;
    testId: string;
    questions: AttemptQuestion[];
    currentQuestionIndex: number;
  };
}

type Ctx = Context & SessionFlavor<SessionData>;

// ─── API helper ───────────────────────────────────────────────────────────────

const API_URL = process.env.API_URL || "http://localhost:5000";

async function api(
  method: string,
  path: string,
  body?: object,
  token?: string,
): Promise<any> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return res.json();
}

// ─── Bot setup ────────────────────────────────────────────────────────────────

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.error("TELEGRAM_BOT_TOKEN is required");
  process.exit(1);
}

const bot = new Bot<Ctx>(TOKEN as string);

const botSessionStorage = {
  async read(key: string) {
    const row = await prisma.botSession.findUnique({ where: { key } });
    return row ? (JSON.parse(row.value) as SessionData) : undefined;
  },
  async write(key: string, value: SessionData) {
    await prisma.botSession.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) },
    });
  },
  async delete(key: string) {
    await prisma.botSession.deleteMany({ where: { key } });
  },
};

bot.use(session({ initial: (): SessionData => ({ state: "idle" }), storage: botSessionStorage }));

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function showMainMenu(ctx: Ctx) {
  const keyboard = new InlineKeyboard()
    .text("📝 Testlar ro'yxati", "tests")
    .row()
    .text("🚪 Chiqish", "logout");

  await ctx.reply("Asosiy menyu:", { reply_markup: keyboard });
}

async function sendQuestion(ctx: Ctx) {
  const attempt = ctx.session.currentAttempt;
  if (!attempt) return;

  const { questions, currentQuestionIndex } = attempt;

  if (currentQuestionIndex >= questions.length) {
    await submitTest(ctx);
    return;
  }

  const question = questions[currentQuestionIndex]!;
  const total = questions.length;
  const current = currentQuestionIndex + 1;
  const labels = ["A", "B", "C", "D", "E", "F"];

  const keyboard = new InlineKeyboard();
  for (let i = 0; i < question.options.length; i++) {
    keyboard.text(`${labels[i]}) ${question.options[i]!.text}`, `ans:${i}`).row();
  }

  await ctx.reply(
    `❓ *Savol ${current}/${total}*\n\n${question.text}`,
    { reply_markup: keyboard, parse_mode: "Markdown" },
  );
}

async function submitTest(ctx: Ctx) {
  const attempt = ctx.session.currentAttempt;
  if (!attempt) return;

  const result = await api(
    "POST",
    `/api/attempts/${attempt.id}/submit`,
    {},
    ctx.session.token,
  );

  ctx.session.currentAttempt = undefined;

  if (result.error) {
    await ctx.reply(`❌ Xatolik: ${result.error}`);
    await showMainMenu(ctx);
    return;
  }

  const score = result.score ?? 0;
  const maxScore = result.maxPossibleScore ?? 0;
  const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  await ctx.reply(
    `🎉 *Test yakunlandi!*\n\n` +
      `📊 Sizning balingiz: *${score} / ${maxScore}* (${percent}%)`,
    { parse_mode: "Markdown" },
  );

  await showMainMenu(ctx);
}

// ─── Commands ─────────────────────────────────────────────────────────────────

bot.command("start", async (ctx) => {
  ctx.session.state = "idle";
  ctx.session.currentAttempt = undefined;

  if (ctx.session.token) {
    await ctx.reply("Xush kelibsiz! 👋");
    await showMainMenu(ctx);
    return;
  }

  const keyboard = new InlineKeyboard()
    .text("📝 Ro'yxatdan o'tish", "register")
    .row()
    .text("🔑 Kirish", "login");

  await ctx.reply(
    "Xush kelibsiz! 👋\n\nTest tizimiga kirish uchun ro'yxatdan o'ting yoki tizimga kiring.",
    { reply_markup: keyboard },
  );
});

// ─── Auth callbacks ───────────────────────────────────────────────────────────

bot.callbackQuery("register", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.state = "reg_email";
  await ctx.reply("Email manzilingizni kiriting:");
});

bot.callbackQuery("login", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.state = "login_email";
  await ctx.reply("Email manzilingizni kiriting:");
});

bot.callbackQuery("logout", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.token = undefined;
  ctx.session.state = "idle";
  ctx.session.currentAttempt = undefined;

  const keyboard = new InlineKeyboard()
    .text("📝 Ro'yxatdan o'tish", "register")
    .row()
    .text("🔑 Kirish", "login");

  await ctx.reply("Tizimdan chiqdingiz. 👋", { reply_markup: keyboard });
});

// ─── Text message handler (state machine) ────────────────────────────────────

bot.on("message:text", async (ctx) => {
  const text = ctx.message.text;

  if (text.startsWith("/")) return; // ignore commands

  const { state } = ctx.session;

  if (state === "reg_email") {
    ctx.session.tempEmail = text.trim();
    ctx.session.state = "reg_password";
    await ctx.reply("Parol kiriting (kamida 6 ta belgi):");
    return;
  }

  if (state === "reg_password") {
    const email = ctx.session.tempEmail!;
    const password = text;

    const data = await api("POST", "/api/auth/register", { email, password });

    if (data.error) {
      await ctx.reply(`❌ Xatolik: ${data.error}\n\n/start bosing.`);
      ctx.session.state = "idle";
      return;
    }

    ctx.session.token = data.token;
    ctx.session.state = "idle";
    ctx.session.tempEmail = undefined;
    await ctx.reply("✅ Muvaffaqiyatli ro'yxatdan o'tdingiz!");
    await showMainMenu(ctx);
    return;
  }

  if (state === "login_email") {
    ctx.session.tempEmail = text.trim();
    ctx.session.state = "login_password";
    await ctx.reply("Parolingizni kiriting:");
    return;
  }

  if (state === "login_password") {
    const email = ctx.session.tempEmail!;
    const password = text;

    const data = await api("POST", "/api/auth/login", { email, password });

    if (data.error) {
      await ctx.reply(`❌ Xatolik: ${data.error}\n\n/start bosing.`);
      ctx.session.state = "idle";
      return;
    }

    ctx.session.token = data.token;
    ctx.session.state = "idle";
    ctx.session.tempEmail = undefined;
    await ctx.reply("✅ Muvaffaqiyatli kirdingiz!");
    await showMainMenu(ctx);
    return;
  }

  // Default: show hint
  await ctx.reply('Iltimos, menyudan foydalaning yoki /start bosing.');
});

// ─── Tests list ───────────────────────────────────────────────────────────────

bot.callbackQuery("tests", async (ctx) => {
  await ctx.answerCallbackQuery();

  if (!ctx.session.token) {
    await ctx.reply("Iltimos avval tizimga kiring. /start");
    return;
  }

  const data = await api("GET", "/api/tests", undefined, ctx.session.token);

  if (data.error) {
    await ctx.reply(`❌ Xatolik: ${data.error}`);
    return;
  }

  // API returns paginated { data: [], pagination: {} } or flat array
  const tests: any[] = Array.isArray(data) ? data : (data.data ?? []);

  if (tests.length === 0) {
    await ctx.reply("Hozircha testlar yo'q.");
    return;
  }

  const keyboard = new InlineKeyboard();
  for (const test of tests) {
    keyboard.text(`📋 ${test.title}`, `test:${test.id}`).row();
  }
  keyboard.text("◀️ Orqaga", "back_main");

  await ctx.reply("Mavjud testlar:", { reply_markup: keyboard });
});

// ─── Test detail ─────────────────────────────────────────────────────────────

bot.callbackQuery(/^test:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const testId = ctx.match[1]!;

  const test = await api(
    "GET",
    `/api/tests/${testId}`,
    undefined,
    ctx.session.token,
  );

  if (test.error) {
    await ctx.reply("❌ Test topilmadi.");
    return;
  }

  const questionCount = test.questions?.length ?? 0;

  const keyboard = new InlineKeyboard()
    .text("▶️ Testni boshlash", `start:${testId}`)
    .row()
    .text("◀️ Orqaga", "tests");

  const availability = test.isAlwaysAvailable
    ? "Har doim"
    : `${new Date(test.availableFrom).toLocaleDateString("uz")} – ${new Date(test.availableUntil).toLocaleDateString("uz")}`;

  const msg =
    `📋 *${escapeMarkdown(test.title)}*\n` +
    (test.description ? `\n${escapeMarkdown(test.description)}\n` : "") +
    `\n⏱ Vaqt: ${test.timeLimitMinutes} daqiqa` +
    `\n📊 Savollar: ${questionCount}` +
    `\n🎯 Har bir savol: ${test.pointsPerQuestion} ball` +
    `\n📅 Mavjudligi: ${availability}`;

  await ctx.reply(msg, {
    reply_markup: keyboard,
    parse_mode: "Markdown",
  });
});

// ─── Start test ───────────────────────────────────────────────────────────────

bot.callbackQuery(/^start:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const testId = ctx.match[1]!;

  const attempt = await api(
    "POST",
    `/api/tests/${testId}/attempts/start`,
    {},
    ctx.session.token,
  );

  if (attempt.error) {
    await ctx.reply(`❌ Testni boshlab bo'lmadi: ${attempt.error}`);
    return;
  }

  ctx.session.currentAttempt = {
    id: attempt.id,
    testId,
    questions: attempt.questions,
    currentQuestionIndex: 0,
  };

  await ctx.reply("✅ Test boshlandi! Har bir savol uchun to'g'ri javobni tanlang.");
  await sendQuestion(ctx);
});

// ─── Answer handler ───────────────────────────────────────────────────────────

bot.callbackQuery(/^ans:(\d+)$/, async (ctx) => {
  const attempt = ctx.session.currentAttempt;

  if (!attempt) {
    await ctx.answerCallbackQuery("Test topilmadi. /start bosing.");
    return;
  }

  const optionIndex = parseInt(ctx.match[1]!);
  const question = attempt.questions[attempt.currentQuestionIndex];

  if (!question) {
    await ctx.answerCallbackQuery();
    return;
  }

  const option = question.options[optionIndex];
  if (!option) {
    await ctx.answerCallbackQuery("Noto'g'ri variant.");
    return;
  }

  await ctx.answerCallbackQuery("✓ Javob qabul qilindi");

  await api(
    "POST",
    `/api/attempts/${attempt.id}/answers`,
    { questionId: question.questionId, optionId: option.id },
    ctx.session.token,
  );

  ctx.session.currentAttempt!.currentQuestionIndex += 1;

  await sendQuestion(ctx);
});

// ─── Back to main menu ────────────────────────────────────────────────────────

bot.callbackQuery("back_main", async (ctx) => {
  await ctx.answerCallbackQuery();
  await showMainMenu(ctx);
});

// ─── Utility ─────────────────────────────────────────────────────────────────

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");
}

// ─── Start ────────────────────────────────────────────────────────────────────

if (process.env.NODE_ENV === "production") {
  const WEBHOOK_URL = process.env.WEBHOOK_URL;
  if (!WEBHOOK_URL) {
    process.exit(1);
  }

  const webhookApp = express();
  webhookApp.use(express.json());

  bot.api.setWebhook(`${WEBHOOK_URL}/webhook`);

  webhookApp.post("/webhook", webhookCallback(bot, "express"));
  webhookApp.get("/health", (_: any, res: any) => res.json({ status: "OK" }));

  const PORT = process.env.PORT || 3001;
  webhookApp.listen(PORT);
} else {
  bot.start();
}
