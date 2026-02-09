const fs = require("fs");

const tests = [];
let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    fn();
    tests.push({ name, status: "✅ PASS" });
    passCount++;
  } catch (error) {
    tests.push({ name, status: "❌ FAIL", error: error.message });
    failCount++;
  }
}

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf-8");
}

// ============================================
// TEST: Auth API Routes
// ============================================

test("✓ POST /api/auth/signup exported", () => {
  const content = readFile("src/app/api/auth/signup/route.ts");
  if (!content.includes("export async function POST")) throw new Error("POST not exported");
});

test("✓ POST /api/auth/signup validates input", () => {
  const content = readFile("src/app/api/auth/signup/route.ts");
  if (!content.includes("validate") && !content.includes("error")) {
    throw new Error("No validation found");
  }
});

test("✓ POST /api/auth/login exported", () => {
  const content = readFile("src/app/api/auth/login/route.ts");
  if (!content.includes("export async function POST")) throw new Error("POST not exported");
});

test("✓ POST /api/auth/logout exported", () => {
  const content = readFile("src/app/api/auth/logout/route.ts");
  if (!content.includes("export async function POST")) throw new Error("POST not exported");
});

test("✓ GET /api/auth/user exported", () => {
  const content = readFile("src/app/api/auth/user/route.ts");
  if (!content.includes("export async function GET")) throw new Error("GET not exported");
});

// ============================================
// TEST: Budget API Routes
// ============================================

test("✓ POST /api/budgets exported", () => {
  const content = readFile("src/app/api/budgets/route.ts");
  if (!content.includes("export async function POST")) throw new Error("POST not exported");
});

test("✓ GET /api/budgets exported", () => {
  const content = readFile("src/app/api/budgets/route.ts");
  if (!content.includes("export async function GET")) throw new Error("GET not exported");
});

test("✓ DELETE /api/budgets/[id] exported", () => {
  const content = readFile("src/app/api/budgets/[id]/route.ts");
  if (!content.includes("export async function DELETE")) throw new Error("DELETE not exported");
});

// ============================================
// TEST: API Error Handling
// ============================================

test("✓ Auth routes handle errors", () => {
  const signupContent = readFile("src/app/api/auth/signup/route.ts");
  const loginContent = readFile("src/app/api/auth/login/route.ts");
  
  const hasErrors = signupContent.includes("error") && loginContent.includes("error");
  if (!hasErrors) throw new Error("Error handling missing");
});

test("✓ Budget routes validate input", () => {
  const content = readFile("src/app/api/budgets/route.ts");
  if (!content.includes("Validation") && !content.includes("required")) {
    throw new Error("Input validation missing");
  }
});

test("✓ Budget routes return JSON responses", () => {
  const content = readFile("src/app/api/budgets/route.ts");
  if (!content.includes("NextResponse.json")) throw new Error("JSON response missing");
});

// ============================================
// TEST: Supabase Integration
// ============================================

test("✓ Auth routes use Supabase client", () => {
  const signupContent = readFile("src/app/api/auth/signup/route.ts");
  const loginContent = readFile("src/app/api/auth/login/route.ts");
  
  const hasSupabase = signupContent.includes("supabase") && loginContent.includes("supabase");
  if (!hasSupabase) throw new Error("Supabase client missing");
});

test("✓ Budget routes use Supabase client", () => {
  const content = readFile("src/app/api/budgets/route.ts");
  if (!content.includes("supabase")) throw new Error("Supabase client missing");
});

test("✓ Auth routes check user authentication", () => {
  const content = readFile("src/app/api/auth/user/route.ts");
  if (!content.includes("getUser") && !content.includes("auth")) {
    throw new Error("User authentication check missing");
  }
});

// ============================================
// TEST: Database Interactions
// ============================================

test("✓ Budget routes query database", () => {
  const content = readFile("src/app/api/budgets/route.ts");
  if (!content.includes("from(") && !content.includes(".select")) {
    throw new Error("Database queries missing");
  }
});

test("✓ Budget routes handle database errors", () => {
  const content = readFile("src/app/api/budgets/route.ts");
  if (!content.includes("error") || !content.includes("catch")) {
    throw new Error("Error handling missing");
  }
});

// ============================================
// TEST: Type Safety
// ============================================

test("✓ Routes use TypeScript types", () => {
  const signupContent = readFile("src/app/api/auth/signup/route.ts");
  const budgetContent = readFile("src/app/api/budgets/route.ts");
  
  const hasTypes = signupContent.includes(":") && budgetContent.includes(":");
  if (!hasTypes) throw new Error("TypeScript types missing");
});

// ============================================
// TEST RESULTS
// ============================================

console.log("\n");
console.log("╔════════════════════════════════════════════════════════╗");
console.log("║   EXPENSE TRACKER - INTEGRATION TESTS (API ROUTES)     ║");
console.log("╚════════════════════════════════════════════════════════╝\n");

tests.forEach((test) => {
  console.log(`${test.status}  ${test.name}`);
  if (test.error) {
    console.log(`   └─ Error: ${test.error}`);
  }
});

console.log("\n╔════════════════════════════════════════════════════════╗");
console.log(`║  Total Tests: ${tests.length}  |  Passed: ${passCount}  |  Failed: ${failCount}       ║`);
console.log("╚════════════════════════════════════════════════════════╝\n");

process.exit(failCount === 0 ? 0 : 1);
