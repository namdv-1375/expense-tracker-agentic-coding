-- ============================================
-- EXPENSE TRACKER DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  email VARCHAR(255),
  avatar_url VARCHAR(500),
  timezone VARCHAR(100) DEFAULT 'UTC',
  currency VARCHAR(3) DEFAULT 'VND',
  language VARCHAR(10) DEFAULT 'vi',
  preferences JSONB DEFAULT '{"theme": "light", "notifications": true}'::jsonb,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create index on user_id
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(50),
  icon VARCHAR(50),
  type VARCHAR(20) CHECK (type IN ('expense', 'income', 'both')) DEFAULT 'both',
  is_default BOOLEAN DEFAULT false,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create unique constraint on user_id and name
CREATE UNIQUE INDEX idx_categories_user_name ON categories(user_id, LOWER(name));
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description VARCHAR(500),
  notes TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  currency VARCHAR(3) DEFAULT 'VND',
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method VARCHAR(50),
  tags TEXT[] DEFAULT ARRAY[]::text[],
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern VARCHAR(50),
  recurrence_end_date DATE,
  receipt_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- ============================================
-- TRANSACTION TAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS transaction_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_name VARCHAR(100) NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

CREATE UNIQUE INDEX idx_transaction_tags_user_tag ON transaction_tags(user_id, LOWER(tag_name));
CREATE INDEX idx_transaction_tags_user_id ON transaction_tags(user_id);

-- ============================================
-- BUDGET TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  limit_amount DECIMAL(15, 2) NOT NULL,
  period VARCHAR(20) CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')) DEFAULT 'monthly',
  currency VARCHAR(3) DEFAULT 'VND',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  alert_threshold INTEGER DEFAULT 80,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_category_id ON budgets(category_id);
CREATE INDEX idx_budgets_period ON budgets(period);

-- ============================================
-- AUDIT LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ============================================
-- SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  refresh_token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  device_info JSONB,
  ip_address INET,
  is_valid BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id, is_valid);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their profile"
ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Categories Policies
CREATE POLICY "Users can view their own categories"
ON categories FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create categories"
ON categories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
ON categories FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
ON categories FOR DELETE
USING (auth.uid() = user_id);

-- Transactions Policies
CREATE POLICY "Users can view their own transactions"
ON transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create transactions"
ON transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
ON transactions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
ON transactions FOR DELETE
USING (auth.uid() = user_id);

-- Transaction Tags Policies
CREATE POLICY "Users can view their own tags"
ON transaction_tags FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create tags"
ON transaction_tags FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
ON transaction_tags FOR UPDATE
USING (auth.uid() = user_id);

-- Budgets Policies
CREATE POLICY "Users can view their own budgets"
ON budgets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create budgets"
ON budgets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets"
ON budgets FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
BEFORE UPDATE ON budgets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS
-- ============================================

-- Monthly spending by category
CREATE OR REPLACE VIEW monthly_spending_by_category AS
SELECT
  user_id,
  EXTRACT(YEAR FROM transaction_date)::int as year,
  EXTRACT(MONTH FROM transaction_date)::int as month,
  category_id,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
  COUNT(*) as transaction_count
FROM transactions
WHERE type IN ('income', 'expense')
GROUP BY user_id, EXTRACT(YEAR FROM transaction_date), EXTRACT(MONTH FROM transaction_date), category_id;

-- Daily transaction summary
CREATE OR REPLACE VIEW daily_transaction_summary AS
SELECT
  user_id,
  transaction_date,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
  COUNT(*) as transaction_count,
  COUNT(DISTINCT category_id) as category_count
FROM transactions
GROUP BY user_id, transaction_date;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Get user balance
CREATE OR REPLACE FUNCTION get_user_balance(p_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_balance DECIMAL;
BEGIN
  SELECT
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0)
  INTO v_balance
  FROM transactions
  WHERE user_id = p_user_id;
  
  RETURN v_balance;
END;
$$ LANGUAGE plpgsql;

-- Get spending by category for period
CREATE OR REPLACE FUNCTION get_spending_by_category(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE(category_id UUID, category_name VARCHAR, total_amount DECIMAL, transaction_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    SUM(t.amount),
    COUNT(*)
  FROM transactions t
  LEFT JOIN categories c ON t.category_id = c.id
  WHERE t.user_id = p_user_id
    AND t.type = 'expense'
    AND t.transaction_date BETWEEN p_start_date AND p_end_date
  GROUP BY c.id, c.name
  ORDER BY SUM(t.amount) DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA (Optional - Comment out in production)
-- ============================================

-- Note: These seed queries are disabled by default
-- Uncomment and modify to add sample data during development
/*
INSERT INTO categories (user_id, name, color, type) VALUES
('00000000-0000-0000-0000-000000000000', 'Ăn uống', '#ef4444', 'expense'),
('00000000-0000-0000-0000-000000000000', 'Di chuyển', '#3b82f6', 'expense'),
('00000000-0000-0000-0000-000000000000', 'Giải trí', '#a855f7', 'expense'),
('00000000-0000-0000-0000-000000000000', 'Lương', '#22c55e', 'income');
*/

-- ============================================
-- FINAL VERIFICATION
-- ============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify tables created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'transactions'
  ) THEN
    RAISE NOTICE 'Database schema created successfully!';
  ELSE
    RAISE EXCEPTION 'Database schema creation failed!';
  END IF;
END $$;
