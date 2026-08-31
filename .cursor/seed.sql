-- Demo seed data for the local dev environment.
-- __DEMO_UID__ is replaced with the demo user's UUID by .cursor/start.sh.
do $$
declare
  uid uuid := '__DEMO_UID__';
  r_curry uuid;
  r_salad uuid;
  r_cake uuid;
  ing_id uuid;
begin
  insert into public.recipes (user_id, title, description, prep_time, cook_time, servings, category)
    values (uid, 'Curry de légumes', 'Un curry doux et parfumé aux légumes de saison.', 20, 30, 4, 'plat')
    returning id into r_curry;

  insert into public.recipes (user_id, title, description, prep_time, cook_time, servings, category)
    values (uid, 'Salade de tomates', 'Salade fraîche de tomates et basilic.', 10, 0, 2, 'entree')
    returning id into r_salad;

  insert into public.recipes (user_id, title, description, prep_time, cook_time, servings, category)
    values (uid, 'Gâteau au chocolat', 'Gâteau fondant au chocolat noir.', 15, 35, 8, 'dessert')
    returning id into r_cake;

  insert into public.ingredients (user_id, name, unit) values
    (uid, 'Courgette', 'g'),
    (uid, 'Lait de coco', 'ml'),
    (uid, 'Tomate', 'piece'),
    (uid, 'Basilic', 'g'),
    (uid, 'Chocolat noir', 'g'),
    (uid, 'Farine', 'g'),
    (uid, 'Oeuf', 'piece')
  on conflict (user_id, name) do nothing;

  select id into ing_id from public.ingredients where user_id = uid and name = 'Courgette';
  insert into public.recipe_ingredients (recipe_id, ingredient_id, quantity) values (r_curry, ing_id, 400);
  select id into ing_id from public.ingredients where user_id = uid and name = 'Lait de coco';
  insert into public.recipe_ingredients (recipe_id, ingredient_id, quantity) values (r_curry, ing_id, 200);
  insert into public.recipe_steps (recipe_id, step_number, instruction) values
    (r_curry, 1, 'Couper les courgettes en dés.'),
    (r_curry, 2, 'Faire revenir puis ajouter le lait de coco.'),
    (r_curry, 3, 'Laisser mijoter 20 minutes.');

  select id into ing_id from public.ingredients where user_id = uid and name = 'Tomate';
  insert into public.recipe_ingredients (recipe_id, ingredient_id, quantity) values (r_salad, ing_id, 3);
  select id into ing_id from public.ingredients where user_id = uid and name = 'Basilic';
  insert into public.recipe_ingredients (recipe_id, ingredient_id, quantity) values (r_salad, ing_id, 10);
  insert into public.recipe_steps (recipe_id, step_number, instruction) values
    (r_salad, 1, 'Trancher les tomates.'),
    (r_salad, 2, 'Ajouter le basilic et assaisonner.');

  select id into ing_id from public.ingredients where user_id = uid and name = 'Chocolat noir';
  insert into public.recipe_ingredients (recipe_id, ingredient_id, quantity) values (r_cake, ing_id, 200);
  select id into ing_id from public.ingredients where user_id = uid and name = 'Farine';
  insert into public.recipe_ingredients (recipe_id, ingredient_id, quantity) values (r_cake, ing_id, 150);
  select id into ing_id from public.ingredients where user_id = uid and name = 'Oeuf';
  insert into public.recipe_ingredients (recipe_id, ingredient_id, quantity) values (r_cake, ing_id, 4);
  insert into public.recipe_steps (recipe_id, step_number, instruction) values
    (r_cake, 1, 'Faire fondre le chocolat.'),
    (r_cake, 2, 'Mélanger avec la farine et les oeufs.'),
    (r_cake, 3, 'Cuire au four 35 minutes.');
end $$;
