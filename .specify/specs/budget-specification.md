# Budget Tracking Feature Specification

## Overview
Budget tracking feature cho phép người dùng thiết lập ngân sách theo danh mục và theo dõi chi tiêu so với ngân sách đã đặt.

## User Stories

### Story 1: Create Budget
**As a** user  
**I want to** create a budget for a spending category  
**So that** I can track my spending against planned limits

**Acceptance Criteria:**
- User can select a category from dropdown
- User can input budget amount (positive number)
- User can select month/period
- Budget is saved to database
- Budget appears immediately in list
- Cannot create duplicate budget (same category + month)

### Story 2: View Budget Status
**As a** user  
**I want to** see my spending progress against budget  
**So that** I can monitor if I'm within limits

**Acceptance Criteria:**
- Budget shows total amount & remaining
- Progress bar displays percentage (0-100%)
- Color changes based on spending:
  - Green: < 80% spent
  - Orange/Red: ≥ 80% spent
- Budget shows current month spending

### Story 3: Filter Budgets by Month
**As a** user  
**I want to** filter budgets by month  
**So that** I can see budgets for specific periods

**Acceptance Criteria:**
- Month filter dropdown shows all months with budgets
- Selecting month shows only that month's budgets
- "All Months" option shows all budgets
- Default is current month

### Story 4: Delete Budget
**As a** user  
**I want to** delete a budget  
**So that** I can remove outdated budgets

**Acceptance Criteria:**
- Delete button removes budget immediately
- Deleted budget no longer appears in list
- Transaction history remains intact
- User confirmation not required (can undo later)

## API Endpoints

### POST /api/budgets
Create new budget

**Request:**
```json
{
  "category_id": "uuid",
  "amount": 500000,
  "month": "2024-02"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "category_id": "uuid",
  "amount": 500000,
  "month": "2024-02-01",
  "created_at": "ISO-timestamp",
  "updated_at": "ISO-timestamp"
}
```

**Errors:**
- 400: Missing required fields
- 400: Invalid amount (must be > 0)
- 400: Invalid month format (YYYY-MM)
- 409: Budget already exists for this category & month
- 401: Unauthorized

### GET /api/budgets
Get user's budgets with spending calculation

**Query Params:**
- `month` (optional): Filter by month (YYYY-MM)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "category_id": "uuid",
    "amount": 500000,
    "spent": 200000,
    "percentage": 40,
    "status": "OK",
    "month": "2024-02-01",
    "categories": {
      "id": "uuid",
      "name": "Food",
      "color": "bg-red-500"
    }
  }
]
```

### DELETE /api/budgets/[id]
Delete budget

**Response (200):**
```json
{
  "success": true,
  "message": "Budget deleted"
}
```

**Errors:**
- 404: Budget not found
- 401: Unauthorized (user doesn't own budget)

## Database Schema

### budgets table
```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  category_id UUID NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  month DATE NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, category_id, month),
  FOREIGN KEY(user_id) REFERENCES auth.users(id),
  FOREIGN KEY(category_id) REFERENCES categories(id)
);
```

### Row Level Security
- Users can only see their own budgets
- Users can only create/update/delete their own budgets

## UI Components

### BudgetForm
- Input: category selector, amount, month
- Validation: amount > 0, required fields
- Action: Submit creates budget
- Feedback: Success/error messages

### BudgetProgressBar
- Display: [Spent Amount] / [Total Amount]
- Progress: Visual bar showing percentage
- Color: Green (<80%), Orange/Red (≥80%)
- Warning text when over 80%

### BudgetList
- Display: All budgets (filtered by month if selected)
- Actions: Delete button per budget
- Filter: Month dropdown
- Empty state: "No budgets yet"

## Non-Functional Requirements

### Performance
- API response < 500ms
- Load budgets with spending calculation efficiently
- Pagination (20 budgets per page) if many budgets

### Security
- RLS policies enforce user isolation
- Service role key for admin operations only
- Validate all inputs
- No SQL injection possible

### Data Integrity
- Cannot have duplicate (user + category + month)
- Soft delete not needed (permanent delete OK)
- Transaction spending calculations correct

## Acceptance Criteria Summary

✅ User can create budget  
✅ User can view budget progress  
✅ User can filter by month  
✅ User can delete budget  
✅ API validates inputs  
✅ Database enforces constraints  
✅ RLS prevents unauthorized access  
✅ All tests passing  

## Success Metrics

- ✅ All 4 user stories implemented
- ✅ All API endpoints working
- ✅ 17 integration tests passing
- ✅ RLS policies enforcing security
- ✅ < 500ms response time
