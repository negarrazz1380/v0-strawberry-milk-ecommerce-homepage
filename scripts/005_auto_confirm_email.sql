-- Auto-confirm email on user signup
-- This trigger automatically sets email_confirmed_at when a user is created
-- allowing them to log in immediately without confirming their email

create or replace function public.confirm_user_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update auth.users
  set email_confirmed_at = now()
  where id = new.id;

  return new;
end;
$$;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created_confirm_email on auth.users;

-- Create trigger to auto-confirm email when user signs up
create trigger on_auth_user_created_confirm_email
  after insert on auth.users
  for each row
  execute function public.confirm_user_email();
