-- Row Level Security policies for app cuisine

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "profiles_delete_own"
on public.profiles
for delete
to authenticated
using (id = auth.uid());

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- recipes
-- ---------------------------------------------------------------------------

alter table public.recipes enable row level security;

create policy "recipes_select_own"
on public.recipes
for select
to authenticated
using (user_id = auth.uid());

create policy "recipes_insert_own"
on public.recipes
for insert
to authenticated
with check (user_id = auth.uid());

create policy "recipes_update_own"
on public.recipes
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "recipes_delete_own"
on public.recipes
for delete
to authenticated
using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- ingredients
-- ---------------------------------------------------------------------------

alter table public.ingredients enable row level security;

create policy "ingredients_select_own"
on public.ingredients
for select
to authenticated
using (user_id = auth.uid());

create policy "ingredients_insert_own"
on public.ingredients
for insert
to authenticated
with check (user_id = auth.uid());

create policy "ingredients_update_own"
on public.ingredients
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "ingredients_delete_own"
on public.ingredients
for delete
to authenticated
using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- recipe_ingredients
-- ---------------------------------------------------------------------------

alter table public.recipe_ingredients enable row level security;

create policy "recipe_ingredients_select_own"
on public.recipe_ingredients
for select
to authenticated
using (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_ingredients.recipe_id
      and recipes.user_id = auth.uid()
  )
);

create policy "recipe_ingredients_insert_own"
on public.recipe_ingredients
for insert
to authenticated
with check (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_ingredients.recipe_id
      and recipes.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.ingredients
    where ingredients.id = recipe_ingredients.ingredient_id
      and ingredients.user_id = auth.uid()
  )
);

create policy "recipe_ingredients_update_own"
on public.recipe_ingredients
for update
to authenticated
using (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_ingredients.recipe_id
      and recipes.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_ingredients.recipe_id
      and recipes.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.ingredients
    where ingredients.id = recipe_ingredients.ingredient_id
      and ingredients.user_id = auth.uid()
  )
);

create policy "recipe_ingredients_delete_own"
on public.recipe_ingredients
for delete
to authenticated
using (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_ingredients.recipe_id
      and recipes.user_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- utensils
-- ---------------------------------------------------------------------------

alter table public.utensils enable row level security;

create policy "utensils_select_own"
on public.utensils
for select
to authenticated
using (user_id = auth.uid());

create policy "utensils_insert_own"
on public.utensils
for insert
to authenticated
with check (user_id = auth.uid());

create policy "utensils_update_own"
on public.utensils
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "utensils_delete_own"
on public.utensils
for delete
to authenticated
using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- recipe_utensils
-- ---------------------------------------------------------------------------

alter table public.recipe_utensils enable row level security;

create policy "recipe_utensils_select_own"
on public.recipe_utensils
for select
to authenticated
using (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_utensils.recipe_id
      and recipes.user_id = auth.uid()
  )
);

create policy "recipe_utensils_insert_own"
on public.recipe_utensils
for insert
to authenticated
with check (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_utensils.recipe_id
      and recipes.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.utensils
    where utensils.id = recipe_utensils.utensil_id
      and utensils.user_id = auth.uid()
  )
);

create policy "recipe_utensils_update_own"
on public.recipe_utensils
for update
to authenticated
using (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_utensils.recipe_id
      and recipes.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_utensils.recipe_id
      and recipes.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.utensils
    where utensils.id = recipe_utensils.utensil_id
      and utensils.user_id = auth.uid()
  )
);

create policy "recipe_utensils_delete_own"
on public.recipe_utensils
for delete
to authenticated
using (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_utensils.recipe_id
      and recipes.user_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- recipe_steps
-- ---------------------------------------------------------------------------

alter table public.recipe_steps enable row level security;

create policy "recipe_steps_select_own"
on public.recipe_steps
for select
to authenticated
using (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_steps.recipe_id
      and recipes.user_id = auth.uid()
  )
);

