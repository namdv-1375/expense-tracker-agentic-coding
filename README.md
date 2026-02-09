# Expense Tracker - Ứng dụng Quản lý Chi tiêu Cá nhân

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D20.9.0-green)
![Tests](https://img.shields.io/badge/tests-71%2F71%20PASSED-brightgreen)

## 🚀 Quick Start

### 1. Chuẩn bị
```bash
# Cài Node.js 20
nvm install 20
nvm use 20
```

### 2. Cài đặt
```bash
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker
npm install
```

### 3. Cấu hình
```bash
cp .env.local.example .env.local
```

### 4. Setup Database
```bash
supabase login
supabase link --project-ref your-project-ref
supabase migration up
```

### 5. Chạy
```bash
npm run dev
# Mở http://localhost:3000
```

## 📦 Tech

- **Frontend**: Next.js 16 • React 19 • TypeScript • Tailwind CSS
- **Backend**: Next.js API Routes • Supabase
- **Database**: PostgreSQL (Supabase)
- **Testing**: Node.js tests (71 automated)

## 📝 npm Scripts

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm test                 # Run all 71 tests
npm run test:basic       # File structure (31 tests)
npm run test:unit        # Components (23 tests)
npm run test:integration # API routes (17 tests)
npm run lint             # ESLint check
npm run type-check       # TypeScript check
```
