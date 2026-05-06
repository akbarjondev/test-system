import { useCallback, useEffect, useState } from "react";
import { authenticate } from "./services/auth";
import LoadingScreen from "./screens/LoadingScreen";
import ErrorScreen from "./screens/ErrorScreen";
import HomeScreen from "./screens/HomeScreen";
import TestsListScreen from "./screens/TestsListScreen";
import TestUnlockScreen from "./screens/TestUnlockScreen";
import TestDetailScreen from "./screens/TestDetailScreen";
import TestTakingScreen from "./screens/TestTakingScreen";
import ResultsScreen from "./screens/ResultsScreen";
import type { AttemptResult, Screen, TestItem } from "./types";

export default function App() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [user, setUser] = useState<{ fullName: string } | null>(null);
  const [selectedTest, setSelectedTest] = useState<TestItem | null>(null);
  const [result, setResult] = useState<AttemptResult | null>(null);

  const doAuth = useCallback(async () => {
    setScreen("loading");
    try {
      const res = await authenticate();
      setUser(res.user);
      setScreen("home");
    } catch {
      setScreen("error");
    }
  }, []);

  useEffect(() => {
    doAuth();
  }, [doAuth]);

  const handleSelectTest = (test: TestItem) => {
    setSelectedTest(test);
    if (test.testPassword === null) {
      setScreen("test-detail");
    } else {
      setScreen("test-unlock");
    }
  };

  const handleUnlocked = (unlockedTest: TestItem) => {
    setSelectedTest(unlockedTest);
    setScreen("test-detail");
  };

  const handleComplete = (attemptResult: AttemptResult) => {
    setResult(attemptResult);
    setScreen("results");
  };

  const handleTimedOut = () => {
    setResult({ score: 0, maxScore: 0, passed: null, timedOut: true });
    setScreen("results");
  };

  const handleHome = () => {
    setSelectedTest(null);
    setResult(null);
    setScreen("home");
  };

  if (screen === "loading") return <LoadingScreen />;
  if (screen === "error") return <ErrorScreen onRetry={doAuth} />;
  if (screen === "home") return <HomeScreen user={user!} onNavigate={setScreen} />;
  if (screen === "tests-list")
    return <TestsListScreen onNavigate={setScreen} onSelectTest={handleSelectTest} />;
  if (screen === "test-unlock" && selectedTest)
    return (
      <TestUnlockScreen
        test={selectedTest}
        onUnlocked={handleUnlocked}
        onBack={() => setScreen("tests-list")}
      />
    );
  if (screen === "test-detail" && selectedTest)
    return (
      <TestDetailScreen
        test={selectedTest}
        onStart={() => setScreen("test-taking")}
        onBack={() => {
          if (selectedTest.testPassword === null) {
            setScreen("tests-list");
          } else {
            setScreen("test-unlock");
          }
        }}
      />
    );
  if (screen === "test-taking" && selectedTest)
    return (
      <TestTakingScreen
        testId={selectedTest.id}
        onComplete={handleComplete}
        onTimedOut={handleTimedOut}
        onNavigateBack={() => setScreen("tests-list")}
      />
    );
  if (screen === "results" && result)
    return <ResultsScreen result={result} onHome={handleHome} />;

  return null;
}
