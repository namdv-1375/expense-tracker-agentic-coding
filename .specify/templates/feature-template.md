# Feature Specification Template

**Project**: Expense Tracker  
**Feature**: Budget Tracking
**Status**: DRAFT  

## 1. Overview
Người dùng có thể set budget hàng tháng cho mỗi danh mục 
và theo dõi chi tiêu so với budget để biết còn bao nhiêu tiền.

## 2. User Stories

### US-001: Tạo Budget
**As a** người dùng
**I want to** set budget cho danh mục
**So that** tôi biết chi tiêu tối đa

**Acceptance Criteria**:
- [ ] Có nút "Add Budget" trên Dashboard
- [ ] Form có: dropdown category, input amount, input month
- [ ] Nhấn "Save" → budget được lưu vào database
- [ ] Hiển thị success message

### US-002: Xem Budget Status
**As a** người dùng
**I want to** thấy chi tiêu so budget
**So that** tôi biết còn bao nhiêu tiền

**Acceptance Criteria**:
- [ ] Dashboard show progress bar cho mỗi budget
- [ ] Show "3 triệu / 5 triệu (60%)"
- [ ] Progress bar màu xanh nếu < 80%, đỏ nếu > 80%