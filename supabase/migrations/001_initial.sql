-- ThrivebooksCR — Initial Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- ============================================================
-- BOOKS TABLE
-- ============================================================
create table if not exists public.books (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  author      text not null,
  description_es text,
  description_en text,
  price_crc   integer not null check (price_crc > 0),
  cover_url   text,
  genre       text not null default 'otro',
  language    text not null default 'espanol',
  condition   text not null default 'nuevo'
                check (condition in ('nuevo', 'usado_buen_estado', 'usado')),
  stock       integer not null default 1 check (stock >= 0),
  featured    boolean not null default false,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Index for catalog queries
create index if not exists books_active_idx on public.books (active, created_at desc);
create index if not exists books_featured_idx on public.books (featured, active);
create index if not exists books_genre_idx on public.books (genre);

-- ============================================================
-- PROFILES TABLE (extends Supabase Auth users)
-- ============================================================
create table if not exists public.profiles (
  id       uuid primary key references auth.users (id) on delete cascade,
  name     text,
  phone    text,
  created_at timestamptz not null default now()
);

-- Trigger: auto-create profile when user registers
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data ->> 'name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- ORDERS TABLE
-- ============================================================
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    text unique not null,
  user_id         uuid references public.profiles (id) on delete set null,
  -- Guest fields (null when user is logged in)
  guest_name      text,
  guest_email     text,
  guest_phone     text,
  -- Shipping
  shipping_method text not null
                    check (shipping_method in ('uber_flash', 'didi', 'correos')),
  shipping_address jsonb not null,
  -- Status
  status          text not null default 'pending_payment'
                    check (status in (
                      'pending_payment',
                      'awaiting_confirmation',
                      'confirmed',
                      'preparing',
                      'shipped',
                      'delivered',
                      'cancelled'
                    )),
  total_crc       integer not null check (total_crc > 0),
  sinpe_confirmed_at timestamptz,
  notes           text,
  created_at      timestamptz not null default now()
);

-- Index for admin order queries
create index if not exists orders_status_idx on public.orders (status, created_at desc);
create index if not exists orders_user_idx on public.orders (user_id, created_at desc);

-- Function to generate order numbers like TB-2025-0001
create or replace function public.generate_order_number()
returns text
language plpgsql
as $$
declare
  year_str text := to_char(now(), 'YYYY');
  seq int;
  order_num text;
begin
  select count(*) + 1 into seq
  from public.orders
  where extract(year from created_at) = extract(year from now());

  order_num := 'TB-' || year_str || '-' || lpad(seq::text, 4, '0');
  return order_num;
end;
$$;

-- ============================================================
-- ORDER ITEMS TABLE
-- ============================================================
create table if not exists public.order_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references public.orders (id) on delete cascade,
  book_id        uuid not null references public.books (id) on delete restrict,
  quantity       integer not null default 1 check (quantity > 0),
  unit_price_crc integer not null check (unit_price_crc > 0)
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Books: anyone can read active books, only admin can write
alter table public.books enable row level security;

create policy "Anyone can view active books"
  on public.books for select
  using (active = true);

create policy "Admin can manage books"
  on public.books for all
  using (auth.jwt() ->> 'role' = 'admin');

-- Profiles: users can read/update their own profile
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Orders: users see their own orders, guests can see by order ID
alter table public.orders enable row level security;

create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Anyone can create orders"
  on public.orders for insert
  with check (true);

create policy "Users can update payment status on own orders"
  on public.orders for update
  using (auth.uid() = user_id or user_id is null);

create policy "Admin can manage all orders"
  on public.orders for all
  using (auth.jwt() ->> 'role' = 'admin');

-- Order items: accessible with the order
alter table public.order_items enable row level security;

create policy "Order items visible with their order"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
      and (o.user_id = auth.uid() or o.user_id is null)
    )
  );

create policy "Anyone can insert order items"
  on public.order_items for insert
  with check (true);

create policy "Admin can manage all order items"
  on public.order_items for all
  using (auth.jwt() ->> 'role' = 'admin');

-- ============================================================
-- SAMPLE DATA (remove before production)
-- ============================================================
insert into public.books (slug, title, author, description_es, description_en, price_crc, genre, language, condition, stock, featured)
values
  (
    'el-principito',
    'El Principito',
    'Antoine de Saint-Exupéry',
    'Un clásico atemporal sobre la amistad, el amor y la vida visto a través de los ojos de un niño.',
    'A timeless classic about friendship, love, and life seen through a child''s eyes.',
    4500,
    'ficcion',
    'espanol',
    'usado_buen_estado',
    1,
    true
  ),
  (
    'atomic-habits',
    'Atomic Habits',
    'James Clear',
    'Un método comprobado para desarrollar buenos hábitos y deshacerse de los malos.',
    'A proven framework for building good habits and breaking bad ones.',
    9800,
    'autoayuda',
    'ingles',
    'nuevo',
    3,
    true
  ),
  (
    'sapiens',
    'Sapiens: De animales a dioses',
    'Yuval Noah Harari',
    'Una historia breve de la humanidad que explora cómo los humanos conquistaron el mundo.',
    'A brief history of humankind exploring how humans came to dominate the world.',
    11500,
    'historia',
    'espanol',
    'usado_buen_estado',
    1,
    true
  ),
  (
    'the-alchemist',
    'The Alchemist',
    'Paulo Coelho',
    'La historia de Santiago, un joven pastor andaluz que emprende un viaje en busca de un tesoro.',
    'The story of Santiago, an Andalusian shepherd boy who journeys in search of a worldly treasure.',
    6000,
    'ficcion',
    'ingles',
    'nuevo',
    2,
    false
  );
