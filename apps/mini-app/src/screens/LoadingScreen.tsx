export default function LoadingScreen() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "var(--tg-bg-color, #ffffff)",
        color: "var(--tg-text-color, #000000)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid var(--tg-hint-color, #999999)",
            borderTop: "4px solid var(--tg-button-color, #0077ff)",
            borderRadius: "50%",
            animation: "spin 0.6s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <p>Yuklanmoqda...</p>
      </div>

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
