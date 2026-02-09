# Database Architecture

## Overview

Expense Tracker uses PostgreSQL (via Supabase) with the following design principles:
- Normalized schema to prevent data redundancy
- Row Level Security (RLS) for user data isolation
- Efficient indexing for query performance
- Audit logging for compliance

## Database Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   auth.users (Supabase)                 │
│                    (id, email, ...)                      │
└──────────────────────────┬──────────────────────────────┘
         │
         ├──────────┬────────────┬────────────┬─────────────┐
         │          │            │            │             │
         v          v            v            v             v
    ┌─────────┐ ┌──────────┐ ┌─────────────┐ ┌────────┐ ┌──────────┐
    │ Profiles│ │Categories│ │Transactions │ │Budgets │ │ Sessions │
    └─────────┘ └──────────┘ └─────────────┘ └────────┘ └──────────┘
         │            │            │
         │            └────────────┴──────────────┐
         │                         │              │
         v                         v              v
    ┌──────────────────────────────────────────────────────────┐
    │          Transaction Tags & Audit Logs                  │
    └──────────────────────────────────────────────────────────┘
```

## Tables

### 1. user_profiles
User profile information and preferences.

**Columns:**
- `id` (UUID): Primary key
- `user_id` (UUID): Reference to auth.users (UNIQUE)
- `full_name` (VARCHAR): User's full name
- `email` (VARCHAR): User's email
- `avatar_url` (VARCHAR): Profile picture URL
- `timezone` (VARCHAR): User's timezone
- `currency` (VARCHAR): Preferred currency (default: VND)
- `language` (VARCHAR): Preferred language (default: vi)
- `preferences` (JSONB): User settings (theme, notifications, etc.)
- `last_login_at` (TIMESTAMP): Last login timestamp
- `created_at`, `updated_at` (TIMESTAMP)

**Indexes:**
- Primary key on `id`
- Unique constraint on `user_id`

### 2. categories
Transaction categories (Ăn uống, Di chuyển, etc.).

**Columns:**
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to auth.users
- `name` (VARCHAR): Category name
- `description` (TEXT): Category description
- `color` (VARCHAR): Hex color code
- `icon` (VARCHAR): Icon name
- `type` (VARCHAR): 'expense', 'income', or 'both'
- `is_default` (BOOLEAN): Is this a default category?
- `order_index` (INTEGER): Display order
- `created_at`, `updated_at` (TIMESTAMP)

**Indexes:**
- Unique on `(user_id, LOWER(name))`
- On `user_id`
- On `type`

**RLS Policies:**
- Users can only see their own categories
- Users can only modify their own categories

### 3. transactions
Individual income and expense transactions.

**Columns:**
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to auth.users
- `category_id` (UUID): Foreign key to categories (nullable)
- `amount` (DECIMAL): Transaction amount
- `description` (VARCHAR): Short description
- `notes` (TEXT): Additional notes
- `type` (VARCHAR): 'income' or 'expense'
- `currency` (VARCHAR): Currency code
- `transaction_date` (DATE): When transaction occurred
- `payment_method` (VARCHAR): How it was paid (cash, card, etc.)
- `tags` (TEXT[]): Array of tags
- `is_recurring` (BOOLEAN): Is it a recurring transaction?
- `recurrence_pattern` (VARCHAR): Pattern if recurring
- `recurrence_end_date` (DATE): When recurrence ends
- `receipt_url` (VARCHAR): Receipt image URL
- `created_at`, `updated_at` (TIMESTAMP)

**Indexes:**
- On `user_id`
- On `(user_id, transaction_date DESC)` - for date range queries
- On `category_id`
- On `type`
- On `created_at DESC`

**RLS Policies:**
- Users can only see their own transactions
- Users can only modify their own transactions

### 4. transaction_tags
Frequently used tags for quick categorization.

**Columns:**
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to auth.users
- `tag_name` (VARCHAR): Tag text
- `usage_count` (INTEGER): How many times used
- `created_at` (TIMESTAMP)

**Indexes:**
- Unique on `(user_id, LOWER(tag_name))`
- On `user_id`

### 5. budgets
Monthly/yearly spending budgets.

**Columns:**
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to auth.users
- `category_id` (UUID): Foreign key to categories (nullable)
- `name` (VARCHAR): Budget name
- `limit_amount` (DECIMAL): Budget limit
- `period` (VARCHAR): 'daily', 'weekly', 'monthly', 'yearly'
- `currency` (VARCHAR): Currency code
- `start_date` (DATE): When budget starts
- `end_date` (DATE): When budget ends (nullable)
- `alert_threshold` (INTEGER): Alert at X% (default: 80)
- `is_active` (BOOLEAN): Is budget active?
- `created_at`, `updated_at` (TIMESTAMP)

**Indexes:**
- On `user_id`
- On `category_id`
- On `period`

### 6. audit_logs
Activity logging for compliance and debugging.

**Columns:**
- `id` (UUID): Primary key
- `user_id` (UUID): Who performed action
- `action` (VARCHAR): Action type (CREATE, UPDATE, DELETE)
- `entity_type` (VARCHAR): What was affected (transaction, category)
- `entity_id` (UUID): Which record
- `old_values` (JSONB): Previous values
- `new_values` (JSONB): New values
- `ip_address` (INET): User's IP
- `user_agent` (TEXT): Browser info
- `timestamp` (TIMESTAMP): When it happened

**Indexes:**
- On `user_id`
- On `timestamp DESC`
- On `action`

### 7. sessions
User session management.

**Columns:**
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to auth.users
- `refresh_token` (VARCHAR): JWT refresh token
- `expires_at` (TIMESTAMP): When session expires
- `device_info` (JSONB): Device details
- `ip_address` (INET): IP address
- `is_valid` (BOOLEAN): Is session valid?
- `created_at` (TIMESTAMP)

**Indexes:**
- On `(user_id, is_valid)`
- On `expires_at`

## Views

### monthly_spending_by_category
Monthly aggregated spending by category.

```sql
SELECT
  user_id,
  year,
  month,
  category_id,
  expenses,
  income,
  transaction_count
