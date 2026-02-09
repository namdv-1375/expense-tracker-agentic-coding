# Implementation Plan: Budget Tracking

**Feature**: Budget Tracking  
**Status**: PLANNING  
**Created**: 2026-02-09  
**Estimated Timeline**: 3 days

---

## 📐 Architecture Design

### System Flow

```
User Interface (Frontend)
    ↓
[BudgetForm.tsx] → User nhập (category, amount, month)
    ↓
[POST /api/budgets] → Backend validate + insert
    ↓
[Supabase] → Save to budgets table
    ↓
[BudgetList.tsx] → Hiển thị progress bar
    ↓
[GET /api/budgets] → Lấy data từ DB
```

### Technology Stack

**Frontend:**
- React hooks (useState, useEffect)
- TypeScript
- Tailwind CSS for styling

**Backend:**
- Next.js API routes
- Supabase client

**Database:**
- PostgreSQL (Supabase)
- Row Level Security (RLS)

---

## 📋 Task Breakdown

### Task 1: Database Setup (1 day)

**Sub-tasks:**
1. Create `budgets` table
   - Columns: id, user_id, category_id, amount, month, created_at
   - Primary key: id (UUID)
   - Foreign keys: user_id → auth.users, category_id → categories

2. Add RLS (Row Level Security)
   - Policy: Users can only see their own budgets
   - Policy: Users can only insert/update/delete their own budgets

3. Add Database Indexes
   - Index on user_id (for fast queries)
   - Index on (user_id, month) (for monthly reports)

**SQL Script:**
```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  month DATE NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, category_id, month)
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budgets"
  ON budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budgets"
  ON budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets"
  ON budgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets"
  ON budgets FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_user_month ON budgets(user_id, month);
```

---

### Task 2: Backend API Routes (1 day)

**Route 1: POST /api/budgets** (Create Budget)
- File: `src/app/api/budgets/route.ts`
- Validates:
  - amount > 0
  - category_id exists
  - month is valid
  - user_id matches auth user
- Returns: Created budget object
- Error handling: 400 for validation errors, 500 for DB errors

**Code Structure:**
```typescript
POST /api/budgets
Input: {
  category_id: string (UUID),
  amount: number,
  month: string (YYYY-MM)
}
Output: {
  id: string,
  user_id: string,
  category_id: string,
  amount: number,
  month: string,
  created_at: string
}
```

**Route 2: GET /api/budgets** (Get All User Budgets)
- File: `src/app/api/budgets/route.ts` (same file)
- Query params: ?month=2026-02 (optional filter)
- Returns: Array of budget objects with spent amount
- Calculated fields: 
  - spent: sum of transactions for this budget
  - percentage: (spent / amount) * 100
  - status: "OK" if < 80%, "WARNING" if >= 80%

**Code Structure:**
```typescript
GET /api/budgets?month=2026-02
Output: [
  {
    id: string,
    category_id: string,
    amount: number,
    month: string,
    spent: number,
    percentage: number,
    status: string
  }
]
```

**Route 3: DELETE /api/budgets/[id]** (Delete Budget)
- File: `src/app/api/budgets/[id]/route.ts`
- Validates: budget belongs to current user
- Returns: { success: true }
- Error: 404 if not found, 403 if not authorized

---

### Task 3: Frontend Components (1 day)

**Component 1: BudgetForm.tsx** (Form to Create Budget)
- Input fields:
  - Category dropdown (get from existing categories)
  - Amount input (number, > 0)
  - Month picker (date picker for YYYY-MM)
- Submit button: "Create Budget"
- Actions:
  - On submit: POST to /api/budgets
  - Show loading spinner
  - Show success/error message
  - Clear form on success
- Validation: Client-side before submit

**Component 2: BudgetList.tsx** (List All Budgets)
- Display list of budgets with:
  - Category name
  - Amount budgeted
  - Amount spent
  - Progress bar
  - Percentage (0-100%)
  - Delete button
- Data:
  - GET from /api/budgets on mount
  - Refresh when budget created/deleted
- Sorting: By month (latest first)

**Component 3: BudgetProgressBar.tsx** (Reusable Progress Component)
- Props:
  - spent: number
  - total: number
- Renders:
  - Colored bar (green if < 80%, red if >= 80%)
  - Percentage text
  - Amount text "X / Y"

**Integration: Add to Dashboard**
- Import BudgetList
- Add section "Monthly Budget"
- Show budgets for current month
- Add link to "Manage Budgets"

---

## 🔗 Dependencies

### Must Have (Already Available)
✅ Supabase setup (auth, client)
✅ API routes structure
✅ React component setup
✅ TypeScript configuration
✅ categories table (for dropdown)
✅ transactions table (for spending calculation)

