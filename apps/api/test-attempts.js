// Test script for Attempt API endpoints
const BASE_URL = "http://localhost:5000/api";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function makeRequest(method, url, body = null, token = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
    };
  }
}

async function testAttemptEndpoints() {
  log("\n=== Test Attempt Endpoints Testing ===\n", "cyan");

  let authToken = null;
  let testId = null;
  let questionId1 = null;
  let questionId2 = null;
  let attemptId = null;

  // 1. Register a new student user
  log("1. Testing POST /api/auth/register (Student)", "blue");
  const registerResult = await makeRequest("POST", `${BASE_URL}/auth/register`, {
    email: `student_${Date.now()}@example.com`,
    password: "student123",
  });
  log(`   Status: ${registerResult.status}`, registerResult.ok ? "green" : "red");
  if (registerResult.ok && registerResult.data.token) {
    authToken = registerResult.data.token;
    log(`   ✓ Student registered successfully`, "green");
    log(`   Token: ${authToken.substring(0, 20)}...`, "yellow");
  } else {
    log(`   ✗ Registration failed: ${JSON.stringify(registerResult.data)}`, "red");
    return;
  }

  // 2. Create a test with new fields
  log("\n2. Testing POST /api/tests (with new fields)", "blue");
  const createTestResult = await makeRequest(
    "POST",
    `${BASE_URL}/tests`,
    {
      title: "JavaScript Fundamentals Test",
      description: "Test your knowledge of JavaScript basics",
      pointsPerQuestion: 10,
      timeLimitMinutes: 5, // 5 minutes for testing
      isAlwaysAvailable: true,
    },
    authToken
  );
  log(`   Status: ${createTestResult.status}`, createTestResult.ok ? "green" : "red");
  if (createTestResult.ok) {
    testId = createTestResult.data.id;
    log(`   ✓ Test created successfully`, "green");
    log(`   Test ID: ${testId}`, "yellow");
    log(`   Test: ${JSON.stringify(createTestResult.data, null, 2)}`, "yellow");
  } else {
    log(`   ✗ Failed: ${JSON.stringify(createTestResult.data)}`, "red");
    return;
  }

  // 3. Create questions with options
  log("\n3. Testing POST /api/tests/:testId/questions (Question 1)", "blue");
  const createQuestion1Result = await makeRequest(
    "POST",
    `${BASE_URL}/tests/${testId}/questions`,
    {
      text: "What is the result of typeof null in JavaScript?",
      options: [
        { text: "null", isCorrect: false, order: 0 },
        { text: "object", isCorrect: true, order: 1 },
        { text: "undefined", isCorrect: false, order: 2 },
        { text: "boolean", isCorrect: false, order: 3 },
      ],
    },
    authToken
  );
  log(`   Status: ${createQuestion1Result.status}`, createQuestion1Result.ok ? "green" : "red");
  if (createQuestion1Result.ok) {
    questionId1 = createQuestion1Result.data.id;
    log(`   ✓ Question 1 created successfully`, "green");
  } else {
    log(`   ✗ Failed: ${JSON.stringify(createQuestion1Result.data)}`, "red");
    return;
  }

  log("\n4. Testing POST /api/tests/:testId/questions (Question 2)", "blue");
  const createQuestion2Result = await makeRequest(
    "POST",
    `${BASE_URL}/tests/${testId}/questions`,
    {
      text: "Which method adds an element to the end of an array?",
      options: [
        { text: "push()", isCorrect: true, order: 0 },
        { text: "pop()", isCorrect: false, order: 1 },
        { text: "shift()", isCorrect: false, order: 2 },
        { text: "unshift()", isCorrect: false, order: 3 },
      ],
    },
    authToken
  );
  log(`   Status: ${createQuestion2Result.status}`, createQuestion2Result.ok ? "green" : "red");
  if (createQuestion2Result.ok) {
    questionId2 = createQuestion2Result.data.id;
    log(`   ✓ Question 2 created successfully`, "green");
  } else {
    log(`   ✗ Failed: ${JSON.stringify(createQuestion2Result.data)}`, "red");
    return;
  }

  // 5. Start test attempt
  log("\n5. Testing POST /api/tests/:testId/attempts/start", "blue");
  const startAttemptResult = await makeRequest(
    "POST",
    `${BASE_URL}/tests/${testId}/attempts/start`,
    null,
    authToken
  );
  log(`   Status: ${startAttemptResult.status}`, startAttemptResult.ok ? "green" : "red");
  if (startAttemptResult.ok) {
    attemptId = startAttemptResult.data.id;
    log(`   ✓ Test attempt started successfully`, "green");
    log(`   Attempt ID: ${attemptId}`, "yellow");
    log(`   Time Limit: ${startAttemptResult.data.timeLimitMinutes} minutes`, "yellow");
    log(`   Time Remaining: ${startAttemptResult.data.timeRemaining} seconds`, "yellow");
    log(`   Questions Count: ${startAttemptResult.data.questions?.length}`, "yellow");
    log(`   Questions (shuffled): ${JSON.stringify(startAttemptResult.data.questions?.map(q => ({ displayOrder: q.displayOrder, text: q.text.substring(0, 50) + "..." })), null, 2)}`, "yellow");
  } else {
    log(`   ✗ Failed: ${JSON.stringify(startAttemptResult.data)}`, "red");
    return;
  }

  // 6. Get current attempt
  log("\n6. Testing GET /api/tests/:testId/attempts/current", "blue");
  const getCurrentResult = await makeRequest(
    "GET",
    `${BASE_URL}/tests/${testId}/attempts/current`,
    null,
    authToken
  );
  log(`   Status: ${getCurrentResult.status}`, getCurrentResult.ok ? "green" : "red");
  if (getCurrentResult.ok) {
    log(`   ✓ Current attempt retrieved successfully`, "green");
    log(`   Time Remaining: ${getCurrentResult.data.timeRemaining} seconds`, "yellow");
    log(`   Questions: ${getCurrentResult.data.questions?.length}`, "yellow");
  } else {
    log(`   ✗ Failed: ${JSON.stringify(getCurrentResult.data)}`, "red");
  }

  // 7. Submit answers
  log("\n7. Testing POST /api/attempts/:attemptId/answers (Answer 1)", "blue");
  const firstQuestion = startAttemptResult.data.questions?.[0];
  const correctOption1 = firstQuestion?.options.find(opt => opt.text === "object");
  if (correctOption1) {
    const submitAnswer1Result = await makeRequest(
      "POST",
      `${BASE_URL}/attempts/${attemptId}/answers`,
      {
        questionId: firstQuestion.questionId,
        optionId: correctOption1.id,
      },
      authToken
    );
    log(`   Status: ${submitAnswer1Result.status}`, submitAnswer1Result.ok ? "green" : "red");
    if (submitAnswer1Result.ok) {
      log(`   ✓ Answer 1 submitted successfully (correct answer)`, "green");
    } else {
      log(`   ✗ Failed: ${JSON.stringify(submitAnswer1Result.data)}`, "red");
    }
  }

  log("\n8. Testing POST /api/attempts/:attemptId/answers (Answer 2)", "blue");
  const secondQuestion = startAttemptResult.data.questions?.[1];
  const wrongOption2 = secondQuestion?.options.find(opt => opt.text === "pop()");
  if (wrongOption2) {
    const submitAnswer2Result = await makeRequest(
      "POST",
      `${BASE_URL}/attempts/${attemptId}/answers`,
      {
        questionId: secondQuestion.questionId,
        optionId: wrongOption2.id,
      },
      authToken
    );
    log(`   Status: ${submitAnswer2Result.status}`, submitAnswer2Result.ok ? "green" : "red");
    if (submitAnswer2Result.ok) {
      log(`   ✓ Answer 2 submitted successfully (wrong answer)`, "green");
    } else {
      log(`   ✗ Failed: ${JSON.stringify(submitAnswer2Result.data)}`, "red");
    }
  }

  // 9. Submit test
  log("\n9. Testing POST /api/attempts/:attemptId/submit", "blue");
  const submitTestResult = await makeRequest(
    "POST",
    `${BASE_URL}/attempts/${attemptId}/submit`,
    null,
    authToken
  );
  log(`   Status: ${submitTestResult.status}`, submitTestResult.ok ? "green" : "red");
  if (submitTestResult.ok) {
    log(`   ✓ Test submitted successfully`, "green");
    log(`   Score: ${submitTestResult.data.score} / ${submitTestResult.data.maxPossibleScore}`, "yellow");
    log(`   Result: ${JSON.stringify(submitTestResult.data, null, 2)}`, "yellow");
  } else {
    log(`   ✗ Failed: ${JSON.stringify(submitTestResult.data)}`, "red");
  }

  // 10. Get attempt results
  log("\n10. Testing GET /api/attempts/:attemptId/results", "blue");
  const getResultsResult = await makeRequest(
    "GET",
    `${BASE_URL}/attempts/${attemptId}/results`,
    null,
    authToken
  );
  log(`   Status: ${getResultsResult.status}`, getResultsResult.ok ? "green" : "red");
  if (getResultsResult.ok) {
    log(`   ✓ Results retrieved successfully`, "green");
    log(`   Score: ${getResultsResult.data.score} / ${getResultsResult.data.maxPossibleScore}`, "yellow");
    log(`   Answers: ${JSON.stringify(getResultsResult.data.answers, null, 2)}`, "yellow");
  } else {
    log(`   ✗ Failed: ${JSON.stringify(getResultsResult.data)}`, "red");
  }

  // 11. Get student's attempts
  log("\n11. Testing GET /api/attempts/my-attempts", "blue");
  const getMyAttemptsResult = await makeRequest(
    "GET",
    `${BASE_URL}/attempts/my-attempts`,
    null,
    authToken
  );
  log(`   Status: ${getMyAttemptsResult.status}`, getMyAttemptsResult.ok ? "green" : "red");
  if (getMyAttemptsResult.ok) {
    log(`   ✓ Retrieved ${getMyAttemptsResult.data.length} attempt(s)`, "green");
    log(`   Attempts: ${JSON.stringify(getMyAttemptsResult.data.map(a => ({ id: a.id, testId: a.testId, score: a.score, submittedAt: a.submittedAt })), null, 2)}`, "yellow");
  } else {
    log(`   ✗ Failed: ${JSON.stringify(getMyAttemptsResult.data)}`, "red");
  }

  // 12. Test time limit validation (try to get current attempt after submission)
  log("\n12. Testing GET /api/tests/:testId/attempts/current (after submission)", "blue");
  const getCurrentAfterSubmitResult = await makeRequest(
    "GET",
    `${BASE_URL}/tests/${testId}/attempts/current`,
    null,
    authToken
  );
  log(`   Status: ${getCurrentAfterSubmitResult.status}`, getCurrentAfterSubmitResult.status === 404 ? "green" : "red");
  if (getCurrentAfterSubmitResult.status === 404) {
    log(`   ✓ No active attempt found (as expected after submission)`, "green");
  } else {
    log(`   Result: ${JSON.stringify(getCurrentAfterSubmitResult.data)}`, "yellow");
  }

  // 13. Start another attempt to test multiple attempts
  log("\n13. Testing POST /api/tests/:testId/attempts/start (Second attempt)", "blue");
  const startAttempt2Result = await makeRequest(
    "POST",
    `${BASE_URL}/tests/${testId}/attempts/start`,
    null,
    authToken
  );
  log(`   Status: ${startAttempt2Result.status}`, startAttempt2Result.ok ? "green" : "red");
  if (startAttempt2Result.ok) {
    log(`   ✓ Second attempt started successfully`, "green");
    log(`   Attempt ID: ${startAttempt2Result.data.id}`, "yellow");
    log(`   Questions shuffled differently: ${JSON.stringify(startAttempt2Result.data.questions?.map(q => ({ displayOrder: q.displayOrder, text: q.text.substring(0, 30) + "..." })), null, 2)}`, "yellow");
  } else {
    log(`   ✗ Failed: ${JSON.stringify(startAttempt2Result.data)}`, "red");
  }

  log("\n=== Testing Complete ===\n", "cyan");
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === "undefined") {
  console.error("This script requires Node.js 18+ with native fetch support, or install node-fetch");
  process.exit(1);
}

// Run tests
testAttemptEndpoints().catch((error) => {
  log(`\n✗ Test script error: ${error.message}`, "red");
  console.error(error);
  process.exit(1);
});
