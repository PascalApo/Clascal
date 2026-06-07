import { useState, useMemo, useRef, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import {

  Plus,

  Trash2,

  Check,

  Wifi,

  WifiOff,

  Search,

  X,

  Bell,

  Loader2,

} from 'lucide-react';

import { PageHeader } from '@/components/ui/PageHeader';

import { QuantitySelect } from '@/components/einkauf/QuantitySelect';

import { QuantityBadge } from '@/components/einkauf/QuantityBadge';
import { MealPlanShoppingChecklist } from '@/components/einkauf/MealPlanShoppingChecklist';

import { useAppData } from '@/context/AppDataContext';

import { useRecipes } from '@/context/RecipesContext';

import { useUser } from '@/context/UserContext';

import { collectMealPlanIngredients } from '@/lib/meal-plan-ingredients';

import { notifyPartnerShoppingUpdate } from '@/lib/push/partner-notify';


import {

  SHOPPING_CATEGORIES,

  searchCatalog,

  findCatalogProduct,

  type ShoppingCategory,

} from '@/lib/shopping-categories';

import { buildFavoriteProducts } from '@/lib/shopping-favorites';

import type { CatalogProduct } from '@/lib/shopping-catalog';

import type { ShoppingListItem } from '@/lib/sync/types';



export function Einkauf() {

  const { userId, user, getOtherMemberNames } = useUser();

  const { getRecipeById } = useRecipes();

  const {

    isLiveSync,

    syncStatus,

    isShoppingBusy,

    shoppingItems,

    shoppingUsage,

    mealPlan,

    addShoppingItem,

    toggleShoppingItem,

    updateShoppingItem,

    removeShoppingItem,

    clearCheckedShopping,

  } = useAppData();



  const [activeCategory, setActiveCategory] = useState<ShoppingCategory | 'all'>('all');

  const [searchQuery, setSearchQuery] = useState('');

  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);

  const [newQuantity, setNewQuantity] = useState('');

  const [newCategory, setNewCategory] = useState<ShoppingCategory>('gemuese');

  const [editingQtyId, setEditingQtyId] = useState<string | null>(null);

  const [notifyState, setNotifyState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const [notifyError, setNotifyError] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  const partnerLabel = getOtherMemberNames();



  const searchResults = useMemo(

    () => searchCatalog(searchQuery, activeCategory, 10),

    [searchQuery, activeCategory],

  );



  const favoriteProducts = useMemo(

    () => buildFavoriteProducts(shoppingUsage, activeCategory, 20),

    [shoppingUsage, activeCategory],

  );



  const mealPlanIngredientKeys = useMemo(() => {

    const lines = collectMealPlanIngredients(mealPlan, getRecipeById);

    return new Set(lines.map((l) => l.key));

  }, [mealPlan, getRecipeById]);



  const manualShoppingItems = useMemo(

    () =>

      shoppingItems.filter(

        (i) => !mealPlanIngredientKeys.has(i.name.toLowerCase().trim()),

      ),

    [shoppingItems, mealPlanIngredientKeys],

  );



  const filtered =

    activeCategory === 'all'

      ? manualShoppingItems

      : manualShoppingItems.filter((i) => i.category === activeCategory);



  const unchecked = filtered.filter((i) => !i.checked);

  const checked = filtered.filter((i) => i.checked);

  const syncOnline = isLiveSync;



  const handleNotifyPartner = async () => {

    if (!userId || notifyState === 'sending') return;

    setNotifyState('sending');

    setNotifyError(null);

    const result = await notifyPartnerShoppingUpdate(userId, user?.name ?? 'Jemand');

    if (result.ok) {

      setNotifyState('sent');

      setTimeout(() => setNotifyState('idle'), 3000);

    } else {

      setNotifyState('error');

      setNotifyError(result.error ?? 'Benachrichtigung fehlgeschlagen');

      setTimeout(() => setNotifyState('idle'), 5000);

    }

  };



  const groupedUnchecked = useMemo(() => {

    const categories =

      activeCategory === 'all'

        ? SHOPPING_CATEGORIES

        : SHOPPING_CATEGORIES.filter((c) => c.id === activeCategory);



    return categories

      .map((cat) => ({

        category: cat,

        items: unchecked.filter((i) => i.category === cat.id),

      }))

      .filter((g) => g.items.length > 0);

  }, [unchecked, activeCategory]);



  const activeCategoryMeta =

    activeCategory === 'all' ? null : SHOPPING_CATEGORIES.find((c) => c.id === activeCategory);



  const displayName = selectedProduct?.name ?? searchQuery.trim();



  useEffect(() => {

    if (!searchQuery.trim()) setSelectedProduct(null);

  }, [searchQuery]);



  const handleCategorySelect = (cat: ShoppingCategory | 'all') => {

    setActiveCategory(cat);

    if (cat !== 'all') setNewCategory(cat);

    setSelectedProduct(null);

  };



  const selectProduct = (product: CatalogProduct) => {

    setSelectedProduct(product);

    setSearchQuery(product.name);

    setNewCategory(product.category);

    setNewQuantity(product.defaultQuantity);

    searchRef.current?.blur();

  };



  const clearSearch = () => {

    setSearchQuery('');

    setSelectedProduct(null);

    setNewQuantity('');

  };



  const submitShoppingItem = async (

    name: string,

    category: ShoppingCategory,

    quantity?: string,

  ) => {

    if (!userId || isShoppingBusy) return false;

    await addShoppingItem(name, category, quantity, userId);

    return true;

  };



  const handleAdd = async (e?: React.FormEvent) => {

    e?.preventDefault();

    const name = displayName;

    if (!name) return;

    const added = await submitShoppingItem(

      name,

      selectedProduct?.category ?? newCategory,

      newQuantity || undefined,

    );

    if (added) clearSearch();

  };



  const handleQuickAdd = async (product: CatalogProduct) => {

    const qty =

      selectedProduct?.name === product.name && newQuantity

        ? newQuantity

        : product.defaultQuantity;

    const added = await submitShoppingItem(product.name, product.category, qty);

    if (added && selectedProduct?.name === product.name) clearSearch();

  };



  const saveEditQuantity = (id: string, quantity: string) => {

    updateShoppingItem(id, { quantity });

    setEditingQtyId(null);

  };



  const renderShoppingRow = (item: ShoppingListItem) => {

    const cat = SHOPPING_CATEGORIES.find((c) => c.id === item.category);

    const CatIcon = cat?.icon;

    const catalog = findCatalogProduct(item.name);

    const isEditing = editingQtyId === item.id;



    return (

      <motion.div

        key={item.id}

        layout

        initial={{ opacity: 0, x: -10 }}

        animate={{ opacity: 1, x: 0 }}

        exit={{ opacity: 0, x: 10 }}

        className="glass-card flex items-center gap-3 p-3"

      >

        <button

          onClick={() => toggleShoppingItem(item.id)}

          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/20"

        />

        <span className="shrink-0 text-xl">{catalog?.emoji ?? '📦'}</span>

        {CatIcon && activeCategory === 'all' && (

          <CatIcon size={14} style={{ color: cat?.color }} className="shrink-0 opacity-60" />

        )}

        <div className="min-w-0 flex-1">

          <p className="text-sm font-medium">{item.name}</p>

          {isEditing ? (

            <div className="mt-1.5 flex gap-2">

              <QuantitySelect

                value={item.quantity ?? ''}

                onChange={(q) => saveEditQuantity(item.id, q)}

                unitType={catalog?.unitType}

                compact

                className="flex-1"

              />

              <button

                type="button"

                onClick={() => setEditingQtyId(null)}

                className="text-xs text-white/65"

              >

                Fertig

              </button>

            </div>

          ) : (

            <div className="mt-1">

              <QuantityBadge

                quantity={item.quantity}

                categoryColor={cat?.color}

                onClick={() => setEditingQtyId(item.id)}

              />

            </div>

          )}

        </div>

        <button

          onClick={() => removeShoppingItem(item.id)}

          className="shrink-0 text-white/50 hover:text-red-400"

        >

          <Trash2 size={14} />

        </button>

      </motion.div>

    );

  };



  return (

    <div className="space-y-5 pb-4">

      <div className="flex items-start justify-between gap-3">

        <PageHeader

          title="Einkaufsliste"

          subtitle={

            activeCategoryMeta

              ? `Filter: ${activeCategoryMeta.label}`

              : `${manualShoppingItems.filter((i) => !i.checked).length} offen`

          }

        />

        <div

          className={`flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[10px] ${

            syncOnline ? 'text-green-400' : 'text-white/55'

          }`}

        >

          {syncOnline ? <Wifi size={12} /> : <WifiOff size={12} />}

          {syncOnline ? 'Live' : syncStatus === 'connecting' ? '…' : 'Lokal'}

        </div>

      </div>

      <MealPlanShoppingChecklist />

      <motion.button
        whileTap={{ scale: notifyState === 'sending' ? 1 : 0.98 }}
        type="button"
        onClick={() => void handleNotifyPartner()}
        disabled={!userId || !syncOnline || notifyState === 'sending'}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors disabled:opacity-40 ${
          notifyState === 'sent'
            ? 'border-green-500/30 bg-green-500/10 text-green-400'
            : notifyState === 'error'
              ? 'border-red-500/30 bg-red-500/10 text-red-300'
              : 'border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]'
        }`}
      >
        {notifyState === 'sending' ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Bell size={16} />
        )}
        {notifyState === 'sent'
          ? `${partnerLabel} informiert`
          : notifyState === 'error'
            ? notifyError ?? 'Fehler'
            : `${partnerLabel} informieren`}
      </motion.button>

      {notifyState === 'error' && notifyError && (
        <p className="text-center text-[10px] text-white/55">
          Partner muss unter Einstellungen Push aktivieren (iPhone: App zum Home-Bildschirm).
        </p>
      )}

      <div className="glass-card space-y-3 p-4">

        <div className="relative">

          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/55" />

          <input

            ref={searchRef}

            type="text"

            placeholder="Artikel suchen (z.B. Sahne, Nudeln, Eier…)"

            value={searchQuery}

            onChange={(e) => {

              setSearchQuery(e.target.value);

              setSelectedProduct(null);

            }}

            className="w-full rounded-xl bg-dark-200 py-2.5 pl-9 pr-9 text-sm outline-none focus:ring-1 focus:ring-cyan-accent/30"

          />

          {searchQuery && (

            <button

              type="button"

              onClick={clearSearch}

              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/55 hover:text-white/60"

            >

              <X size={16} />

            </button>

          )}

        </div>



        <AnimatePresence>

          {searchQuery.trim() && searchResults.length > 0 && (

            <motion.div

              initial={{ opacity: 0, height: 0 }}

              animate={{ opacity: 1, height: 'auto' }}

              exit={{ opacity: 0, height: 0 }}

              className="overflow-hidden"

            >

              <p className="mb-2 text-[10px] uppercase tracking-wide text-white/60">Treffer</p>

              <div className="flex flex-wrap gap-2">

                {searchResults.map((product) => {

                  const cat = SHOPPING_CATEGORIES.find((c) => c.id === product.category);

                  const CatIcon = cat?.icon;

                  const isSelected = selectedProduct?.name === product.name;

                  return (

                    <motion.button

                      key={product.name}

                      type="button"

                      whileTap={{ scale: 0.95 }}

                      onClick={() => selectProduct(product)}

                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all ${

                        isSelected ? 'ring-1' : 'hover:bg-white/5'

                      }`}

                      style={

                        isSelected

                          ? {

                              backgroundColor: `${cat?.color}18`,

                              borderColor: `${cat?.color}55`,

                              boxShadow: `0 0 10px ${cat?.color}22`,

                            }

                          : { borderColor: 'rgba(255,255,255,0.08)' }

                      }

                    >

                      <span className="text-xl">{product.emoji}</span>

                      <div>

                        <p className="text-sm font-medium leading-tight">{product.name}</p>

                        <p className="text-[10px] text-white/60">

                          {cat?.label} · {product.defaultQuantity}

                        </p>

                      </div>

                      {CatIcon && (

                        <CatIcon size={14} className="ml-1 opacity-50" style={{ color: cat?.color }} />

                      )}

                    </motion.button>

                  );

                })}

              </div>

            </motion.div>

          )}

        </AnimatePresence>



        {searchQuery.trim() && searchResults.length === 0 && (

          <p className="text-xs text-white/60">

            Kein Treffer – du kannst „{searchQuery}" trotzdem manuell hinzufügen.

          </p>

        )}



        {(displayName || selectedProduct) && (

          <motion.div

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}

            className="flex items-center gap-3 rounded-xl accent-bg-muted p-3"

          >

            {selectedProduct ? (

              <span className="text-2xl">{selectedProduct.emoji}</span>

            ) : (

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-dark-200 text-lg">📦</span>

            )}

            <div className="min-w-0 flex-1">

              <p className="truncate text-sm font-medium">{displayName}</p>

              <p className="text-[10px] text-white/65">

                {SHOPPING_CATEGORIES.find((c) => c.id === (selectedProduct?.category ?? newCategory))?.label}

                {selectedProduct && (

                  <span className="ml-1 opacity-70">

                    · Standard: {selectedProduct.defaultQuantity}

                  </span>

                )}

              </p>

            </div>

          </motion.div>

        )}



        <div className="flex flex-wrap gap-2">

          <QuantitySelect

            value={newQuantity}

            onChange={setNewQuantity}

            unitType={selectedProduct?.unitType}

            className="min-w-[140px] flex-1"

          />

          {!selectedProduct && (

            <select

              value={newCategory}

              onChange={(e) => setNewCategory(e.target.value as ShoppingCategory)}

              className="rounded-xl bg-dark-200 px-2 py-2.5 text-xs outline-none"

            >

              {SHOPPING_CATEGORIES.map((c) => (

                <option key={c.id} value={c.id}>

                  {c.label}

                </option>

              ))}

            </select>

          )}

          <motion.button

            whileTap={{ scale: isShoppingBusy ? 1 : 0.95 }}

            type="button"

            onClick={() => void handleAdd()}

            disabled={!displayName || isShoppingBusy}

            className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm accent-bg-muted accent-text disabled:opacity-30"

          >

            <Plus size={16} />

            {isShoppingBusy ? 'Wird hinzugefügt…' : 'Hinzufügen'}

          </motion.button>

        </div>

      </div>



      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">

        <button

          onClick={() => handleCategorySelect('all')}

          className={`shrink-0 rounded-full px-3 py-1.5 text-xs transition-colors ${

            activeCategory === 'all' ? 'accent-bg-muted accent-text' : 'text-white/65 hover:text-white/60'

          }`}

        >

          Alle

          <span className="ml-1 opacity-60">({manualShoppingItems.filter((i) => !i.checked).length})</span>

        </button>

        {SHOPPING_CATEGORIES.map((cat) => {

          const Icon = cat.icon;

          const count = manualShoppingItems.filter((i) => i.category === cat.id && !i.checked).length;

          const isActive = activeCategory === cat.id;

          return (

            <button

              key={cat.id}

              onClick={() => handleCategorySelect(cat.id)}

              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors ${

                isActive ? 'ring-1' : 'text-white/65 hover:text-white/60'

              }`}

              style={

                isActive

                  ? {

                      backgroundColor: `${cat.color}22`,

                      color: cat.color,

                      boxShadow: `0 0 12px ${cat.color}33`,

                      borderColor: `${cat.color}66`,

                    }

                  : undefined

              }

            >

              <Icon size={12} style={isActive ? { color: cat.color } : undefined} />

              {cat.label}

              {count > 0 && (

                <span

                  className="rounded-full px-1.5 text-[10px]"

                  style={

                    isActive

                      ? { backgroundColor: `${cat.color}33` }

                      : { backgroundColor: 'rgba(255,255,255,0.1)' }

                  }

                >

                  {count}

                </span>

              )}

            </button>

          );

        })}

      </div>



      {!searchQuery.trim() && (

        <div>

          <h3 className="mb-2 text-xs text-white/65">

            Beliebte Artikel

            {activeCategoryMeta ? ` · ${activeCategoryMeta.label}` : ''}

          </h3>

          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">

            {favoriteProducts.map((product) => (

              <motion.button

                key={product.name}

                whileTap={{ scale: isShoppingBusy ? 1 : 0.92 }}

                onClick={() => void handleQuickAdd(product)}

                disabled={isShoppingBusy}

                className="glass-card relative flex flex-col items-center gap-1 p-2.5 transition-colors hover:bg-white/5 disabled:opacity-40"

              >

                {product.usageCount > 0 && (

                  <span className="absolute right-1 top-1 rounded-full bg-white/10 px-1 text-[8px] text-white/50">

                    {product.usageCount}×

                  </span>

                )}

                <span className="text-xl">{product.emoji}</span>

                <span className="text-[10px] leading-tight text-center text-white/50">{product.name}</span>

              </motion.button>

            ))}

          </div>

        </div>

      )}



      <div className="space-y-4">

        {groupedUnchecked.map(({ category, items }) => {

          const Icon = category.icon;

          return (

            <section key={category.id}>

              <div

                className="mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-xs"

                style={{ backgroundColor: `${category.color}15`, color: category.color }}

              >

                <Icon size={14} />

                <span className="font-medium">{category.label}</span>

                <span className="text-white/65">({items.length})</span>

              </div>

              <div className="space-y-2">

                <AnimatePresence>{items.map((item) => renderShoppingRow(item))}</AnimatePresence>

              </div>

            </section>

          );

        })}



        {checked.length > 0 && (

          <section>

            <div className="mb-2 flex items-center justify-between">

              <span className="text-xs text-white/55">Erledigt ({checked.length})</span>

              <button

                onClick={clearCheckedShopping}

                className="text-xs text-white/55 hover:text-white/60"

              >

                Leeren

              </button>

            </div>

            <div className="space-y-1.5">

              {checked.map((item) => {

                const catalog = findCatalogProduct(item.name);

                return (

                  <motion.div

                    key={item.id}

                    layout

                    className="flex items-center gap-3 rounded-xl bg-dark-200/30 px-3 py-2 opacity-50"

                  >

                    <button

                      onClick={() => toggleShoppingItem(item.id)}

                      className="flex h-5 w-5 items-center justify-center rounded-md border border-green-500/50 bg-green-500/10"

                    >

                      <Check size={12} className="text-green-400" />

                    </button>

                    <span className="text-base">{catalog?.emoji ?? '📦'}</span>

                    <span className="flex-1 text-sm line-through">{item.name}</span>

                    {item.quantity && <QuantityBadge quantity={item.quantity} />}

                  </motion.div>

                );

              })}

            </div>

          </section>

        )}



        {unchecked.length === 0 && checked.length === 0 && (

          <p className="py-8 text-center text-xs text-white/55">

            {activeCategory === 'all'

              ? 'Liste ist leer – oben suchen und hinzufügen'

              : `Keine Artikel in „${activeCategoryMeta?.label}"`}

          </p>

        )}

      </div>

    </div>

  );

}


