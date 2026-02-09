const fs = require("fs");
const path = require("path");

const tests = [];
let passCount = 0;
let failCount = 0;

// Helper function
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

// Helper to check file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Helper to read file
function readFile(filePath) {
  return fs.readFileSync(filePath, "utf-8");
}

// ============================================
// TEST 1: Core Files Exist
// ============================================

test("✓ src/app/page.tsx exists", () => {
  if (!fileExists("src/app/page.tsx")) throw new Error("File not found");
});

test("✓ src/app/layout.tsx exists", () => {
  if (!fileExists("src/app/layout.tsx")) throw new Error("File not found");
});

test("✓ package.json exists", () => {
  if (!fileExists("package.json")) throw new Error("File not found");
});

// ============================================
// TEST 2: Components Exist
// ============================================

test("✓ src/components/Navigation.tsx exists", () => {
  if (!fileExists("src/components/Navigation.tsx")) throw new Error("File not found");
});

test("✓ src/components/Dashboard.tsx exists", () => {
  if (!fileExists("src/components/Dashboard.tsx")) throw new Error("File not found");
});

test("✓ src/components/TransactionForm.tsx exists", () => {
  if (!fileExists("src/components/TransactionForm.tsx")) throw new Error("File not found");
});

test("✓ src/components/TransactionList.tsx exists", () => {
  if (!fileExists("src/components/TransactionList.tsx")) throw new Error("File not found");
});

test("✓ src/components/CategoryManager.tsx exists", () => {
  if (!fileExists("src/components/CategoryManager.tsx")) throw new Error("File not found");
});

test("✓ src/components/BudgetForm.tsx exists", () => {
  if (!fileExists("src/components/BudgetForm.tsx")) throw new Error("File not found");
});

test("✓ src/components/BudgetList.tsx exists", () => {
  if (!fileExists("src/components/BudgetList.tsx")) throw new Error("File not found");
});

test("✓ src/components/BudgetProgressBar.tsx exists", () => {
  if (!fileExists("src/components/BudgetProgressBar.tsx")) throw new Error("File not found");
});

// ============================================
// TEST 3: API Routes Exist
// ============================================

test("✓ src/app/api/auth/signup/route.ts exists", () => {
  if (!fileExists("src/app/api/auth/signup/route.ts")) throw new Error("File not found");
});

test("✓ src/app/api/auth/login/route.ts exists", () => {
  if (!fileExists("src/app/api/auth/login/route.ts")) throw new Error("File not found");
});

test("✓ src/app/api/auth/logout/route.ts exists", () => {
  if (!fileExists("src/app/api/auth/logout/route.ts")) throw new Error("File not found");
});

test("✓ src/app/api/budgets/route.ts exists", () => {
  if (!fileExists("src/app/api/budgets/route.ts")) throw new Error("File not found");
});

test("✓ src/app/api/budgets/[id]/route.ts exists", () => {
  if (!fileExists("src/app/api/budgets/[id]/route.ts")) throw new Error("File not found");
});

// ============================================
// TEST 4: Database Migrations Exist
// ============================================

test("✓ supabase/migrations/init.sql exists", () => {
  if (!fileExists("supabase/migrations/init.sql")) throw new Error("File not found");
});

test("✓ supabase/migrations/add-budgets-table.sql exists", () => {
  if (!fileExists("supabase/migrations/add-budgets-table.sql")) throw new Error("File not found");
});

// ============================================
// TEST 5: SDD Specifications Exist
// ============================================

test("✓ .specify/constitution.md exists", () => {
  if (!fileExists(".specify/constitution.md")) throw new Error("File not found");
});

test("✓ .specify/specs/budget-specification.md exists", () => {
  if (!fileExists(".specify/specs/budget-specification.md")) throw new Error("File not found");
});

test("✓ .specify/plans/budget-tracking-plan.md exists", () => {
  if (!fileExists(".specify/plans/budget-tracking-plan.md")) throw new Error("File not found");
});

// ============================================
// TEST 6: Templates Exist
// ============================================

test("✓ .specify/templates/feature-template.md exists", () => {
  if (!fileExists(".specify/templates/feature-template.md")) throw new Error("File not found");
});

test("✓ .cursor/mcp-config.json exists", () => {
  if (!fileExists(".cursor/mcp-config.json")) throw new Error("File not found");
});

// ============================================
// TEST 7: Configuration Files Exist
// ============================================

test("✓ tsconfig.json exists", () => {
  if (!fileExists("tsconfig.json")) throw new Error("File not found");
});

test("✓ next.config.ts exists", () => {
  if (!fileExists("next.config.ts")) throw new Error("File not found");
});

test("✓ package.json has correct structure", () => {
  const content = readFile("package.json");
  const pkg = JSON.parse(content);
  if (!pkg.dependencies) throw new Error("Missing dependencies");
  if (!pkg.scripts) throw new Error("Missing scripts");
});

// ============================================
// TEST 8: Dependencies Installed
// ============================================

test("✓ node_modules exists", () => {
  if (!fileExists("node_modules")) throw new Error("node_modules not found - run npm install");
});

test("✓ react package installed", () => {
  if (!fileExists("node_modules/react")) throw new Error("react not installed");
});

test("✓ next package installed", () => {
  if (!fileExists("node_modules/next")) throw new Error("next not installed");
});

test("✓ supabase packages installed", () => {
  if (!fileExists("node_modules/@supabase")) throw new Error("@supabase not installed");
});

test("✓ recharts package installed", () => {
  if (!fileExists("node_modules/recharts")) throw new Error("recharts not installed");
});

// ============================================
// TEST RESULTS
// ============================================

console.log("\n");
console.log("╔════════════════════════════════════════════════════════╗");
console.log("║     EXPENSE TRACKER - BASIC TEST RESULTS               ║");
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

if (failCount === 0) {
  console.log("🎉 ALL TESTS PASSED!\n");
  console.log("Next steps:");
  console.log("  1. Setup Supabase: Create .env.local file");
  console.log("  2. Add environment variables:");
  console.log("     NEXT_PUBLIC_SUPABASE_URL=your-url");
  console.log("     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key");
  console.log("  3. Run migrations: supabase migration up");
  console.log("  4. Start dev: npm run dev");
  console.log("\n");
  process.exit(0);
} else {
  console.log("❌ SOME TESTS FAILED\n");
  process.exit(1);
}
