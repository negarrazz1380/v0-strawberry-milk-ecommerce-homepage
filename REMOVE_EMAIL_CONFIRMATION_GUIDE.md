# Remove Email Confirmation - Supabase Configuration

## Code Changes Made

✅ **1. Signup Page Updated** (`app/auth/sign-up/page.tsx`)
- Removed `emailRedirectTo` option from `auth.signUp()` call
- Removed `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` reference
- Changed redirect from `/auth/sign-up-success` to `/account`
- Users now sign up and immediately access their account

✅ **2. Profile Trigger Updated** (`scripts/002_profile_trigger.sql`)
- Updated trigger to set `role = 'user'` when profile is created
- Profile is auto-created immediately when user signs up (before any email confirmation)
- First name, last name, and email are captured from signup form data

✅ **3. Callback Route Simplified** (`app/auth/callback/route.ts`)
- Removed email confirmation profile creation logic
- Callback now only handles password reset flows
- Still exchanges code for session for password recovery links
- Returns 400 error or redirects to `/auth/reset-password` for password recovery errors

---

## Required Supabase Dashboard Changes

### Step 1: Turn Off Email Confirmation Requirement

1. Go to **Authentication → Providers → Email**
2. Find the setting: **"Require email confirmation"** or **"Confirm email"**
3. **Toggle OFF** (disable email confirmation)
4. Save changes

This allows users to sign in immediately after signing up without confirming their email first.

### Step 2: Verify User Auto-Confirm (Optional but Recommended)

1. In the same **Authentication → Providers → Email** section
2. Look for **"Auto confirm users"** option
3. Set to **ON** if available (this auto-confirms users immediately)

This ensures the user's `email_confirmed_at` is set immediately, allowing full access.

---

## Migration to Run in Supabase

Run this SQL migration to update the profile trigger:

```sql
-- Auto-create profile on user signup with role = 'user'
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', null),
    coalesce(new.raw_user_meta_data ->> 'last_name', null),
    new.email,
    'user'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Recreate trigger
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
```

**To run:**
1. Go to **SQL Editor** in Supabase dashboard
2. Click **New Query**
3. Paste the SQL above
4. Click **Run**

---

## What Happens Now

### Sign-Up Flow:
1. User fills in: First name, Last name, Email, Password ✓
2. Clicks "Create account" ✓
3. Supabase creates auth user ✓
4. Trigger auto-creates profile with `role = 'user'` ✓
5. User redirected to `/account` immediately ✓
6. NO email confirmation required ✓

### Password Reset Flow (Unchanged):
1. User goes to `/auth/forgot-password` ✓
2. Enters email, receives reset link ✓
3. Link redirects to `/auth/callback` with `code` parameter ✓
4. Callback exchanges code for recovery session ✓
5. User redirected to `/auth/reset-password` ✓
6. User enters new password ✓
7. Redirected to `/auth/login` ✓

### Security Maintained:
- ✅ Profiles can read their own data (RLS policy: `auth.uid() = id`)
- ✅ Users can read their own orders (RLS policy: email match)
- ✅ Admins only for users with `role = 'admin'`
- ✅ Service role key NOT exposed in frontend
- ✅ Contact messages, newsletters, order data all protected

---

## Files Modified

1. `/app/auth/sign-up/page.tsx` - Removed email redirect, changed route to /account
2. `/scripts/002_profile_trigger.sql` - Added role = 'user' to trigger
3. `/app/auth/callback/route.ts` - Simplified for password reset only

## Files NOT Changed

- ✅ Login flow - unchanged
- ✅ RLS policies - unchanged
- ✅ Forgot password - unchanged (still works)
- ✅ Reset password - unchanged (still works)
- ✅ Stripe/webhook - unchanged
- ✅ Admin pages - unchanged
- ✅ Account page - unchanged
