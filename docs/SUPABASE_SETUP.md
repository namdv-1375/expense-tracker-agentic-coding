# Supabase Setup Guide

## Quick Start

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or login
3. Click "New Project"
4. Fill in project details:
   - **Name**: expense-tracker
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to users (e.g., Singapore for Asia)
5. Click "Create new project"

### 2. Get API Keys
In Supabase Dashboard:
- Go to Settings → API
- Copy:
  - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
  - **Anon Public Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **Service Role Key**: `SUPABASE_SERVICE_ROLE_KEY`

### 3. Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Database Schema Setup

### Method 1: Using Supabase Dashboard (Simple)

1. Go to SQL Editor in Supabase Dashboard
2. Click "New Query"
3. Paste the SQL from `supabase/migrations/init.sql`
4. Click "Run"

### Method 2: Using CLI (Recommended for Development)

```bash
# Install Supabase CLI
npm install -g @supabase/supabase-cli

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase migration up

# OR reset database (development only)
supabase db reset
```

## Authentication Setup

### Email/Password Authentication

1. **Enable in Supabase**:
   - Go to Authentication → Providers
   - Ensure "Email" is enabled

2. **Configure Email Templates**:
   - Go to Authentication → Email Templates
   - Customize if needed

3. **SMTP (Optional)**:
   - For production, configure SMTP in Authentication → SMTP Settings

### OAuth Setup

#### Google OAuth

1. **Create Google OAuth Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project
   - Enable "Google+ API"
   - Create OAuth 2.0 credentials (Web application)
   - Authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback?provider=google`

2. **Add to Supabase**:
   - Authentication → Providers → Google
   - Add Client ID and Client Secret
   - Enable

3. **Add to Environment**:
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

#### GitHub OAuth

1. **Create GitHub OAuth App**:
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Click "New OAuth App"
   - Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback?provider=github`

2. **Add to Supabase**:
   - Authentication → Providers → GitHub
   - Add Client ID and Client Secret
   - Enable

3. **Add to Environment**:
   ```env
   NEXT_PUBLIC_GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   ```

## Row Level Security (RLS)

### Enable RLS for Tables

```sql
-- Enable RLS on transactions table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own transactions
CREATE POLICY "Users can view their own transactions"
ON transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
ON transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
ON transactions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
ON transactions FOR DELETE
USING (auth.uid() = user_id);
```

### Enable RLS on Categories

```sql
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own categories"
ON categories FOR SELECT
USING (auth.uid() = user_id);

-- Similar policies for INSERT, UPDATE, DELETE...
```

## Realtime Subscriptions

### Enable Realtime

1. Go to Replication in Supabase Dashboard
2. Select tables you want to enable realtime for:
   - transactions
   - categories
   - user_profiles

### Using Realtime in Application

```typescript
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useTransactions(userId: string) {
  const [transactions, setTransactions] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to changes
    const subscription = supabase
      .channel(`transactions-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setTransactions(prev => {
            // Handle INSERT, UPDATE, DELETE
            switch (payload.eventType) {
              case 'INSERT':
                return [payload.new, ...prev];
              case 'UPDATE':
                return prev.map(t => t.id === payload.new.id ? payload.new : t);
              case 'DELETE':
                return prev.filter(t => t.id !== payload.old.id);
              default:
                return prev;
            }
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, supabase]);

  return transactions;
}
```

## Storage (Optional)

### Setup File Upload

1. Go to Storage in Supabase Dashboard
2. Create bucket: `expense-tracker-assets`
3. Make it public or private based on needs

### Upload File from Application

```typescript
import { createClient } from '@/lib/supabase/client';

async function uploadFile(file: File, userId: string) {
  const supabase = createClient();
  const fileName = `${userId}/${Date.now()}-${file.name}`;

  const { data, error } = await supabase
    .storage
    .from('expense-tracker-assets')
    .upload(fileName, file);

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  return data;
}
```

## Backup & Recovery

### Automated Backups
- Supabase automatically backs up daily (Pro plan)
- Go to Settings → Backups to view and restore

### Manual Backup
```bash
# Export database
supabase db pull

# Create local backup
pg_dump postgresql://user:password@host:port/db > backup.sql
```

### Restore from Backup
```bash
# In Supabase Dashboard: Settings → Backups → Restore
# Or using CLI:
supabase db push
```

## Monitoring & Analytics

### Database Monitoring
- Go to Monitoring in Supabase Dashboard
- View query performance, connections, storage

### Enable Logging
```sql
-- Enable query logs
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();
```

## Troubleshooting

### Common Issues

#### 1. CORS Error
```env
# Add to environment
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

#### 2. Auth Token Invalid
- Clear cookies in browser
- Check JWT expiry time
- Refresh token manually

#### 3. RLS Blocking Queries
- Check RLS policies
- Verify user_id in JWT matches
- Use service role key for admin operations

#### 4. Rate Limiting
- Supabase limits: 1000 requests per minute
- Implement request queuing
- Use caching for frequent queries

## Production Checklist

- [ ] Enable RLS on all user tables
- [ ] Configure SMTP for emails
- [ ] Set up OAuth providers
- [ ] Enable backups
- [ ] Configure monitoring alerts
- [ ] Set up logging
- [ ] Enable Realtime for critical tables
- [ ] Test disaster recovery
- [ ] Document API endpoints
- [ ] Set up error tracking (Sentry)

## Further Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase + Next.js](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
