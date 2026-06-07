/**
 * Erzeugt supabase/recipes.csv aus src/data/recipes.json
 * Import: Supabase → Table Editor → recipes → Insert → Import from CSV
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const jsonPath = join(__dirname, '..', 'src', 'data', 'recipes.json');
const outPath = join(__dirname, '..', 'supabase', 'recipes.csv');

const { recipes } = JSON.parse(readFileSync(jsonPath, 'utf8'));

const HEADERS = [
  'id',
  'household_id',
  'name',
  'category',
  'is_healthy',
  'description',
  'prep_time',
  'cook_time',
  'servings',
  'difficulty',
  'meat_type',
  'cuisine_category',
  'ingredients',
  'instructions',
  'nutrition',
  'tags',
];

function csvCell(value) {
  const s = value === null || value === undefined ? '' : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

function toMealCategory(cuisineCategory) {
  return cuisineCategory === 'fruehstueck' ? 'Frühstück' : 'Abendessen';
}

function isHealthy(recipe) {
  if (recipe.tags?.includes('gesund')) return true;
  return (recipe.nutrition?.calories ?? 999) < 450;
}

const rows = recipes.map((r) => [
  r.id,
  'clara-pascal',
  r.name,
  toMealCategory(r.category),
  isHealthy(r) ? 'true' : 'false',
  r.description ?? '',
  r.prepTime ?? 0,
  r.cookTime ?? 0,
  r.servings ?? 2,
  r.difficulty ?? 'einfach',
  r.meatType ?? 'keins',
  r.category,
  JSON.stringify(r.ingredients ?? []),
  JSON.stringify(r.steps ?? []),
  JSON.stringify(r.nutrition ?? {}),
  JSON.stringify(r.tags ?? []),
]);

const csv = [
  HEADERS.join(','),
  ...rows.map((row) => row.map(csvCell).join(',')),
].join('\n');

writeFileSync(outPath, `\uFEFF${csv}`, 'utf8');
console.log(`✓ ${recipes.length} Rezepte → ${outPath}`);