FROM monthly_spending_by_category;
```

### daily_transaction_summary
Daily transaction totals.

```sql
SELECT
  user_id,
  transaction_date,
  total_expenses,
  total_income,
  transaction_count,
  category_count
FROM daily_transaction_summary;
```

## Functions

### get_user_balance(user_id)
Calculate user's total balance.

```sql
SELECT get_user_balance('user-id-here');
-- Returns: DECIMAL (total income - total expenses)
```

### get_spending_by_category(user_id, start_date, end_date)
Get spending breakdown by category for a date range.

```sql
SELECT * FROM get_spending_by_category(
  'user-id',
  '2024-01-01'::DATE,
  '2024-12-31'::DATE
);
-- Returns: category_id, category_name, total_amount, transaction_count
```

## Data Integrity

### Constraints
- Foreign key constraints prevent orphaned records
- Unique constraints ensure data consistency
- Check constraints validate column values

### Cascading Deletes
- Deleting a user deletes all their data
- Deleting a category sets transaction.category_id to NULL
- Deleting a budget doesn't affect transactions

### Triggers
- `update_updated_at_column()` maintains `updated_at` timestamps
- Applied to: user_profiles, categories, transactions, budgets

## Query Optimization

### Best Practices

**1. Use Indexes Effectively**
```sql
-- ✅ GOOD - Uses index on (user_id, transaction_date DESC)
SELECT * FROM transactions
WHERE user_id = '...'
  AND transaction_date BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY transaction_date DESC;

-- ❌ BAD - Full table scan
SELECT * FROM transactions
WHERE EXTRACT(YEAR FROM transaction_date) = 2024;
```

**2. Avoid N+1 Queries**
```typescript
// ❌ BAD - N+1 problem
const transactions = await db.select().from(transactions);
for (const tx of transactions) {
  const category = await db.select().from(categories).where(...);
}

// ✅ GOOD - Single query with JOIN
const results = await db.select()
  .from(transactions)
  .leftJoin(categories, eq(transactions.category_id, categories.id));
```

**3. Use Views for Complex Aggregations**
```sql
-- Instead of complex query, use view
SELECT * FROM monthly_spending_by_category;
```

### Query Examples

**Get Monthly Spending**
```sql
SELECT
  category_id,
  SUM(amount) as total
FROM transactions
WHERE user_id = $1
  AND type = 'expense'
  AND transaction_date >= $2
  AND transaction_date < $3
GROUP BY category_id;
```

**Get Top Spending Categories**
```sql
SELECT
  c.name,
  SUM(t.amount) as total
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.user_id = $1 AND t.type = 'expense'
GROUP BY c.id, c.name
ORDER BY total DESC
LIMIT 10;
```

**Check Budget Status**
```sql
SELECT
  b.name,
  b.limit_amount,
  COALESCE(SUM(t.amount), 0) as spent,
  ROUND(100.0 * COALESCE(SUM(t.amount), 0) / b.limit_amount, 2) as percentage
FROM budgets b
LEFT JOIN transactions t ON (
  t.user_id = b.user_id
  AND t.category_id = b.category_id
  AND t.type = 'expense'
  AND t.transaction_date >= b.start_date
  AND (b.end_date IS NULL OR t.transaction_date <= b.end_date)
)
WHERE b.user_id = $1 AND b.is_active = true
GROUP BY b.id, b.name, b.limit_amount;
```

## Performance Metrics

### Expected Query Times
- Single transaction lookup: < 1ms
- Monthly spending aggregation: < 50ms
- Annual report (full scan): < 500ms
- Dashboard load: < 2s (with caching)

### Optimization Tips

1. **Add Composite Indexes** for frequent filter combinations
2. **Partition Large Tables** if > 100M rows
3. **Archive Old Data** (> 2 years) to separate table
4. **Use Connection Pooling** (Supabase does this automatically)
5. **Cache Aggregations** at application level

## Backup & Recovery

### Automated Backups
- Daily automatic backups (Supabase Pro)
- 30-day retention
- Point-in-time recovery available

### Manual Backup
```bash
supabase db pull > backup.sql
```

### Restore
```bash
supabase db push < backup.sql
```

## Migration Strategy

### Adding New Column
```sql
-- Step 1: Add column as nullable
ALTER TABLE transactions ADD COLUMN new_field VARCHAR(100);

-- Step 2: Deploy code that handles both old and new
-- (This allows rollback if needed)

-- Step 3: Deploy code that populates new column
UPDATE transactions SET new_field = ... WHERE new_field IS NULL;

-- Step 4: Make column NOT NULL (optional)
ALTER TABLE transactions ALTER COLUMN new_field SET NOT NULL;
```

### Zero-Downtime Migration
1. Add column as nullable
2. Deploy new code version
3. Backfill data
4. Make NOT NULL
5. Remove old column in future migration

## Monitoring

### Key Metrics
- Query execution time
- Row count per table
- Storage usage
- Slow query logs

### Supabase Monitoring
```
Supabase Dashboard → Monitoring
- Database overview
- Query performance
- Connection count
- Storage usage
```

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
