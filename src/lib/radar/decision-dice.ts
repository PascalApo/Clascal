export type DecisionCategory =
  | 'weekend'
  | 'restaurant'
  | 'movie'
  | 'cook_today'
  | 'activity';

export interface DecisionOption {
  label: string;
  emoji: string;
}

const DECISION_POOLS: Record<DecisionCategory, DecisionOption[]> = {
  weekend: [
    { label: 'Wanderung in der Natur', emoji: '🥾' },
    { label: 'Stadtbummel & Café', emoji: '☕' },
    { label: 'Zuhause kuscheln & Serie', emoji: '🛋️' },
    { label: 'Fahrradtour', emoji: '🚴' },
    { label: 'Museum oder Ausstellung', emoji: '🏛️' },
    { label: 'Flohmarkt besuchen', emoji: '🛍️' },
    { label: 'Kochen & Freunde einladen', emoji: '👨‍🍳' },
    { label: 'Wellness / Sauna', emoji: '🧖' },
  ],
  restaurant: [
    { label: 'Italienisch', emoji: '🍝' },
    { label: 'Asiatisch', emoji: '🍜' },
    { label: 'Burger & Pommes', emoji: '🍔' },
    { label: 'Sushi', emoji: '🍣' },
    { label: 'Griechisch', emoji: '🥙' },
    { label: 'Indisch', emoji: '🍛' },
    { label: 'Neues Lokal ausprobieren', emoji: '✨' },
    { label: 'Lieblingsrestaurant', emoji: '❤️' },
  ],
  movie: [
    { label: 'Komödie', emoji: '😂' },
    { label: 'Thriller', emoji: '😱' },
    { label: 'Dokumentation', emoji: '📽️' },
    { label: 'Romantik', emoji: '💕' },
    { label: 'Action', emoji: '💥' },
    { label: 'Krimi-Serie', emoji: '🔍' },
    { label: 'Anime', emoji: '🎌' },
    { label: 'Klassiker neu schauen', emoji: '🎬' },
  ],
  cook_today: [
    { label: 'Clara kocht', emoji: '👩‍🍳' },
    { label: 'Pascal kocht', emoji: '👨‍🍳' },
    { label: 'Gemeinsam kochen', emoji: '💑' },
    { label: 'Reste aufbrauchen', emoji: '♻️' },
    { label: 'Einfach & schnell', emoji: '⚡' },
    { label: 'Etwas Neues ausprobieren', emoji: '🎲' },
  ],
  activity: [
    { label: 'Brettspiel-Abend', emoji: '🎲' },
    { label: 'Spaziergang', emoji: '🚶' },
    { label: 'Backen', emoji: '🧁' },
    { label: 'Karaoke', emoji: '🎤' },
    { label: 'Fotos machen', emoji: '📸' },
    { label: 'Yoga zusammen', emoji: '🧘' },
    { label: 'Puzzle', emoji: '🧩' },
    { label: 'Planen für nächsten Urlaub', emoji: '✈️' },
  ],
};

export const DECISION_CATEGORY_LABELS: Record<DecisionCategory, string> = {
  weekend: 'Wochenend-Aktivität',
  restaurant: 'Restaurant',
  movie: 'Film / Serie',
  cook_today: 'Wer kocht heute?',
  activity: 'Aktivität',
};

export function rollDecision(
  category: DecisionCategory,
  excludeLabels: string[] = [],
): DecisionOption {
  const pool = DECISION_POOLS[category];
  const exclude = new Set(excludeLabels);
  const candidates = pool.filter((o) => !exclude.has(o.label));
  const pickFrom = candidates.length > 0 ? candidates : pool;
  return pickFrom[Math.floor(Math.random() * pickFrom.length)];
}
