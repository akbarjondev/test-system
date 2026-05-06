import WebApp from "@twa-dev/sdk";
import { useEffect, useState } from "react";
import { getTests } from "../services/tests";
import type { Screen, TestItem } from "../types";

interface TestsListScreenProps {
  onNavigate: (screen: Screen) => void;
  onSelectTest: (test: TestItem) => void;
}

export default function TestsListScreen({ onNavigate, onSelectTest }: TestsListScreenProps) {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchTests = () => {
    setLoading(true);
    setError(false);
    getTests()
      .then(setTests)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    WebApp.BackButton.show();
    const handler = () => onNavigate("home");
    WebApp.BackButton.onClick(handler);
    return () => {
      WebApp.BackButton.offClick(handler);
      WebApp.BackButton.hide();
    };
  }, [onNavigate]);

  const containerStyle: React.CSSProperties = {
    padding: "16px",
    backgroundColor: "var(--tg-bg-color, #ffffff)",
    color: "var(--tg-text-color, #000000)",
    minHeight: "100vh",
  };

  const cardStyle: React.CSSProperties = {
    border: "1px solid var(--tg-hint-color, #aaaaaa)",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "12px",
  };

  const btnStyle: React.CSSProperties = {
    backgroundColor: "var(--tg-button-color, #0077ff)",
    color: "var(--tg-button-text-color, #ffffff)",
    border: "none",
    borderRadius: "6px",
    padding: "8px 16px",
    fontSize: "14px",
    cursor: "pointer",
    marginTop: "8px",
    width: "100%",
  };

  if (loading) {
    return (
      <div style={{ ...containerStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Yuklanmoqda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...containerStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <p>Testlarni yuklashda xatolik yuz berdi.</p>
        <button onClick={fetchTests} style={btnStyle}>Qayta urinish</button>
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div style={{ ...containerStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Hozircha testlar mavjud emas.</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: "16px", fontWeight: "600" }}>Testlar</h2>
      {tests.map((test) => (
        <div key={test.id} style={cardStyle}>
          <p style={{ fontWeight: "bold", marginBottom: "4px" }}>{test.title}</p>
          <p style={{ fontSize: "13px", color: "var(--tg-hint-color, #888)" }}>
            ⏱ {test.timeLimitMinutes !== null ? `${test.timeLimitMinutes} daqiqa` : "Cheksiz"}
          </p>
          <p style={{ fontSize: "13px", color: "var(--tg-hint-color, #888)" }}>
            🎯 Har savol uchun: {test.pointsPerQuestion} ball
          </p>
          <p style={{ fontSize: "13px", color: "var(--tg-hint-color, #888)" }}>
            📝 {test._count.questions} ta savol
          </p>
          <button style={btnStyle} onClick={() => onSelectTest(test)}>
            Ochish
          </button>
        </div>
      ))}
    </div>
  );
}
