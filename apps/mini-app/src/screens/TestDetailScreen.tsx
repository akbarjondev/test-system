import WebApp from "@twa-dev/sdk";
import { useEffect } from "react";
import type { TestItem } from "../types";

interface TestDetailScreenProps {
  test: TestItem;
  onStart: () => void;
  onBack: () => void;
}

export default function TestDetailScreen({ test, onStart, onBack }: TestDetailScreenProps) {
  useEffect(() => {
    WebApp.BackButton.show();
    WebApp.BackButton.onClick(onBack);
    return () => {
      WebApp.BackButton.offClick(onBack);
      WebApp.BackButton.hide();
    };
  }, [onBack]);

  const containerStyle: React.CSSProperties = {
    padding: "24px",
    backgroundColor: "var(--tg-bg-color, #ffffff)",
    color: "var(--tg-text-color, #000000)",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  };

  const infoStyle: React.CSSProperties = {
    fontSize: "15px",
    marginBottom: "8px",
    color: "var(--tg-hint-color, #888)",
  };

  const btnStyle: React.CSSProperties = {
    backgroundColor: "var(--tg-button-color, #0077ff)",
    color: "var(--tg-button-text-color, #ffffff)",
    border: "none",
    borderRadius: "8px",
    padding: "14px 32px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "24px",
    width: "100%",
    maxWidth: "280px",
    fontWeight: "500",
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: "16px", fontWeight: "600", textAlign: "center" }}>{test.title}</h2>
      <p style={infoStyle}>📝 {test._count.questions} ta savol</p>
      <p style={infoStyle}>
        ⏱ {test.timeLimitMinutes !== null ? `${test.timeLimitMinutes} daqiqa` : "Cheksiz"}
      </p>
      <p style={infoStyle}>🎯 Har savol uchun: {test.pointsPerQuestion} ball</p>
      <button style={btnStyle} onClick={onStart}>
        Boshlash
      </button>
    </div>
  );
}
