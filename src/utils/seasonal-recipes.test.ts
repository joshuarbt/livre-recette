import assert from "node:assert/strict";
import test from "node:test";
import { getLegumesDuMois, LEGUMES_PAR_MOIS } from "@/data/legumes-saison";
import {
  computeSeasonalRecipeIds,
  filterSeasonalRecipes,
  recipeHasSeasonalIngredient,
} from "@/utils/seasonal-recipes";

test("getLegumesDuMois(8) retourne les légumes d'août", () => {
  assert.deepEqual(getLegumesDuMois(8), [...LEGUMES_PAR_MOIS[8]]);
});

test("getLegumesDuMois() sans argument utilise le mois courant", () => {
  const currentMonth = new Date().getMonth() + 1;
  assert.deepEqual(getLegumesDuMois(), [...LEGUMES_PAR_MOIS[currentMonth]]);
});

test("getLegumesDuMois() retourne un tableau vide pour un mois invalide", () => {
  assert.deepEqual(getLegumesDuMois(0), []);
  assert.deepEqual(getLegumesDuMois(13), []);
});

test("recipeHasSeasonalIngredient détecte les ingrédients de saison", () => {
  assert.equal(recipeHasSeasonalIngredient(["tomates cerises"], 7), true);
  assert.equal(recipeHasSeasonalIngredient(["poulet"], 7), false);
  assert.equal(recipeHasSeasonalIngredient(["carottes râpées"], 5), true);
  assert.equal(recipeHasSeasonalIngredient(["épinards frais"], 3), true);
});

test("filterSeasonalRecipes retourne les recettes contenant un légume du mois", () => {
  const recipes = [
    { id: "1", ingredientNames: ["tomates", "basilic"] },
    { id: "2", ingredientNames: ["poulet", "thym"] },
    { id: "3", ingredientNames: ["courgettes"] },
  ];

  const seasonal = filterSeasonalRecipes(recipes, 8);

  assert.deepEqual(
    seasonal.map((recipe) => recipe.id),
    ["1", "3"],
  );
});

test("computeSeasonalRecipeIds retourne un Set d'identifiants", () => {
  const recipes = [
    { id: "a", ingredientNames: ["poireaux"] },
    { id: "b", ingredientNames: ["saumon"] },
    { id: "c", ingredientNames: ["endives"] },
  ];

  const ids = computeSeasonalRecipeIds(recipes, 1);

  assert.deepEqual([...ids].sort(), ["a", "c"]);
});

test("exemple d'utilisation : recettes de saison pour le mois actuel", () => {
  const currentMonth = new Date().getMonth() + 1;
  const legumes = getLegumesDuMois();
  const sampleRecipes = [
    { id: "demo-1", title: "Salade estivale", ingredientNames: ["tomates", "basilic"] },
    { id: "demo-2", title: "Poulet rôti", ingredientNames: ["poulet", "thym"] },
    { id: "demo-3", title: "Gratin de courgettes", ingredientNames: ["courgettes", "crème"] },
  ];

  const seasonal = filterSeasonalRecipes(sampleRecipes);

  assert.ok(legumes.length > 0, "La liste du mois courant ne doit pas être vide");
  assert.ok(
    seasonal.every((recipe) => recipeHasSeasonalIngredient(recipe.ingredientNames, currentMonth)),
    "Chaque recette filtrée doit contenir un légume du mois courant",
  );
});
