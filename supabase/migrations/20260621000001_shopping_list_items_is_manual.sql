alter table public.shopping_list_items
  add column is_manual boolean not null default false;
