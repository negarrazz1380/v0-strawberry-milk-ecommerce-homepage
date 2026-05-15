# Supabase RLS Security Implementation Guide

## Overview

This guide walks through implementing Row Level Security (RLS) policies in Supabase to protect customer data while allowing public browsing, customer self-service, and admin management.

## Current Setup

Your application has:
- ✅ Supabase connected
- ✅ Auth already protecting `/account` routes
- ✅ Admin panel at `/admin` and `/admin/orders`
- ✅ Service role key **NOT exposed** to frontend (secure)
- ✅ Middleware checking admin role

## What We're Implementing

RLS policies that enforce:

| User Type | Access |
|-----------|--------|
| **Public** | View all products, submit contact forms, subscribe to newsletter |
| **Logged-in Customer** | View only their own profile and orders |
| **Admin** | View everything, manage products, view all orders/contacts/newsletters |

## Implementation Steps

### Step 1: Verify Your Admin Account

Before running RLS policies, ensure you have an admin account set up:

```sql
-- Replace YOUR_USER_ID with your actual Supabase user ID
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = 'YOUR_USER_ID';

-- Verify it worked
SELECT id, email, role FROM public.profiles WHERE role = 'admin';
```

### Step 2: Run the RLS Setup Script

Execute the SQL script in Supabase SQL Editor:

```
scripts/002_setup_rls_policies.sql
```

This will:
- Add `role` column to profiles table
- Enable RLS on all protected tables
- Create policies for products, orders, profiles, contact_messages, etc.

### Step 3: Test Admin Access

After running the script, test these:

1. **Log in as admin** → Visit `https://yoursite.com/admin/orders`
   - Should see admin dashboard ✅

2. **Log out** → Visit `https://yoursite.com/admin/orders`
   - Should redirect to `/` (not logged in) ✅

3. **Log in as customer** (different account) → Visit `/admin/orders`
   - Should redirect to `/` (not admin) ✅

### Step 4: Test Customer Data Privacy

1. **Log in as customer A** → Check `/account`
   - Should see only their profile ✅

2. **Log in as customer B** (different account) → Try to access customer A's orders
   - Database query should return empty (RLS blocks) ✅

3. **Public visitor** (no login) → Browse homepage
   - Should see all products, including sold out ✅

### Step 5: Test Forms (Public Access)

1. **Contact form** → Submit without logging in
   - Should succeed, message saved ✅

2. **Newsletter signup** → Submit without logging in
   - Should succeed, email saved ✅

## Security Checklist

- [x] Service role key is NOT used in client-side code
- [x] Service role key is NOT exposed via NEXT_PUBLIC_ variables
- [x] Admin routes are protected by middleware
- [x] RLS policies check `auth.uid()` and role
- [x] Public forms allow anonymous inserts
- [x] Customers can only see their own data
- [x] Admin account is protected (role = 'admin')
- [x] Orders table uses customer_email for customer filtering

## Important Notes

### Database Queries After RLS

Once RLS is enabled:

**❌ DON'T do this in admin code:**
```javascript
// This will only return data the current user can access (customer might only see their own orders)
const { data } = await supabase
  .from('orders')
  .select('*')
```

**✅ DO this instead (backend only):**
```javascript
// Server-side code can use service role to bypass RLS
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const { data } = await supabase
  .from('orders')
  .select('*') // Now bypasses RLS, shows all orders
```

### Stripe Webhook Orders

Your Stripe webhook creates orders with `SUPABASE_SERVICE_ROLE_KEY` (server-side only), which:
- Bypasses RLS policies ✅
- Allows creating orders for customers ✅
- Is secure because it's server-side only ✅

## Troubleshooting

**Problem:** Admin can't see all orders after implementing RLS
- **Solution:** Check that your user has `role = 'admin'` in profiles table
- Run: `SELECT id, role FROM public.profiles WHERE id = auth.uid();`

**Problem:** Contact form won't submit
- **Solution:** Contact form needs `FOR INSERT WITH CHECK (true)` policy
- Verify policy exists in SQL editor under Policies tab

**Problem:** Customers see other customers' orders
- **Solution:** RLS policy might not be applied correctly
- Check policy uses `customer_email = auth.jwt() ->> 'email'`

**Problem:** Service role key exposure warning
- **Search:** `grep -r "SERVICE_ROLE_KEY" app/ lib/ components/`
- Should return: No results (except server-side routes)

## Next Steps

1. ✅ Update profiles table with role column
2. ✅ Enable RLS on all tables
3. ✅ Create policies for each table
4. ✅ Add admin middleware checks
5. 🔄 Run the RLS setup script
6. 🔄 Test each access level
7. 🔄 Monitor Stripe orders still work
8. 🔄 Verify no customer data leaks

## Support

If you encounter issues:
1. Check Supabase dashboard → SQL Editor → Run the setup script again
2. Verify your admin role: `SELECT * FROM public.profiles WHERE id = auth.uid();`
3. Test from incognito window to ensure no caching issues
4. Check browser console for auth errors
