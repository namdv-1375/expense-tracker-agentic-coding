const fs = require("fs");
const path = require("path");

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
// TEST: Component Imports & Exports
// ============================================

test("✓ Navigation component exports default", () => {
  const content = readFile("src/components/Navigation.tsx");
  if (!content.includes("export default")) throw new Error("No export default");
});

test("✓ Dashboard component exports default", () => {
  const content = readFile("src/components/Dashboard.tsx");
  if (!content.includes("export default")) throw new Error("No export default");
});

test("✓ TransactionForm component exports default", () => {
  const content = readFile("src/components/TransactionForm.tsx");
  if (!content.includes("export default")) throw new Error("No export default");
});

test("✓ TransactionList component exports default", () => {
  const content = readFile("src/components/TransactionList.tsx");
  if (!content.includes("export default")) throw new Error("No export default");
});

test("✓ CategoryManager component exports default", () => {
  const content = readFile("src/components/CategoryManager.tsx");
  if (!content.includes("export default")) throw new Error("No export default");
});

test("✓ BudgetForm component exports default", () => {
  const content = readFile("src/components/BudgetForm.tsx");
  if (!content.includes("export default")) throw new Error("No export default");
});

test("✓ BudgetList component exports default", () => {
  const content = readFile("src/components/BudgetList.tsx");
  if (!content.includes("export default")) throw new Error("No export default");
});

test("✓ BudgetProgressBar component exports default", () => {
  const content = readFile("src/components/BudgetProgressBar.tsx");
  if (!content.includes("export default")) throw new Error("No export default");
});

// ============================================
// TEST: Component Props & Interface
// ============================================

test("✓ TransactionForm has CategoryManager props", () => {
  const content = readFile("src/components/TransactionForm.tsx");
  if (!content.includes("categories") || !content.includes("Category")) {
    throw new Error("Missing expected props");
  }
});

test("✓ BudgetForm component accepts categories", () => {
  const content = readFile("src/components/BudgetForm.tsx");
  if (!content.includes("categories")) throw new Error("Missing categories prop");
});

test("✓ Dashboard component imports types", () => {
  const content = readFile("src/components/Dashboard.tsx");
  if (!content.includes("Transaction") || !content.includes("Category")) {
    throw new Error("Missing type imports");
  }
});

// ============================================
// TEST: Types Definition
// ============================================

test("✓ Transaction type defined", () => {
  const content = readFile("src/types/index.ts");
  if (!content.includes("interface Transaction")) throw new Error("Transaction type missing");
});

test("✓ Category type defined", () => {
  const content = readFile("src/types/index.ts");
  if (!content.includes("interface Category")) throw new Error("Category type missing");
});

test("✓ Types have required fields", () => {
  const content = readFile("src/types/index.ts");
  const hasId = content.includes("id:") || content.includes("id ");
  const hasName = content.includes("name:");
  if (!hasId || !hasName) throw new Error("Missing required fields");
});

// ============================================
// TEST: Hooks & State Management
// ============================================

test("✓ Components use React hooks", () => {
  const navigationContent = readFile("src/components/Navigation.tsx");
  const formContent = readFile("src/components/TransactionForm.tsx");
  
  const hasHooks = navigationContent.includes("useState") || formContent.includes("useState");
  if (!hasHooks) throw new Error("No React hooks found");
});

test("✓ BudgetForm uses form state", () => {
  const content = readFile("src/components/BudgetForm.tsx");
  if (!content.includes("useState") || !content.includes("formData")) {
    throw new Error("Form state management missing");
  }
});

test("✓ BudgetList fetches data", () => {
  const content = readFile("src/components/BudgetList.tsx");
  if (!content.includes("useEffect") || !content.includes("fetch")) {
    throw new Error("Data fetching logic missing");
  }
});

// ============================================
// TEST: Event Handlers
// ============================================

test("✓ TransactionForm has submit handler", () => {
  const content = readFile("src/components/TransactionForm.tsx");
  if (!content.includes("handleSubmit") || !content.includes("onSubmit")) {
    throw new Error("Submit handler missing");
  }
});

test("✓ BudgetForm has submit handler", () => {
  const content = readFile("src/components/BudgetForm.tsx");
  if (!content.includes("handleSubmit")) throw new Error("Submit handler missing");
});

test("✓ TransactionList has delete handler", () => {
  const content = readFile("src/components/TransactionList.tsx");
  if (!content.includes("onDeleteTransaction")) throw new Error("Delete handler missing");
});

// ============================================
// TEST: UI Elements
// ============================================

test("✓ Components render buttons", () => {
  const content = readFile("src/components/TransactionForm.tsx");
  if (!content.includes("button") && !content.includes("<button")) {
    throw new Error("No buttons found");
  }
});

test("✓ Components use input fields", () => {
  const formContent = readFile("src/components/TransactionForm.tsx");
  if (!formContent.includes("input")) throw new Error("No input fields");
});

test("✓ Dashboard renders charts", () => {
  const content = readFile("src/components/Dashboard.tsx");
  if (!content.includes("Chart") && !content.includes("Pie") && !content.includes("Line")) {
    throw new Error("No charts found");
  }
});

// ============================================
// TEST RESULTS
// ============================================

console.log("\n");
console.log("╔════════════════════════════════════════════════════════╗");
console.log("║     EXPENSE TRACKER - UNIT TESTS                       ║");
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
