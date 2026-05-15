# Admin Setup Guide for CaseKisses

## How to Enable Admin Access

### 1. Add `role` Column to Your User Profile

The admin authentication system uses the `profiles.role` field to determine admin access.

**Supabase Field:**
- Table: `profiles`
- Column: `role` (VARCHAR, default: 'user')
- Possible values: `'admin'` or `'user'`

### 2. Mark Your User as Admin

Go to Supabase Dashboard → Database → Tables → `profiles`

Find your user row and update the `role` column:
- Change value from `'user'` to `'admin'`

### 3. How Admin Authentication Works

1. When you visit `/admin/orders`:
   - `app/admin/layout.tsx` checks your session server-side
   - No page flashing - auth check happens before rendering
   - If not logged in → redirects to `/auth/login`
   - If logged in but not admin → shows "Unauthorized" page
   - If admin → shows the orders page

2. The layout queries `profiles.role`:
   ```sql
   SELECT role FROM profiles WHERE id = :user_id
   ```

3. Only users with `role = 'admin'` can access `/admin/*` routes

### 4. Testing Admin Access

1. **Create/Login with your account** at the login page
2. **Go to Supabase Dashboard**:
   - Project → Database → Tables → profiles
   - Find your user ID
   - Update the `role` column to `'admin'`
3. **Refresh `/admin/orders`** - you should now see the orders page with no flashing

### 5. Remove Admin Access

Set `role` back to `'user'` in the profiles table, then visit `/admin/orders` → will show "Unauthorized"

## No Flashing Behavior

The admin page is now protected by a server-side layout component that:
- Checks authentication before rendering any UI
- Redirects to login if needed (no page flash)
- Shows "Unauthorized" if not admin (no page flash)
- Renders the orders page only after all checks pass

This prevents the brief flash of the admin page before auth check finishes.
