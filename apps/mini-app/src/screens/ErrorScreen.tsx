interface ErrorScreenProps {
  onRetry: () => void;
}

export default function ErrorScreen({ onRetry }: ErrorScreenProps) {
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
        <h1 style={{ fontSize: "24px", marginBottom: "16px", color: "#ff0000" }}>
          ⚠️
        </h1>
        <p style={{ fontSize: "16px", marginBottom: "24px", lineHeight: "1.5" }}>
          Autentifikatsiya xatosi. Iltimos qayta urinib ko'ring.
        </p>
        <button
          onClick={onRetry}
          style={{
            backgroundColor: "var(--tg-button-color, #0077ff)",
            color: "var(--tg-button-text-color, #ffffff)",
            border: "none",
            borderRadius: "8px",
            padding: "12px 24px",
            fontSize: "16px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Qayta urinish
        </button>
      </div>
    </div>
  );
}
