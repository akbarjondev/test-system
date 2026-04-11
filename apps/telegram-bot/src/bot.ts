import dotenv from "dotenv";
dotenv.config();

import express from "express";
import {
  Bot,
  Context,
  InlineKeyboard,
  session,
  SessionFlavor,
  webhookCallback,
} from "grammy";
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
  fullName?: string;
  step?: "awaiting_name" | "awaiting_phone" | "awaiting_test_code" | "ready";
  unlockedTestId?: string;
  lastBotMessageId?: number;
  currentAttempt?: {
    id: string;
    testId: string;
    questions: AttemptQuestion[];
    currentQuestionIndex: number;
  };
  currentQuestionText?: string;
  currentOptions?: Array<{ label: string; text: string; id: string }>;
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

bot.use(
  session({ initial: (): SessionData => ({}), storage: botSessionStorage }),
);

// ─── Global error handler ─────────────────────────────────────────────────────

bot.catch((err) => {
  try {
    err.ctx.reply("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
  } catch {
    // ignore reply failure
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function showMainMenu(ctx: Ctx) {
  const keyboard = new InlineKeyboard()
    .text("🚀 Testni boshlash", "start_test_flow")
    .row()
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

  const questionText = `❓ *Savol ${current}/${total}*\n\n${escapeMarkdown(question.text)}`;

  ctx.session.currentQuestionText = questionText;
  ctx.session.currentOptions = question.options.map((opt, i) => ({
    label: labels[i] ?? String(i + 1),
    text: opt.text,
    id: opt.id,
  }));

  const keyboard = new InlineKeyboard();
  for (let i = 0; i < question.options.length; i++) {
    keyboard
      .text(`${labels[i]}) ${question.options[i]!.text}`, `ans:${i}`)
      .row();
  }

  await ctx.reply(questionText, {
    reply_markup: keyboard,
    parse_mode: "Markdown",
  });
}

async function showAlreadyAttemptedMessage(ctx: Ctx, testId: string) {
  try {
    // Fetch student's previous attempts to find score for this test
    const attemptsData = await api(
      "GET",
      "/api/attempts/my-attempts",
      undefined,
      ctx.session.token,
    );
    const allAttempts: any[] = Array.isArray(attemptsData) ? attemptsData : [];
    const prevAttempt = allAttempts.find(
      (a: any) => a.testId === testId && a.submittedAt !== null,
    );

    if (prevAttempt && prevAttempt.score !== null) {
      // Fetch test details to get question count for maxScore calculation
      const test = await api(
        "GET",
        `/api/tests/${testId}`,
        undefined,
        ctx.session.token,
      );
      if (!test || test.error) {
        await ctx.reply(
          `✅ Siz bu testni allaqachon topshirgansiz!\n\nSizning natijangiz: ${prevAttempt.score}`,
        );
        await showMainMenu(ctx);
        return;
      }
      const questionCount: number = test.questions?.length ?? 0;
      const pointsPerQ: number = test.pointsPerQuestion ?? 1;
      const score: number = prevAttempt.score ?? 0;
      const maxScore = questionCount * pointsPerQ;
      const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

      await ctx.reply(
        `✅ Siz bu testni allaqachon topshirgansiz!\n\nSizning natijangiz: ${score} / ${maxScore} (${percent}%)`,
      );
    } else {
      await ctx.reply("✅ Siz bu testni allaqachon topshirgansiz!");
    }
  } catch {
    await ctx.reply("✅ Siz bu testni allaqachon topshirgansiz!");
  }

  await showMainMenu(ctx);
}

async function submitTest(ctx: Ctx) {
  const attempt = ctx.session.currentAttempt;
  if (!attempt) return;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (ctx.session.token)
    headers["Authorization"] = `Bearer ${ctx.session.token}`;

  const response = await fetch(`${API_URL}/api/attempts/${attempt.id}/submit`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });
  const result = (await response.json()) as any;

  if (response.status === 403 && result.code === "TIME_LIMIT_EXCEEDED") {
    ctx.session.currentAttempt = undefined;
    await ctx.reply("⏰ Vaqt tugadi! Afsuski, javoblaringiz qabul qilinmadi.");
    await showMainMenu(ctx);
    return;
  }

  if (result.error) {
    await ctx.reply(`❌ Xatolik: ${result.error}`);
    await showMainMenu(ctx);
    return;
  }

  ctx.session.currentAttempt = undefined;

  const score = result.totalScore ?? result.score ?? 0;
  const maxScore = result.maxPossibleScore ?? 0;
  const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  let message = `🎉 Test yakunlandi!\n\nSizning balingiz: ${score} / ${maxScore} (${percent}%)`;

  if (result.passed === true) {
    message += "\n\n✅ Natija: O'tdingiz!";
  } else if (result.passed === false) {
    message += "\n\n❌ Natija: O'tmadingiz.";
  }

  await ctx.reply(message);

  await showMainMenu(ctx);
}

// ─── Commands ─────────────────────────────────────────────────────────────────

bot.command("start", async (ctx) => {
  ctx.session.currentAttempt = undefined;

  if (ctx.session.token) {
    await ctx.reply("Xush kelibsiz! 👋");
    await showMainMenu(ctx);
    return;
  }

  ctx.session.step = "awaiting_name";
  ctx.session.fullName = undefined;
  const sentName = await ctx.reply("Ismingiz va familiyangizni kiriting:");
  ctx.session.lastBotMessageId = sentName.message_id;
});

// ─── Auth callbacks ───────────────────────────────────────────────────────────

bot.callbackQuery("logout", async (ctx) => {
  try {
    try {
      await ctx.answerCallbackQuery();
    } catch {
      // Query expired — ignore silently
    }
    ctx.session.token = undefined;
    ctx.session.step = "awaiting_name";
    ctx.session.fullName = undefined;
    ctx.session.currentAttempt = undefined;

    await ctx.reply(
      "Tizimdan chiqdingiz. 👋\n\nIsmingiz va familiyangizni kiriting:",
    );
  } catch (error) {
    try {
      await ctx.reply("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } catch {
      // ignore reply failure
    }
  }
});

// ─── Text message handler (onboarding: awaiting_name step) ───────────────────

bot.on("message:text", async (ctx) => {
  const text = ctx.message.text;

  if (text.startsWith("/")) return; // ignore commands

  if (ctx.session.step === "awaiting_name") {
    ctx.session.fullName = text.trim();
    ctx.session.step = "awaiting_phone";

    const sentPhone = await ctx.reply("Telefon raqamingizni ulashing:", {
      reply_markup: {
        keyboard: [[{ text: "📞 Raqamni ulashish", request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
    ctx.session.lastBotMessageId = sentPhone.message_id;
    return;
  }

  if (ctx.session.step === "awaiting_test_code") {
    if (!/^\d{3}$/.test(text.trim())) {
      await ctx.reply("Faqat 3 ta raqam kiriting.");
      await ctx.reply("Test kodini kiriting (3 ta raqam):");
      return;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (ctx.session.token)
      headers["Authorization"] = `Bearer ${ctx.session.token}`;

    let response: Response;
    try {
      response = await fetch(`${API_URL}/api/tests/unlock`, {
        method: "POST",
        headers,
        body: JSON.stringify({ testPassword: text.trim() }),
      });
    } catch {
      await ctx.reply("Xatolik yuz berdi. Qayta urinib ko'ring.");
      return;
    }

    if (response.status === 404) {
      await ctx.reply("Noto'g'ri kod. Qayta urinib ko'ring.");
      await ctx.reply("Test kodini kiriting (3 ta raqam):");
      return;
    }

    if (!response.ok) {
      await ctx.reply("Xatolik yuz berdi. Qayta urinib ko'ring.");
      return;
    }

    const test = (await response.json()) as any;

    ctx.session.unlockedTestId = test.id;
    ctx.session.step = "ready";

    const parts = [
      `📝 ${test.title}`,
      "",
      `⏱ Vaqt: ${test.timeLimitMinutes} daqiqa`,
    ];
    if (test.questionCount !== undefined && test.questionCount !== null) {
      parts.push(`❓ Savollar: ${test.questionCount} ta`);
    }
    parts.push(`⭐ Har bir savol: ${test.pointsPerQuestion} ball`);
    parts.push("");
    parts.push("Tayyor bo'lsangiz boshlang!");

    const infoMessage = parts.join("\n");

    await ctx.reply(infoMessage, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Boshlash ▶️", callback_data: "start_unlocked_test" }],
        ],
      },
    });
    return;
  }

  // Default: show hint
  await ctx.reply("Iltimos, menyudan foydalaning yoki /start bosing.");
});

// ─── Contact handler (onboarding: awaiting_phone step) ───────────────────────

bot.on("message:contact", async (ctx) => {
  try {
    const phone = ctx.message.contact.phone_number;
    const telegramId = String(ctx.from!.id);
    const fullName = ctx.session.fullName ?? "";

    const data = await api("POST", "/api/auth/telegram", {
      telegramId,
      fullName,
      phone,
    });

    if (data.error) {
      await ctx.reply("Ro'yxatdan o'tishda xatolik. Qayta urinib ko'ring.", {
        reply_markup: { remove_keyboard: true },
      });
      ctx.session.step = "awaiting_name";
      ctx.session.fullName = undefined;
      await ctx.reply("Ismingiz va familiyangizni kiriting:");
      return;
    }

    ctx.session.token = data.token;
    ctx.session.step = "ready";

    try {
      await ctx.api.deleteMessage(ctx.chat!.id, ctx.session.lastBotMessageId!);
    } catch {
      // Message already deleted or too old — ignore
    }

    await ctx.reply("Xush kelibsiz! 👋", {
      reply_markup: { remove_keyboard: true },
    });
    await showMainMenu(ctx);
  } catch (error) {
    try {
      await ctx.reply("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } catch {
      // ignore reply failure
    }
  }
});

// ─── Testni boshlash (unlock flow entry) ─────────────────────────────────────

bot.callbackQuery("start_test_flow", async (ctx) => {
  try {
    try {
      await ctx.answerCallbackQuery();
    } catch {
      // Query expired — ignore silently
    }

    if (!ctx.session.token) {
      await ctx.reply("Iltimos avval tizimga kiring. /start");
      return;
    }

    ctx.session.step = "awaiting_test_code";
    await ctx.reply("Test kodini kiriting (3 ta raqam):");
  } catch (error) {
    try {
      await ctx.reply("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } catch {
      // ignore reply failure
    }
  }
});

// ─── Start unlocked test ──────────────────────────────────────────────────────

bot.callbackQuery("start_unlocked_test", async (ctx) => {
  try {
    try {
      await ctx.answerCallbackQuery();
    } catch {
      // Query expired — ignore silently
    }

    if (!ctx.session.token) {
      await ctx.reply("Iltimos, avval tizimga kiring.");
      await showMainMenu(ctx);
      return;
    }

    const testId = ctx.session.unlockedTestId;
    if (!testId) {
      await ctx.reply("Test topilmadi. Iltimos kodni qayta kiriting.");
      ctx.session.step = "awaiting_test_code";
      await ctx.reply("Test kodini kiriting (3 ta raqam):");
      return;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (ctx.session.token)
      headers["Authorization"] = `Bearer ${ctx.session.token}`;

    const startRes = await fetch(
      `${API_URL}/api/tests/${testId}/attempts/start`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({}),
      },
    );
    const attempt = (await startRes.json()) as any;

    if (startRes.status === 409 && attempt.code === "ATTEMPT_ALREADY_EXISTS") {
      await showAlreadyAttemptedMessage(ctx, testId);
      return;
    }

    if (attempt.error) {
      await ctx.reply(`❌ Testni boshlab bo'lmadi: ${attempt.error}`);
      return;
    }

    ctx.session.unlockedTestId = undefined;
    ctx.session.currentAttempt = {
      id: attempt.id,
      testId,
      questions: attempt.questions,
      currentQuestionIndex: 0,
    };

    await ctx.reply(
      "✅ Test boshlandi! Har bir savol uchun to'g'ri javobni tanlang.",
    );
    await sendQuestion(ctx);
  } catch (error) {
    try {
      await ctx.reply("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } catch {
      // ignore reply failure
    }
  }
});

// ─── Tests list ───────────────────────────────────────────────────────────────

bot.callbackQuery("tests", async (ctx) => {
  try {
    try {
      await ctx.answerCallbackQuery();
    } catch {
      // Query expired — ignore silently
    }

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
  } catch (error) {
    console.error("Handler error:", error);
    try {
      await ctx.reply("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } catch {
      // ignore reply failure
    }
  }
});

// ─── Test detail ─────────────────────────────────────────────────────────────

bot.callbackQuery(/^test:(.+)$/, async (ctx) => {
  try {
    try {
      await ctx.answerCallbackQuery();
    } catch {
      // Query expired — ignore silently
    }
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
  } catch (error) {
    console.error("Handler error:", error);
    try {
      await ctx.reply("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } catch {
      // ignore reply failure
    }
  }
});

// ─── Start test ───────────────────────────────────────────────────────────────

bot.callbackQuery(/^start:(.+)$/, async (ctx) => {
  try {
    try {
      await ctx.answerCallbackQuery();
    } catch {
      // Query expired — ignore silently
    }
    const testId = ctx.match[1]!;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (ctx.session.token)
      headers["Authorization"] = `Bearer ${ctx.session.token}`;

    const startRes = await fetch(
      `${API_URL}/api/tests/${testId}/attempts/start`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({}),
      },
    );
    const attempt = (await startRes.json()) as any;

    if (startRes.status === 409 && attempt.code === "ATTEMPT_ALREADY_EXISTS") {
      await showAlreadyAttemptedMessage(ctx, testId);
      return;
    }

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

    await ctx.reply(
      "✅ Test boshlandi! Har bir savol uchun to'g'ri javobni tanlang.",
    );
    await sendQuestion(ctx);
  } catch (error) {
    console.error("Handler error:", error);
    try {
      await ctx.reply("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } catch {
      // ignore reply failure
    }
  }
});

// ─── Answer handler ───────────────────────────────────────────────────────────

bot.callbackQuery(/^ans:(\d+)$/, async (ctx) => {
  try {
    const attempt = ctx.session.currentAttempt;

    if (!attempt) {
      try {
        await ctx.answerCallbackQuery("Test topilmadi. /start bosing.");
      } catch {
        // Query expired — ignore silently
      }
      return;
    }

    const optionIndex = parseInt(ctx.match[1]!);
    const question = attempt.questions[attempt.currentQuestionIndex];

    if (!question) {
      try {
        await ctx.answerCallbackQuery();
      } catch {
        // Query expired — ignore silently
      }
      return;
    }

    const option = question.options[optionIndex];
    if (!option) {
      try {
        await ctx.answerCallbackQuery("Noto'g'ri variant.");
      } catch {
        // Query expired — ignore silently
      }
      return;
    }

    try {
      await ctx.answerCallbackQuery("✓ Javob qabul qilindi");
    } catch {
      // Query expired — ignore silently
    }

    const label =
      (ctx.session.currentOptions ?? [])[optionIndex]?.label ??
      String.fromCharCode(65 + optionIndex);
    const optionText = option.text;
    const questionText = ctx.session.currentQuestionText ?? question.text;

    try {
      await ctx.editMessageText(
        `${questionText}\n\n✅ Sizning javobingiz: ${label}) ${optionText}`,
        { reply_markup: undefined, parse_mode: "Markdown" },
      );
    } catch {
      // Message too old or already edited — ignore
    }

    await api(
      "POST",
      `/api/attempts/${attempt.id}/answers`,
      { questionId: question.questionId, optionId: option.id },
      ctx.session.token,
    );

    ctx.session.currentAttempt!.currentQuestionIndex += 1;

    await sendQuestion(ctx);
  } catch (error) {
    console.error("Handler error:", error);
    try {
      await ctx.reply("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } catch {
      // ignore reply failure
    }
  }
});

// ─── Back to main menu ────────────────────────────────────────────────────────

bot.callbackQuery("back_main", async (ctx) => {
  try {
    try {
      await ctx.answerCallbackQuery();
    } catch {
      // Query expired — ignore silently
    }
    await showMainMenu(ctx);
  } catch (error) {
    console.error("Handler error:", error);
    try {
      await ctx.reply("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } catch {
      // ignore reply failure
    }
  }
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
  bot.start().catch((error) => {
    console.error("Bot startup error:", error);
    process.exit(1);
  });
}
