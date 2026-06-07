import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Users, ShoppingCart, Minus, Plus, Flame, Leaf } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useAppData } from '@/context/AppDataContext';
import { useRecipes } from '@/context/RecipesContext';
import { scaleIngredients } from '@/lib/recipes';

export function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userId } = useUser();
  const { addIngredientsToShopping } = useAppData();
  const { getRecipeById, loading } = useRecipes();
  const recipe = id ? getRecipeById(id) : undefined;
  const [servings, setServings] = useState(recipe?.servings ?? 2);
  const [added, setAdded] = useState(false);

  if (loading) {
    return <p className="py-20 text-center text-white/40">Rezept wird geladen…</p>;
  }

  if (!recipe) {
    return (
      <div className="py-20 text-center">
        <p className="text-white/40">Rezept nicht gefunden</p>
        <Link to="/essen" className="mt-4 inline-block text-sm accent-text">
          Zurück
        </Link>
      </div>
    );
  }

  const ingredients = scaleIngredients(recipe, servings);
  const scaleFactor = servings / recipe.servings;
  const scaledNutrition = {
    calories: Math.round(recipe.nutrition.calories * scaleFactor),
    protein: Math.round(recipe.nutrition.protein * scaleFactor),
    carbs: Math.round(recipe.nutrition.carbs * scaleFactor),
    fat: Math.round(recipe.nutrition.fat * scaleFactor),
    fiber: Math.round(recipe.nutrition.fiber * scaleFactor),
  };

  const handleAddToShopping = async () => {
    if (!userId) return;
    await addIngredientsToShopping(ingredients, userId);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-5 pb-4">
      <button
        onClick={() => navigate('/essen')}
        className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80"
      >
        <ArrowLeft size={16} /> Zurück
      </button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card border p-5 accent-border"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg px-2 py-0.5 text-[10px] accent-bg-muted accent-text">
            {recipe.mealCategory}
          </span>
          {recipe.isHealthy && (
            <span className="flex items-center gap-1 rounded-lg bg-green-500/15 px-2 py-0.5 text-[10px] text-green-400">
              <Leaf size={10} /> Gesund
            </span>
          )}
        </div>
        <h1 className="mt-2 font-display text-xl font-bold accent-gradient-text">{recipe.name}</h1>
        <p className="mt-2 text-sm text-white/50">{recipe.description}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/40">
          <span className="flex items-center gap-1">
            <Clock size={12} /> {recipe.prepTime + recipe.cookTime} Min.
          </span>
          <span className="flex items-center gap-1">
            <Flame size={12} /> {scaledNutrition.calories} kcal
          </span>
          <span className="capitalize">{recipe.difficulty}</span>
        </div>
      </motion.div>

      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white/60">
            <Users size={14} /> Portionen
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setServings(Math.max(1, servings - 1))}
              className="rounded-lg bg-dark-200 p-1.5"
            >
              <Minus size={14} />
            </button>
            <span className="font-display text-lg font-bold accent-text">{servings}</span>
            <button
              onClick={() => setServings(servings + 1)}
              className="rounded-lg bg-dark-200 p-1.5"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card p-4">
        <h3 className="mb-3 text-sm font-medium text-white/60">Nährwerte (geschätzt)</h3>
        <div className="grid grid-cols-5 gap-2 text-center">
          {[
            { label: 'kcal', value: scaledNutrition.calories },
            { label: 'Protein', value: `${scaledNutrition.protein}g` },
            { label: 'Carbs', value: `${scaledNutrition.carbs}g` },
            { label: 'Fett', value: `${scaledNutrition.fat}g` },
            { label: 'Ballast.', value: `${scaledNutrition.fiber}g` },
          ].map((n) => (
            <div key={n.label} className="rounded-xl bg-dark-200/50 p-2">
              <p className="text-sm font-bold accent-text">{n.value}</p>
              <p className="text-[10px] text-white/30">{n.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-white/60">Zutaten</h3>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToShopping}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs ${
              added ? 'bg-green-500/20 text-green-400' : 'accent-bg-muted accent-text'
            }`}
          >
            <ShoppingCart size={12} />
            {added ? 'Hinzugefügt!' : 'Auf Einkaufsliste'}
          </motion.button>
        </div>
        <ul className="space-y-2">
          {ingredients.map((ing, i) => (
            <li key={i} className="flex justify-between text-sm">
              <span className="text-white/80">{ing.name}</span>
              <span className="text-white/40">
                {ing.amount} {ing.unit}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="glass-card p-4">
        <h3 className="mb-3 text-sm font-medium text-white/60">Zubereitung</h3>
        {recipe.steps.length === 0 ? (
          <p className="text-sm text-white/35">Keine Schritte hinterlegt.</p>
        ) : (
          <ol className="space-y-4">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold accent-bg-muted accent-text">
                  {i + 1}
                </span>
                <span className="pt-1 leading-relaxed text-white/75">{step}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
