import WebApp from "@twa-dev/sdk";
import { useEffect, useState } from "react";
import { startAttempt, submitAnswer, submitAttempt } from "../services/attempts";
import type { AttemptQuestion, AttemptResult } from "../types";

interface TestTakingScreenProps {
  testId: string;
  onComplete: (result: AttemptResult) => void;
  onTimedOut: () => void;
  onNavigateBack: () => void;
}

export default function TestTakingScreen({
  testId,
  onComplete,
  onTimedOut,
  onNavigateBack,
}: TestTakingScreenProps) {
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<AttemptQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    startAttempt(testId)
      .then((res) => {
        setAttemptId(res.id);
        setQuestions(res.questions);
      })
      .catch(() => setLoadError(true));
  }, [testId]);

  useEffect(() => {
    const handler = () => {
      WebApp.showConfirm(
        "Testni tark etmoqchimisiz? Progress saqlanmaydi.",
        (ok) => { if (ok) onNavigateBack(); },
      );
    };
    WebApp.BackButton.show();
    WebApp.BackButton.onClick(handler);
    return () => {
      WebApp.BackButton.offClick(handler);
      WebApp.BackButton.hide();
    };
  }, [onNavigateBack]);

  const handleSelectOption = async (optionId: string) => {
    if (answered || !attemptId) return;
    const question = questions[currentIndex];
    if (!question) return;
    setSelectedOptionId(optionId);
    setAnswered(true);
    try {
      await submitAnswer(attemptId, question.questionId, optionId);
    } catch {
      // Network error on answer submit — attempt can still be submitted
    }
  };

  const handleNext = async () => {
    if (!attemptId) return;
    const isLast = currentIndex === questions.length - 1;
    if (isLast) {
      setSubmitting(true);
      try {
        const result = await submitAttempt(attemptId);
        onComplete(result);
      } catch (err: any) {
        if (err.timedOut) {
          onTimedOut();
        } else {
          setSubmitting(false);
        }
      }
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOptionId(null);
      setAnswered(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    padding: "16px",
    backgroundColor: "var(--tg-bg-color, #ffffff)",
    color: "var(--tg-text-color, #000000)",
    minHeight: "100vh",
  };

  if (loadError) {
    return (
      <div style={{ ...containerStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Testni yuklashda xatolik. Iltimos qayta urinib ko'ring.</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{ ...containerStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Yuklanmoqda...</p>
      </div>
    );
  }

  const question = questions[currentIndex]!;

  return (
    <div style={containerStyle}>
      <p style={{ color: "var(--tg-hint-color, #888)", marginBottom: "16px", fontSize: "14px" }}>
        {currentIndex + 1} / {questions.length} savol
      </p>
      <p style={{ fontWeight: "600", fontSize: "16px", marginBottom: "20px", lineHeight: 1.5 }}>
        {question.text}
      </p>
      <div>
        {question.options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          const isOther = answered && !isSelected;
          return (
            <button
              key={opt.id}
              disabled={answered}
              onClick={() => handleSelectOption(opt.id)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "12px",
                marginBottom: "10px",
                borderRadius: "8px",
                border: "1px solid var(--tg-hint-color, #aaaaaa)",
                backgroundColor: isSelected ? "var(--tg-button-color, #0077ff)" : "transparent",
                color: isSelected ? "var(--tg-button-text-color, #ffffff)" : "var(--tg-text-color, #000000)",
                opacity: isOther ? 0.5 : 1,
                cursor: answered ? "default" : "pointer",
                fontSize: "15px",
              }}
            >
              {opt.text}
            </button>
          );
        })}
      </div>
      {answered && (
        <button
          onClick={handleNext}
          disabled={submitting}
          style={{
            backgroundColor: "var(--tg-button-color, #0077ff)",
            color: "var(--tg-button-text-color, #ffffff)",
            border: "none",
            borderRadius: "8px",
            padding: "12px",
            fontSize: "16px",
            cursor: submitting ? "not-allowed" : "pointer",
            width: "100%",
            marginTop: "8px",
            fontWeight: "500",
          }}
        >
          {submitting ? "Yuklanmoqda..." : currentIndex === questions.length - 1 ? "Yakunlash" : "Keyingisi"}
        </button>
      )}
    </div>
  );
}
