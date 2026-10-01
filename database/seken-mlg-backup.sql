-- =====================================================
-- BACKUP DATABASE SEKEN.MLG
-- =====================================================


-- =====================================================
-- 1. PRODUCTS
-- =====================================================

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price numeric not null,
  condition text not null,
  description text,
  location text,
  image_url text,
  seller_name text,
  seller_id uuid,
  created_at timestamp with time zone default now()
);


-- =====================================================
-- 2. PROFILES
-- =====================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  location text,
  avatar_url text,
  created_at timestamp with time zone default now()
);


-- =====================================================
-- 3. FOREIGN KEY PRODUCTS
-- =====================================================

alter table products
add constraint products_seller_id_fkey
foreign key (seller_id)
references auth.users(id)
on delete set null;


-- =====================================================
-- 4. RLS PRODUCTS
-- =====================================================

alter table products enable row level security;


-- SELECT PRODUCTS

create policy "Anyone can view products"
on products
for select
using (true);


-- INSERT PRODUCTS

create policy "Users can insert products"
on products
for insert
to authenticated
with check (auth.uid() = seller_id);


-- UPDATE PRODUCTS

create policy "Users can update own products"
on products
for update
to authenticated
using (auth.uid() = seller_id)
with check (auth.uid() = seller_id);


-- DELETE PRODUCTS

create policy "Users can delete own products"
on products
for delete
to authenticated
using (auth.uid() = seller_id);


-- =====================================================
-- 5. RLS PROFILES
-- =====================================================

alter table profiles enable row level security;


-- SELECT PROFILES

create policy "Users can view profiles"
on profiles
for select
using (true);


-- INSERT PROFILE

create policy "Users can insert own profile"
on profiles
for insert
to authenticated
with check (auth.uid() = id);


-- UPDATE PROFILE

create policy "Users can update own profile"
on profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);


-- =====================================================
-- 6. GRANT PRODUCTS
-- =====================================================

GRANT SELECT ON TABLE public.products TO anon;

GRANT SELECT ON TABLE public.products TO authenticated;

GRANT INSERT ON TABLE public.products TO authenticated;


-- =====================================================
-- 7. GRANT PROFILES
-- =====================================================

GRANT SELECT, INSERT, UPDATE
ON TABLE public.profiles
TO authenticated;


-- =====================================================
-- 8. PROFILE POLICY
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own profile"
ON public.profiles;

DROP POLICY IF EXISTS "Users can update own profile"
ON public.profiles;


CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);


CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- =====================================================
-- 9. AUTO CREATE PROFILE
-- =====================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin

  insert into public.profiles
    (id, name, location)

  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'location'
  );

  return new;

end;
$$;


-- =====================================================
-- 10. TRIGGER
-- =====================================================

drop trigger if exists on_auth_user_created
on auth.users;


create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();