create policy "recipe_steps_insert_own"
on public.recipe_steps
for insert
to authenticated
with check (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_steps.recipe_id
      and recipes.user_id = auth.uid()
  )
);

create policy "recipe_steps_update_own"
on public.recipe_steps
for update
to authenticated
using (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_steps.recipe_id
      and recipes.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_steps.recipe_id
      and recipes.user_id = auth.uid()
  )
);

create policy "recipe_steps_delete_own"
on public.recipe_steps
for delete
to authenticated
using (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_steps.recipe_id
      and recipes.user_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- meal_plan
-- ---------------------------------------------------------------------------

alter table public.meal_plan enable row level security;

create policy "meal_plan_select_own"
on public.meal_plan
for select
to authenticated
using (user_id = auth.uid());

create policy "meal_plan_insert_own"
on public.meal_plan
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.recipes
    where recipes.id = meal_plan.recipe_id
      and recipes.user_id = auth.uid()
  )
);

create policy "meal_plan_update_own"
on public.meal_plan
for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.recipes
    where recipes.id = meal_plan.recipe_id
      and recipes.user_id = auth.uid()
  )
);

create policy "meal_plan_delete_own"
on public.meal_plan
for delete
to authenticated
using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- shopping_list
-- ---------------------------------------------------------------------------

alter table public.shopping_list enable row level security;

create policy "shopping_list_select_own"
on public.shopping_list
for select
to authenticated
using (user_id = auth.uid());

create policy "shopping_list_insert_own"
on public.shopping_list
for insert
to authenticated
with check (user_id = auth.uid());

create policy "shopping_list_update_own"
on public.shopping_list
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "shopping_list_delete_own"
on public.shopping_list
for delete
to authenticated
using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- shopping_list_items
-- ---------------------------------------------------------------------------

alter table public.shopping_list_items enable row level security;

create policy "shopping_list_items_select_own"
on public.shopping_list_items
for select
to authenticated
using (
  exists (
    select 1
    from public.shopping_list
    where shopping_list.id = shopping_list_items.shopping_list_id
      and shopping_list.user_id = auth.uid()
  )
);

create policy "shopping_list_items_insert_own"
on public.shopping_list_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.shopping_list
    where shopping_list.id = shopping_list_items.shopping_list_id
      and shopping_list.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.ingredients
    where ingredients.id = shopping_list_items.ingredient_id
      and ingredients.user_id = auth.uid()
  )
);

create policy "shopping_list_items_update_own"
on public.shopping_list_items
for update
to authenticated
using (
  exists (
    select 1
    from public.shopping_list
    where shopping_list.id = shopping_list_items.shopping_list_id
      and shopping_list.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.shopping_list
    where shopping_list.id = shopping_list_items.shopping_list_id
      and shopping_list.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.ingredients
    where ingredients.id = shopping_list_items.ingredient_id
      and ingredients.user_id = auth.uid()
  )
);

create policy "shopping_list_items_delete_own"
on public.shopping_list_items
for delete
to authenticated
using (
  exists (
    select 1
    from public.shopping_list
    where shopping_list.id = shopping_list_items.shopping_list_id
      and shopping_list.user_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- freezer_inventory
-- ---------------------------------------------------------------------------

alter table public.freezer_inventory enable row level security;

create policy "freezer_inventory_select_own"
on public.freezer_inventory
for select
to authenticated
using (user_id = auth.uid());

create policy "freezer_inventory_insert_own"
on public.freezer_inventory
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.recipes
    where recipes.id = freezer_inventory.recipe_id
      and recipes.user_id = auth.uid()
  )
);

create policy "freezer_inventory_update_own"
on public.freezer_inventory
for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.recipes
    where recipes.id = freezer_inventory.recipe_id
      and recipes.user_id = auth.uid()
  )
);

create policy "freezer_inventory_delete_own"
on public.freezer_inventory
for delete
to authenticated
using (user_id = auth.uid());
