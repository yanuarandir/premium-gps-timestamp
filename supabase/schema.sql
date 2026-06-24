-- Schema for GPS Timestamp Photo Web App

-- Create profiles table extending auth.users
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  saldo integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create topup_pending table to store pending Mayar invoices
create table topup_pending (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  mayar_invoice_id text not null,
  amount integer not null,
  status text default 'pending' check (status in ('pending', 'completed', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create transactions table for credit history
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  type text check (type in ('topup', 'download')) not null,
  amount integer not null, -- positive for topup, negative for download
  saldo_after integer not null,
  description text,
  mayar_invoice_id text, -- nullable, only for topups
  status text default 'completed' check (status in ('pending', 'completed', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table topup_pending enable row level security;
alter table transactions enable row level security;

-- RLS Policies for profiles
create policy "Users can view own profile"
  on profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- RLS Policies for transactions
create policy "Users can view own transactions"
  on transactions for select
  using ( auth.uid() = user_id );

-- RLS Policies for topup_pending
create policy "Users can view own pending topups"
  on topup_pending for select
  using ( auth.uid() = user_id );

-- Trigger to create a profile automatically when a user signs up
create or function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, saldo)
  values (new.id, new.email, 0);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
