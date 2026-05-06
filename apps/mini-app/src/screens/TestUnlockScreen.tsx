import WebApp from "@twa-dev/sdk";
import { useEffect, useState } from "react";
import { unlockTest } from "../services/tests";
import type { Screen, TestItem } from "../types";

interface TestUnlockScreenProps {
  test: TestItem;
  onUnlocked: (test: TestItem) => void;
  onBack: () => void;
}

export default function TestUnlockScreen({ test, onUnlocked, onBack }: TestUnlockScreenProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    WebApp.BackButton.show();
    WebApp.BackButton.onClick(onBack);
    return () => {
      WebApp.BackButton.offClick(onBack);
      WebApp.BackButton.hide();
    };
  }, [onBack]);

  const handleSubmit = async () => {
    if (code.length !== 3) return;
    setLoading(true);
    setError(null);
    try {
      const unlocked = await unlockTest(code);
      onUnlocked(unlocked);
    } catch (err: any) {
      if (err.status === 404) {
        setError("Noto'g'ri kod. Qayta urinib ko'ring.");
      } else {
        setError("Xatolik yuz berdi. Qayta urinib ko'ring.");
      }
      setCode("");
    } finally {
      setLoading(false);
    }
  };

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

  const inputStyle: React.CSSProperties = {
    border: "1px solid var(--tg-hint-color, #aaaaaa)",
    borderRadius: "6px",
    padding: "10px",
    fontSize: "24px",
    width: "120px",
    textAlign: "center",
    letterSpacing: "8px",
    marginBottom: "12px",
    backgroundColor: "var(--tg-secondary-bg-color, #f5f5f5)",
    color: "var(--tg-text-color, #000000)",
  };

  const btnStyle: React.CSSProperties = {
    backgroundColor: "var(--tg-button-color, #0077ff)",
    color: "var(--tg-button-text-color, #ffffff)",
    border: "none",
    borderRadius: "6px",
    padding: "12px 32px",
    fontSize: "16px",
    cursor: code.length === 3 && !loading ? "pointer" : "not-allowed",
    opacity: code.length === 3 && !loading ? 1 : 0.5,
    width: "100%",
    maxWidth: "280px",
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: "8px", fontWeight: "600" }}>{test.title}</h2>
      <p style={{ marginBottom: "24px", color: "var(--tg-hint-color, #888)", fontSize: "14px" }}>
        Test kodini kiriting:
      </p>
      <input
        type="number"
        inputMode="numeric"
        pattern="\d{3}"
        maxLength={3}
        value={code}
        onChange={(e) => setCode(e.target.value.slice(0, 3))}
        placeholder="000"
        style={inputStyle}
      />
      {error && (
        <p style={{ color: "#F44336", marginBottom: "12px", fontSize: "14px" }}>{error}</p>
      )}
      <button
        style={btnStyle}
        onClick={handleSubmit}
        disabled={code.length !== 3 || loading}
      >
        {loading ? "Tekshirilmoqda..." : "Tasdiqlash"}
      </button>
    </div>
  );
}