### Must Create
❌ budgets table
❌ POST /api/budgets route
❌ GET /api/budgets route
❌ DELETE /api/budgets/:id route
❌ BudgetForm component
❌ BudgetList component
❌ BudgetProgressBar component

### External Dependencies
- Supabase JS client (already installed)
- React (already installed)
- TypeScript (already configured)

---

## ⏱️ Timeline & Milestones

### Day 1: Database
- [ ] Write SQL migration
- [ ] Test migration locally
- [ ] Verify RLS policies work
- [ ] Create database indexes

**Deliverable**: Working `budgets` table with security

---

### Day 2: Backend API
- [ ] Implement POST /api/budgets
- [ ] Implement GET /api/budgets
- [ ] Implement DELETE /api/budgets/:id
- [ ] Add validation for all inputs
- [ ] Test all endpoints with Postman/Curl

**Deliverable**: Working API endpoints

---

### Day 3: Frontend
- [ ] Create BudgetForm component
- [ ] Create BudgetList component
- [ ] Create BudgetProgressBar component
- [ ] Integrate to Dashboard
- [ ] Test UI in browser
- [ ] Test on mobile

**Deliverable**: Working UI + integrated in app

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// Test BudgetForm validation
test('Form rejects negative amounts')
test('Form requires category selection')
test('Form requires valid month')

// Test BudgetList rendering
test('BudgetList displays all budgets')
test('BudgetList shows correct percentage')
test('BudgetList deletes budget on button click')

// Test BudgetProgressBar
test('Progress bar shows correct color for < 80%')
test('Progress bar shows correct color for >= 80%')
```

### API Tests
```typescript
// Test POST /api/budgets
test('Create budget with valid data')
test('Reject budget with amount <= 0')
test('Reject if category_id is invalid')
test('Only save for current user')

// Test GET /api/budgets
test('Return only user\'s budgets')
test('Calculate spent amount correctly')
test('Calculate percentage correctly')

// Test DELETE /api/budgets/:id
test('Delete budget successfully')
test('Return 404 if not found')
test('Prevent delete if not owner')
```

### Manual Testing
```
1. Create new budget
   [ ] Can add budget
   [ ] See in list immediately
   [ ] Amount saved correctly

2. View budget status
   [ ] Progress bar shows
   [ ] Percentage calculated correctly
   [ ] Color changes at 80%

3. Delete budget
   [ ] Can delete
   [ ] Removed from list
   [ ] Can recreate

4. Permissions
   [ ] Can't see other user's budgets
   [ ] Can't delete other user's budgets

5. Edge cases
   [ ] Same category, different months
   [ ] Very large amounts
   [ ] Very small amounts (0.01)
   [ ] Mobile responsive
```

---

## ⚠️ Risks & Mitigation

### Risk 1: Budget enforcement
**Problem**: User can spend more than budget (no real constraint)
**Impact**: Low (UX issue, not blocking)
**Mitigation**: 
- Show warning when spending > 80%
- Add email alert (Phase 2)
- Document limitation

### Risk 2: Performance
**Problem**: Many budgets slow down query
**Impact**: Medium (only if 1000+ budgets)
**Mitigation**:
- Add indexes (done)
- Implement pagination (Phase 2)
- Cache results (Phase 2)

### Risk 3: Data integrity
**Problem**: Budget deleted but transactions remain
**Impact**: Low (transactions still valid)
**Mitigation**:
- Use CASCADE delete
- Track budget history (Phase 2)

---

## 📦 Deliverables

### At End of Day 1 (Database)
- SQL migration file
- RLS policies verified
- Indexes created

### At End of Day 2 (API)
- 3 working API routes
- Error handling working
- Data validation passing

### At End of Day 3 (Frontend)
- All components created
- Integrated in Dashboard
- All tests passing
- Mobile responsive

### Git Commit
```bash
git commit -m "feat: Add budget tracking feature

- Create budgets table with RLS policies
- Add POST /api/budgets endpoint
- Add GET /api/budgets endpoint
- Add DELETE /api/budgets/:id endpoint
- Add BudgetForm, BudgetList, BudgetProgressBar components
- Integrate budget tracking to Dashboard
- Add unit and integration tests"
```

---

## 📊 Success Criteria

✅ All user stories from spec are complete
✅ All acceptance criteria met
✅ All tests passing
✅ Code reviewed and approved
✅ No linter errors
✅ Works on desktop and mobile
✅ Performance acceptable (< 500ms API response)
✅ RLS policies working (users can't see others' budgets)

---

**Status**: Ready to Implement! 🚀

Next Phase: ANALYZE - Check if ready to code
