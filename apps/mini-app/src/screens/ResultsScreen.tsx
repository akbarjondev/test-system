import WebApp from "@twa-dev/sdk";
import { useEffect } from "react";
import type { AttemptResult } from "../types";

interface ResultsScreenProps {
  result: AttemptResult;
  onHome: () => void;
}

export default function ResultsScreen({ result, onHome }: ResultsScreenProps) {
  useEffect(() => {
    WebApp.BackButton.hide();
  }, []);

  const percent =
    result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : 0;

  const containerStyle: React.CSSProperties = {
    padding: "24px",
    backgroundColor: "var(--tg-bg-color, #ffffff)",
    color: "var(--tg-text-color, #000000)",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  };

  const btnStyle: React.CSSProperties = {
    backgroundColor: "var(--tg-button-color, #0077ff)",
    color: "var(--tg-button-text-color, #ffffff)",
    border: "none",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "24px",
    width: "100%",
    maxWidth: "280px",
    fontWeight: "500",
  };

  return (
    <div style={containerStyle}>
      {result.timedOut ? (
        <p style={{ fontSize: "18px" }}>⏱ Vaqt tugadi! Javoblaringiz qabul qilinmadi.</p>
      ) : (
        <>
          <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>🎉 Test yakunlandi!</h2>
          <p style={{ fontSize: "20px", marginBottom: "8px" }}>
            {result.score} / {result.maxScore} ({percent}%)
          </p>
          {result.passed === true && (
            <p style={{ color: "#4CAF50", fontSize: "18px" }}>✅ Natija: O'tdingiz!</p>
          )}
          {result.passed === false && (
            <p style={{ color: "#F44336", fontSize: "18px" }}>❌ Natija: O'tmadingiz.</p>
          )}
        </>
      )}
      <button style={btnStyle} onClick={onHome}>
        Bosh sahifaga qaytish
      </button>
    </div>
  );
}
