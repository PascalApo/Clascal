import type { ShoppingListItem } from '@/lib/sync/types';
import {
  DEFAULT_QUANTITY_BY_UNIT,
  type QuantityUnitType,
} from '@/lib/quantity-presets';

type ShoppingCategory = ShoppingListItem['category'];

export interface CatalogProduct {
  name: string;
  category: ShoppingCategory;
  emoji: string;
  keywords: string[];
  unitType: QuantityUnitType;
  defaultQuantity: string;
}

function p(
  name: string,
  category: ShoppingCategory,
  emoji: string,
  unitType: QuantityUnitType,
  defaultQuantity?: string,
  keywords: string[] = [],
): CatalogProduct {
  const base = name.toLowerCase();
  return {
    name,
    category,
    emoji,
    unitType,
    defaultQuantity: defaultQuantity ?? DEFAULT_QUANTITY_BY_UNIT[unitType],
    keywords: [base, ...keywords.map((k) => k.toLowerCase())],
  };
}

export const SHOPPING_CATALOG: CatalogProduct[] = [
  // Gemüse & Obst – Stück
  p('Tomaten', 'gemuese', '🍅', 'stueck', '4 Stück', ['tomate', 'cherrytomaten']),
  p('Kirschtomaten', 'gemuese', '🍅', 'stueck', '1 Packung', ['mini tomate']),
  p('Gurke', 'gemuese', '🥒', 'stueck', '2 Stück', ['gurken']),
  p('Paprika', 'gemuese', '🫑', 'stueck', '2 Stück', ['paprikas']),
  p('Salat', 'gemuese', '🥬', 'stueck', '1 Stück', ['kopfsalat', 'eisbergsalat', 'feldsalat']),
  p('Rucola', 'gemuese', '🥬', 'packung', '1 Packung', ['rauke']),
  p('Zucchini', 'gemuese', '🥒', 'stueck', '2 Stück'),
  p('Aubergine', 'gemuese', '🍆', 'stueck', '1 Stück'),
  p('Zwiebeln', 'gemuese', '🧅', 'packung', '1 Packung', ['zwiebel']),
  p('Knoblauch', 'gemuese', '🧄', 'stueck', '1 Stück'),
  p('Lauch', 'gemuese', '🧅', 'stueck', '1 Stück', ['porree']),
  p('Sellerie', 'gemuese', '🥬', 'stueck', '1 Stück'),
  p('Spinat', 'gemuese', '🥬', 'packung', '1 Packung'),
  p('Äpfel', 'gemuese', '🍎', 'stueck', '6 Stück', ['apfel']),
  p('Bananen', 'gemuese', '🍌', 'stueck', '5 Stück', ['banane']),
  p('Orangen', 'gemuese', '🍊', 'stueck', '4 Stück', ['orange']),
  p('Zitronen', 'gemuese', '🍋', 'stueck', '3 Stück', ['zitrone']),
  p('Avocado', 'gemuese', '🥑', 'stueck', '2 Stück', ['avocados']),
  p('Mango', 'gemuese', '🥭', 'stueck', '2 Stück'),
  p('Ananas', 'gemuese', '🍍', 'stueck', '1 Stück'),
  p('Wassermelone', 'gemuese', '🍉', 'stueck', '1 Stück'),
  // Gemüse – Gramm
  p('Karotten', 'gemuese', '🥕', 'gramm', '500 g', ['möhren', 'karotte']),
  p('Kartoffeln', 'gemuese', '🥔', 'gramm', '1000 g', ['kartoffel']),
  p('Süßkartoffeln', 'gemuese', '🍠', 'gramm', '500 g'),
  p('Trauben', 'gemuese', '🍇', 'gramm', '500 g', ['weintrauben']),
  p('Erdbeeren', 'gemuese', '🍓', 'gramm', '250 g', ['erdbeere']),
  p('Himbeeren', 'gemuese', '🫐', 'gramm', '125 g', ['himbeere']),
  p('Blaubeeren', 'gemuese', '🫐', 'gramm', '125 g', ['heidelbeeren']),

  // Fleisch & Fisch – Gramm
  p('Hähnchenbrust', 'fleisch', '🍗', 'gramm', '400 g', ['hähnchen', 'haehnchen', 'putenbrust', 'geflügel']),
  p('Hähnchenschenkel', 'fleisch', '🍗', 'gramm', '500 g'),
  p('Hähnchenfilet', 'fleisch', '🍗', 'gramm', '400 g'),
  p('Rinderhack', 'fleisch', '🥩', 'gramm', '500 g', ['hackfleisch rind', 'rinderhackfleisch', 'hackfleisch']),
  p('Rindersteak', 'fleisch', '🥩', 'gramm', '300 g', ['steak rind']),
  p('Rindergulasch', 'fleisch', '🥩', 'gramm', '500 g', ['gulasch rind']),
  p('Schweineschnitzel', 'fleisch', '🥓', 'gramm', '400 g', ['schnitzel', 'schwein']),
  p('Schweinehack', 'fleisch', '🥓', 'gramm', '500 g', ['hackfleisch schwein']),
  p('Schweinefilet', 'fleisch', '🥓', 'gramm', '400 g'),
  p('Schweinebraten', 'fleisch', '🥓', 'gramm', '800 g'),
  p('Speck', 'fleisch', '🥓', 'gramm', '200 g', ['bacon']),
  p('Schinken', 'fleisch', '🥓', 'gramm', '150 g', ['kochschinken', 'schinkenwurst']),
  p('Salami', 'fleisch', '🥓', 'gramm', '100 g'),
  p('Lachs', 'fleisch', '🐟', 'gramm', '300 g', ['lachsfilet']),
  p('Garnelen', 'fleisch', '🦐', 'gramm', '250 g', ['shrimps']),
  // Fleisch – Stück / Packung
  p('Wiener Würstchen', 'fleisch', '🌭', 'stueck', '6 Stück', ['würstchen', 'frankfurter']),
  p('Bratwurst', 'fleisch', '🌭', 'stueck', '4 Stück'),
  p('Thunfisch', 'fleisch', '🐟', 'packung', '2 Dosen', ['thunfisch dose']),

  // Milchprodukte – Liter
  p('Milch', 'milchprodukte', '🥛', 'liter', '1 Liter', ['vollmilch', 'haltbare milch']),
  p('Hafermilch', 'milchprodukte', '🥛', 'liter', '1 Liter', ['haferdrink']),
  // Milchprodukte – Milliliter
  p('Sahne', 'milchprodukte', '🥛', 'ml', '200 ml', ['rahm', 'schlagsahne', 'sahne sprühen']),
  p('Schmand', 'milchprodukte', '🥛', 'ml', '200 ml', ['saure sahne']),
  p('Crème fraîche', 'milchprodukte', '🥛', 'ml', '200 ml', ['creme fraiche', 'cremefraiche']),
  // Milchprodukte – Becher / Packung
  p('Joghurt', 'milchprodukte', '🫙', 'packung', '4 Becher', ['jogurt', 'naturjoghurt']),
  p('Griechischer Joghurt', 'milchprodukte', '🫙', 'packung', '2 Becher'),
  p('Quark', 'milchprodukte', '🫙', 'packung', '1 Becher', ['magerquark']),
  p('Skyr', 'milchprodukte', '🫙', 'packung', '2 Becher'),
  p('Butter', 'milchprodukte', '🧈', 'packung', '1 Packung', ['pflanzenbutter']),
  p('Margarine', 'milchprodukte', '🧈', 'packung', '1 Packung'),
  // Milchprodukte – Gramm
  p('Käse', 'milchprodukte', '🧀', 'gramm', '200 g', ['gouda', 'cheddar', 'emmentaler']),
  p('Mozzarella', 'milchprodukte', '🧀', 'gramm', '125 g'),
  p('Feta', 'milchprodukte', '🧀', 'gramm', '200 g'),
  p('Parmesan', 'milchprodukte', '🧀', 'gramm', '100 g', ['parmigiano']),
  p('Frischkäse', 'milchprodukte', '🧀', 'gramm', '200 g'),
  // Milchprodukte – Stück
  p('Eier', 'milchprodukte', '🥚', 'stueck', '6 Stück', ['ei', 'freilandeier']),

  // Brot & Getreide
  p('Brot', 'getreide', '🍞', 'stueck', '1 Stück', ['vollkornbrot', 'toastbrot']),
  p('Brötchen', 'getreide', '🥖', 'stueck', '6 Stück', ['semmeln', 'brötchen']),
  p('Baguette', 'getreide', '🥖', 'stueck', '1 Stück'),
  p('Tortilla Wraps', 'getreide', '🌯', 'packung', '1 Packung', ['wraps', 'tortillas']),
  p('Nudeln', 'getreide', '🍝', 'gramm', '500 g', ['pasta', 'spaghetti', 'penne', 'fusilli']),
  p('Spaghetti', 'getreide', '🍝', 'gramm', '500 g'),
  p('Reis', 'getreide', '🍚', 'gramm', '500 g', ['basmatireis', 'jasminreis']),
  p('Haferflocken', 'getreide', '🥣', 'gramm', '500 g', ['porridge']),
  p('Müsli', 'getreide', '🥣', 'packung', '1 Packung'),
  p('Mehl', 'getreide', '🌾', 'gramm', '1000 g', ['weizenmehl', 'dinkelmehl']),
  p('Paniermehl', 'getreide', '🌾', 'gramm', '300 g'),
  p('Zucker', 'getreide', '🧂', 'gramm', '500 g', ['haushaltszucker']),
  p('Cornflakes', 'getreide', '🥣', 'packung', '1 Packung'),
  p('Tomatenmark', 'getreide', '🥫', 'packung', '1 Dose'),
  p('Passierte Tomaten', 'getreide', '🥫', 'packung', '1 Dose', ['tomaten passiert']),
  p('Dosentomaten', 'getreide', '🥫', 'packung', '2 Dosen'),
  p('Olivenöl', 'getreide', '🫒', 'ml', '500 ml', ['olivenoel']),
  p('Sonnenblumenöl', 'getreide', '🫒', 'ml', '750 ml', ['öl']),
  p('Essig', 'getreide', '🍶', 'ml', '500 ml', ['balsamico', 'apfelessig']),
  p('Honig', 'getreide', '🍯', 'packung', '1 Glas'),
  p('Marmelade', 'getreide', '🍯', 'packung', '1 Glas', ['konfitüre']),
  p('Backpulver', 'getreide', '🧂', 'packung', '1 Packung'),
  p('Hefe', 'getreide', '🧂', 'packung', '1 Packung'),

  // Getränke – Liter
  p('Wasser', 'getraenke', '💧', 'liter', '1,5 Liter', ['mineralwasser', 'sprudel']),
  p('Sprudel', 'getraenke', '💧', 'liter', '1 Liter', ['mineralwasser sprudel']),
  p('Saft', 'getraenke', '🧃', 'liter', '1 Liter', ['orangensaft', 'apfelsaft']),
  p('Orangensaft', 'getraenke', '🧃', 'liter', '1 Liter'),
  p('Apfelsaft', 'getraenke', '🧃', 'liter', '1 Liter'),
  p('Cola', 'getraenke', '🥤', 'liter', '1,5 Liter', ['coca cola', 'pepsi']),
  p('Limonade', 'getraenke', '🥤', 'liter', '1 Liter'),
  p('Bier', 'getraenke', '🍺', 'liter', '0,5 Liter'),
  p('Wein', 'getraenke', '🍷', 'liter', '0,75 Liter', ['rotwein', 'weißwein']),
  p('Prosecco', 'getraenke', '🥂', 'liter', '0,75 Liter', ['sekt']),
  p('Energy Drink', 'getraenke', '🥤', 'liter', '1 Liter', ['red bull']),
  // Getränke – Packung
  p('Kaffee', 'getraenke', '☕', 'packung', '1 Packung', ['bohnenkaffee', 'gemahlen']),
  p('Kaffeepads', 'getraenke', '☕', 'packung', '1 Packung', ['pads']),
  p('Tee', 'getraenke', '🍵', 'packung', '1 Packung', ['schwarzer tee', 'grüner tee']),
  p('Kakao', 'getraenke', '☕', 'packung', '1 Packung'),

  // Tiefkühl – Packung
  p('Pizza TK', 'tiefkuehl', '🍕', 'packung', '1 Packung', ['tiefkühlpizza', 'frozen pizza']),
  p('Pommes TK', 'tiefkuehl', '🍟', 'packung', '1 Packung', ['fritten']),
  p('Gemüse TK', 'tiefkuehl', '❄️', 'packung', '1 Packung', ['tiefkühlgemüse']),
  p('Beeren TK', 'tiefkuehl', '🫐', 'packung', '1 Packung', ['tiefkühlbeeren']),
  p('Fischstäbchen', 'tiefkuehl', '🐟', 'packung', '1 Packung'),
  p('Frikadellen TK', 'tiefkuehl', '🍖', 'packung', '1 Packung'),
  p('Eis', 'tiefkuehl', '🍦', 'packung', '1 Packung', ['speiseeis']),
  p('Spinat TK', 'tiefkuehl', '❄️', 'packung', '1 Packung'),

  // Drogerie – Packung
  p('Shampoo', 'drogerie', '🧴', 'packung', '1 Packung'),
  p('Duschgel', 'drogerie', '🧴', 'packung', '1 Packung', ['dusch shampoo']),
  p('Seife', 'drogerie', '🧼', 'packung', '1 Packung', ['handseife']),
  p('Zahnpasta', 'drogerie', '🪥', 'packung', '1 Tube', ['zahncreme']),
  p('Zahnbürste', 'drogerie', '🪥', 'stueck', '2 Stück'),
  p('Mundspülung', 'drogerie', '🪥', 'ml', '500 ml'),
  p('Deo', 'drogerie', '🧴', 'packung', '1 Packung', ['deodorant']),
  p('Handcreme', 'drogerie', '🧴', 'packung', '1 Tube'),
  p('Feuchttücher', 'drogerie', '🧻', 'packung', '1 Packung'),
  p('Toilettenpapier', 'drogerie', '🧻', 'packung', '1 Packung', ['klopapier']),
  p('Küchenrolle', 'drogerie', '🧻', 'packung', '1 Rolle'),
  p('Taschentücher', 'drogerie', '🧻', 'packung', '1 Packung'),
  p('Waschmittel', 'drogerie', '🧺', 'packung', '1 Packung', ['waschpulver']),
  p('Weichspüler', 'drogerie', '🧺', 'packung', '1 Packung'),
  p('Spülmittel', 'drogerie', '🧽', 'ml', '500 ml', ['geschirrspülmittel']),
  p('Schwämme', 'drogerie', '🧽', 'packung', '1 Packung'),
  p('Müllbeutel', 'drogerie', '🗑️', 'packung', '1 Rolle'),
  p('Alufolie', 'drogerie', '📦', 'packung', '1 Rolle'),
  p('Frischhaltefolie', 'drogerie', '📦', 'packung', '1 Rolle', ['klarsichtfolie']),
  p('Wattestäbchen', 'drogerie', '🧴', 'packung', '1 Packung'),
  p('Rasierklingen', 'drogerie', '🪒', 'packung', '1 Packung'),
  p('Binden', 'drogerie', '🩹', 'packung', '1 Packung'),
  p('Tampons', 'drogerie', '🩹', 'packung', '1 Packung'),

  // Sonstiges
  p('Salz', 'sonstiges', '🧂', 'packung', '1 Packung'),
  p('Pfeffer', 'sonstiges', '🧂', 'packung', '1 Packung'),
  p('Paprikapulver', 'sonstiges', '🧂', 'packung', '1 Packung', ['paprika gewürz']),
  p('Curry', 'sonstiges', '🧂', 'packung', '1 Packung', ['currypulver']),
  p('Zimt', 'sonstiges', '🧂', 'packung', '1 Packung'),
  p('Brühe', 'sonstiges', '🍲', 'packung', '1 Packung', ['gemüsebrühe', 'hühnerbrühe', 'fond']),
  p('Senf', 'sonstiges', '🫙', 'packung', '1 Glas'),
  p('Ketchup', 'sonstiges', '🫙', 'packung', '1 Glas'),
  p('Mayonnaise', 'sonstiges', '🫙', 'packung', '1 Glas', ['mayo']),
  p('Sojasoße', 'sonstiges', '🫙', 'ml', '250 ml', ['sojasauce']),
  p('Nüsse', 'sonstiges', '🥜', 'gramm', '200 g', ['mandeln', 'walnüsse', 'cashews']),
  p('Chips', 'sonstiges', '🥔', 'packung', '1 Packung', ['kartoffelchips']),
  p('Schokolade', 'sonstiges', '🍫', 'stueck', '1 Stück'),
  p('Kekse', 'sonstiges', '🍪', 'packung', '1 Packung', ['kekse', 'plätzchen']),
  p('Katzenfutter', 'sonstiges', '🐱', 'packung', '1 Packung'),
  p('Hundefutter', 'sonstiges', '🐶', 'packung', '1 Packung'),
  p('Batterien', 'sonstiges', '🔋', 'packung', '1 Packung'),
  p('Kerzen', 'sonstiges', '🕯️', 'packung', '1 Packung'),
];

