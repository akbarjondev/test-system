import { useCallback, useEffect, useState } from "react";
import { authenticate } from "./services/auth";
import LoadingScreen from "./screens/LoadingScreen";
import ErrorScreen from "./screens/ErrorScreen";
import HomeScreen from "./screens/HomeScreen";

type Screen = "loading" | "error" | "home" | "tests-list";

export default function App() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [user, setUser] = useState<{ fullName: string } | null>(null);

  const doAuth = useCallback(async () => {
    setScreen("loading");
    try {
      const result = await authenticate();
      setUser(result.user);
      setScreen("home");
    } catch {
      setScreen("error");
    }
  }, []);

  useEffect(() => {
    doAuth();
  }, [doAuth]);

  if (screen === "loading") return <LoadingScreen />;
  if (screen === "error") return <ErrorScreen onRetry={doAuth} />;
  if (screen === "home") return <HomeScreen user={user!} onNavigate={setScreen} />;

  return null;
}
