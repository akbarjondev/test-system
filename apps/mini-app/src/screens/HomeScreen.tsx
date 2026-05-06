import type { Screen } from "../types";

interface HomeScreenProps {
  user: {
    fullName: string;
  };
  onNavigate: (screen: Screen) => void;
}

export default function HomeScreen({ user, onNavigate }: HomeScreenProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "var(--tg-bg-color, #ffffff)",
        color: "var(--tg-text-color, #000000)",
        padding: "16px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "300px" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "32px", fontWeight: "600" }}>
          Salom, {user.fullName}!
        </h1>
        <button
          onClick={() => onNavigate("tests-list")}
          style={{
            backgroundColor: "var(--tg-button-color, #0077ff)",
            color: "var(--tg-button-text-color, #ffffff)",
            border: "none",
            borderRadius: "8px",
            padding: "12px 24px",
            fontSize: "16px",
            cursor: "pointer",
            width: "100%",
            fontWeight: "500",
          }}
        >
          Testlarga o'tish
        </button>
      </div>
    </div>
  );
}
