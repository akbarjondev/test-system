// Test script for API endpoints
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

async function testEndpoints() {
  log("\n=== API Endpoints Testing ===\n", "cyan");

  let authToken = null;
  let testId = null;
  let questionId = null;

  // 1. Register a new user
  log("1. Testing POST /api/auth/register", "blue");
  const registerResult = await makeRequest("POST", `${BASE_URL}/auth/register`, {
    email: `testuser_${Date.now()}@example.com`,
    password: "testpassword123",
  });
  log(`   Status: ${registerResult.status}`, registerResult.ok ? "green" : "red");
  if (registerResult.ok && registerResult.data.token) {
    authToken = registerResult.data.token;
    log(`   ✓ User registered successfully`, "green");
    log(`   Token: ${authToken.substring(0, 20)}...`, "yellow");
  } else {
    log(`   ✗ Registration failed: ${JSON.stringify(registerResult.data)}`, "red");
    // Try login instead
    log("\n   Trying login instead...", "yellow");
    const loginResult = await makeRequest("POST", `${BASE_URL}/auth/login`, {
      email: "admin@example.com",
      password: "admin123",
    });
    if (loginResult.ok && loginResult.data.token) {
      authToken = loginResult.data.token;
      log(`   ✓ Logged in successfully`, "green");
    } else {
      log(`   ✗ Login also failed. Please ensure server is running and database is set up.`, "red");
      return;
    }
  }

  // 2. Create a test
  log("\n2. Testing POST /api/tests", "blue");
  const createTestResult = await makeRequest(
    "POST",
    `${BASE_URL}/tests`,
    {
      title: "Sample Math Test",
      description: "A test to check basic math skills",
      score: 100,
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

  // 3. Get all tests
  log("\n3. Testing GET /api/tests", "blue");
  const getAllTestsResult = await makeRequest("GET", `${BASE_URL}/tests`, null, authToken);
  log(`   Status: ${getAllTestsResult.status}`, getAllTestsResult.ok ? "green" : "red");
  if (getAllTestsResult.ok) {
    log(`   ✓ Retrieved ${getAllTestsResult.data.length} test(s)`, "green");
    log(`   Tests: ${JSON.stringify(getAllTestsResult.data, null, 2)}`, "yellow");
  } else {
    log(`   ✗ Failed: ${JSON.stringify(getAllTestsResult.data)}`, "red");
  }

  // 4. Get one test
  log("\n4. Testing GET /api/tests/:testId", "blue");
  const getOneTestResult = await makeRequest(
    "GET",
    `${BASE_URL}/tests/${testId}`,
    null,
    authToken
  );
  log(`   Status: ${getOneTestResult.status}`, getOneTestResult.ok ? "green" : "red");
  if (getOneTestResult.ok) {
    log(`   ✓ Test retrieved successfully`, "green");
    log(`   Test with relations: ${JSON.stringify(getOneTestResult.data, null, 2)}`, "yellow");
  } else {
    log(`   ✗ Failed: ${JSON.stringify(getOneTestResult.data)}`, "red");
  }

  // 5. Create a question with options
  log("\n5. Testing POST /api/tests/:testId/questions", "blue");
  const createQuestionResult = await makeRequest(
    "POST",
    `${BASE_URL}/tests/${testId}/questions`,
    {
      text: "What is 2 + 2?",
      options: [
        { text: "3", isCorrect: false, order: 0 },
        { text: "4", isCorrect: true, order: 1 },
        { text: "5", isCorrect: false, order: 2 },
        { text: "6", isCorrect: false, order: 3 },
      ],
    },
    authToken
  );
  log(`   Status: ${createQuestionResult.status}`, createQuestionResult.ok ? "green" : "red");
  if (createQuestionResult.ok) {
    questionId = createQuestionResult.data.id;
    log(`   ✓ Question created successfully`, "green");
    log(`   Question ID: ${questionId}`, "yellow");
    log(`   Question: ${JSON.stringify(createQuestionResult.data, null, 2)}`, "yellow");
  } else {
    log(`   ✗ Failed: ${JSON.stringify(createQuestionResult.data)}`, "red");
  }

  // 6. Create another question
  log("\n6. Testing POST /api/tests/:testId/questions (second question)", "blue");
  const createQuestion2Result = await makeRequest(
    "POST",
    `${BASE_URL}/tests/${testId}/questions`,
    {
      text: "What is the capital of France?",
      options: [
        { text: "London", isCorrect: false, order: 0 },
        { text: "Berlin", isCorrect: false, order: 1 },
        { text: "Paris", isCorrect: true, order: 2, explanation: "Paris is the capital city of France" },
        { text: "Madrid", isCorrect: false, order: 3 },
      ],
    },
    authToken
  );
  log(`   Status: ${createQuestion2Result.status}`, createQuestion2Result.ok ? "green" : "red");
  if (createQuestion2Result.ok) {
    log(`   ✓ Second question created successfully`, "green");
  } else {
    log(`   ✗ Failed: ${JSON.stringify(createQuestion2Result.data)}`, "red");
  }

  // 7. Get all questions for a test
  log("\n7. Testing GET /api/tests/:testId/questions", "blue");
  const getQuestionsResult = await makeRequest(
    "GET",
    `${BASE_URL}/tests/${testId}/questions`,
    null,
    authToken
  );
  log(`   Status: ${getQuestionsResult.status}`, getQuestionsResult.ok ? "green" : "red");
  if (getQuestionsResult.ok) {
    log(`   ✓ Retrieved ${getQuestionsResult.data.length} question(s)`, "green");
    log(`   Questions: ${JSON.stringify(getQuestionsResult.data, null, 2)}`, "yellow");
  } else {
    log(`   ✗ Failed: ${JSON.stringify(getQuestionsResult.data)}`, "red");
  }

  // 8. Get one question
  log("\n8. Testing GET /api/questions/:questionId", "blue");
  const getOneQuestionResult = await makeRequest(
    "GET",
    `${BASE_URL}/questions/${questionId}`,
    null,
    authToken
  );
  log(`   Status: ${getOneQuestionResult.status}`, getOneQuestionResult.ok ? "green" : "red");
  if (getOneQuestionResult.ok) {
    log(`   ✓ Question retrieved successfully`, "green");
    log(`   Question: ${JSON.stringify(getOneQuestionResult.data, null, 2)}`, "yellow");
  } else {
    log(`   ✗ Failed: ${JSON.stringify(getOneQuestionResult.data)}`, "red");
  }

  // 9. Update test
  log("\n9. Testing PUT /api/tests/:testId", "blue");
  const updateTestResult = await makeRequest(
    "PUT",
    `${BASE_URL}/tests/${testId}`,
    {
      title: "Updated Math Test",
      description: "Updated description for the math test",
      score: 150,
    },
    authToken
  );
  log(`   Status: ${updateTestResult.status}`, updateTestResult.ok ? "green" : "red");
  if (updateTestResult.ok) {
    log(`   ✓ Test updated successfully`, "green");
    log(`   Updated test: ${JSON.stringify(updateTestResult.data, null, 2)}`, "yellow");
  } else {
    log(`   ✗ Failed: ${JSON.stringify(updateTestResult.data)}`, "red");
  }

  // 10. Update question
  log("\n10. Testing PUT /api/questions/:questionId", "blue");
  const updateQuestionResult = await makeRequest(
    "PUT",
    `${BASE_URL}/questions/${questionId}`,
    {
      text: "What is 2 + 2? (Updated)",
      options: [
        { text: "3", isCorrect: false, order: 0 },
        { text: "4", isCorrect: true, order: 1, explanation: "Correct! 2 + 2 = 4" },
        { text: "5", isCorrect: false, order: 2 },
      ],
    },
    authToken
  );
  log(`   Status: ${updateQuestionResult.status}`, updateQuestionResult.ok ? "green" : "red");
  if (updateQuestionResult.ok) {
    log(`   ✓ Question updated successfully`, "green");
    log(`   Updated question: ${JSON.stringify(updateQuestionResult.data, null, 2)}`, "yellow");
  } else {
    log(`   ✗ Failed: ${JSON.stringify(updateQuestionResult.data)}`, "red");
  }

  // 11. Delete question
  log("\n11. Testing DELETE /api/questions/:questionId", "blue");
  const deleteQuestionResult = await makeRequest(
    "DELETE",
    `${BASE_URL}/questions/${questionId}`,
    null,
    authToken
  );
  log(`   Status: ${deleteQuestionResult.status}`, deleteQuestionResult.ok ? "green" : "red");
  if (deleteQuestionResult.status === 204) {
    log(`   ✓ Question deleted successfully (204 No Content)`, "green");
  } else {
    log(`   ✗ Failed: ${JSON.stringify(deleteQuestionResult.data)}`, "red");
  }

  // 12. Verify question is deleted
  log("\n12. Testing GET /api/questions/:questionId (after delete)", "blue");
  const getDeletedQuestionResult = await makeRequest(
    "GET",
    `${BASE_URL}/questions/${questionId}`,
    null,
    authToken
  );
  log(`   Status: ${getDeletedQuestionResult.status}`, getDeletedQuestionResult.status === 404 ? "green" : "red");
  if (getDeletedQuestionResult.status === 404) {
    log(`   ✓ Question not found (as expected after deletion)`, "green");
  } else {
    log(`   ✗ Unexpected result: ${JSON.stringify(getDeletedQuestionResult.data)}`, "red");
  }

  // 13. Delete test
  log("\n13. Testing DELETE /api/tests/:testId", "blue");
  const deleteTestResult = await makeRequest(
    "DELETE",
    `${BASE_URL}/tests/${testId}`,
    null,
    authToken
  );
  log(`   Status: ${deleteTestResult.status}`, deleteTestResult.ok ? "green" : "red");
  if (deleteTestResult.status === 204) {
    log(`   ✓ Test deleted successfully (204 No Content)`, "green");
  } else {
    log(`   ✗ Failed: ${JSON.stringify(deleteTestResult.data)}`, "red");
  }

  // 14. Verify test is deleted
  log("\n14. Testing GET /api/tests/:testId (after delete)", "blue");
  const getDeletedTestResult = await makeRequest(
    "GET",
    `${BASE_URL}/tests/${testId}`,
    null,
    authToken
  );
  log(`   Status: ${getDeletedTestResult.status}`, getDeletedTestResult.status === 404 ? "green" : "red");
  if (getDeletedTestResult.status === 404) {
    log(`   ✓ Test not found (as expected after deletion)`, "green");
  } else {
    log(`   ✗ Unexpected result: ${JSON.stringify(getDeletedTestResult.data)}`, "red");
  }

  log("\n=== Testing Complete ===\n", "cyan");
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === "undefined") {
  console.error("This script requires Node.js 18+ with native fetch support, or install node-fetch");
  process.exit(1);
}

// Run tests
testEndpoints().catch((error) => {
  log(`\n✗ Test script error: ${error.message}`, "red");
  console.error(error);
  process.exit(1);
});
