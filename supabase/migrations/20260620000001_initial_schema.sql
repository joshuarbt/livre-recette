-- Initial schema for app cuisine

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helper: auto-update updated_at
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- recipes
-- ---------------------------------------------------------------------------

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  prep_time integer,
  cook_time integer,
  servings integer,
  image_url text,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index recipes_user_id_idx on public.recipes (user_id);
create index recipes_user_id_category_idx on public.recipes (user_id, category);

create trigger recipes_set_updated_at
before update on public.recipes
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- ingredients (user-scoped)
-- ---------------------------------------------------------------------------

create table public.ingredients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  unit text,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create index ingredients_user_id_idx on public.ingredients (user_id);

-- ---------------------------------------------------------------------------
-- recipe_ingredients
-- ---------------------------------------------------------------------------

create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  ingredient_id uuid not null references public.ingredients (id) on delete restrict,
  quantity numeric not null,
  unique (recipe_id, ingredient_id)
);

create index recipe_ingredients_recipe_id_idx on public.recipe_ingredients (recipe_id);
create index recipe_ingredients_ingredient_id_idx on public.recipe_ingredients (ingredient_id);

-- ---------------------------------------------------------------------------
-- utensils (user-scoped)
-- ---------------------------------------------------------------------------

create table public.utensils (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create index utensils_user_id_idx on public.utensils (user_id);

-- ---------------------------------------------------------------------------
-- recipe_utensils
-- ---------------------------------------------------------------------------

create table public.recipe_utensils (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  utensil_id uuid not null references public.utensils (id) on delete restrict,
  unique (recipe_id, utensil_id)
);

create index recipe_utensils_recipe_id_idx on public.recipe_utensils (recipe_id);
create index recipe_utensils_utensil_id_idx on public.recipe_utensils (utensil_id);

-- ---------------------------------------------------------------------------
-- recipe_steps
-- ---------------------------------------------------------------------------

create table public.recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  step_number integer not null check (step_number > 0),
  instruction text not null,
  unique (recipe_id, step_number)
);

create index recipe_steps_recipe_id_idx on public.recipe_steps (recipe_id);

-- ---------------------------------------------------------------------------
-- meal_plan
-- ---------------------------------------------------------------------------

create table public.meal_plan (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  servings_planned integer not null check (servings_planned > 0),
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner')),
  created_at timestamptz not null default now(),
  unique (user_id, date, meal_type)
);

create index meal_plan_user_id_idx on public.meal_plan (user_id);
create index meal_plan_user_id_date_idx on public.meal_plan (user_id, date);

-- ---------------------------------------------------------------------------
-- shopping_list
-- ---------------------------------------------------------------------------

create table public.shopping_list (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start_date date not null,
  is_checked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start_date)
);

create index shopping_list_user_id_idx on public.shopping_list (user_id);

create trigger shopping_list_set_updated_at
before update on public.shopping_list
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- shopping_list_items
-- ---------------------------------------------------------------------------

create table public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  shopping_list_id uuid not null references public.shopping_list (id) on delete cascade,
  ingredient_id uuid not null references public.ingredients (id) on delete restrict,
  total_quantity numeric not null,
  unit text not null,
  is_checked boolean not null default false,
  unique (shopping_list_id, ingredient_id)
);

create index shopping_list_items_shopping_list_id_idx on public.shopping_list_items (shopping_list_id);
create index shopping_list_items_ingredient_id_idx on public.shopping_list_items (ingredient_id);

-- ---------------------------------------------------------------------------
-- freezer_inventory
-- ---------------------------------------------------------------------------

create table public.freezer_inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  servings_count integer not null check (servings_count > 0),
  frozen_date date not null default current_date,
  expiry_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index freezer_inventory_user_id_idx on public.freezer_inventory (user_id);
create index freezer_inventory_recipe_id_idx on public.freezer_inventory (recipe_id);

create trigger freezer_inventory_set_updated_at
before update on public.freezer_inventory
for each row
execute function public.set_updated_at();