function scoreProduct(product: CatalogProduct, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const name = product.name.toLowerCase();

  if (name === q) return 100;
  if (name.startsWith(q)) return 80;
  if (name.includes(q)) return 60;

  for (const kw of product.keywords) {
    if (kw === q) return 70;
    if (kw.startsWith(q)) return 55;
    if (kw.includes(q)) return 40;
  }

  const words = q.split(/\s+/);
  if (words.every((w) => name.includes(w) || product.keywords.some((k) => k.includes(w)))) {
    return 30;
  }

  return 0;
}

export function searchCatalog(
  query: string,
  categoryFilter?: ShoppingCategory | 'all',
  limit = 12,
): CatalogProduct[] {
  const q = query.trim();
  if (!q) return [];

  return SHOPPING_CATALOG.filter((p) => categoryFilter === 'all' || !categoryFilter || p.category === categoryFilter)
    .map((product) => ({ product, score: scoreProduct(product, q) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ product }) => product);
}

export function findCatalogProduct(name: string): CatalogProduct | undefined {
  const lower = name.toLowerCase();
  return SHOPPING_CATALOG.find(
    (p) => p.name.toLowerCase() === lower || p.keywords.includes(lower),
  );
}

/** @deprecated use SHOPPING_CATALOG */
export const QUICK_ITEMS = SHOPPING_CATALOG.slice(0, 25).map((p) => ({
  name: p.name,
  category: p.category,
  emoji: p.emoji,
}));
