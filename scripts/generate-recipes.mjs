import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function ing(name, amount, unit, category) {
  return { name, amount, unit, category };
}

function recipe(id, data) {
  return {
    id: `r${String(id).padStart(3, '0')}`,
    servings: 2,
    difficulty: 'einfach',
    ...data,
  };
}

const recipes = [
  // === KLASSIKER (1-10) ===
  recipe(1, {
    name: 'Spaghetti Bolognese',
    category: 'klassiker',
    description: 'Der zeitlose Klassiker mit Rinderhack und Tomatensoße.',
    prepTime: 15, cookTime: 40, meatType: 'rind',
    ingredients: [
      ing('Spaghetti', 250, 'g', 'getreide'),
      ing('Rinderhackfleisch', 300, 'g', 'fleisch'),
      ing('Tomaten (Dose)', 400, 'g', 'gemuese'),
      ing('Zwiebel', 1, 'Stück', 'gemuese'),
      ing('Knoblauch', 2, 'Zehen', 'gewuerze'),
      ing('Tomatenmark', 2, 'EL', 'gemuese'),
      ing('Olivenöl', 2, 'EL', 'sonstiges'),
      ing('Oregano', 1, 'TL', 'gewuerze'),
      ing('Basilikum', 1, 'Bund', 'gewuerze'),
    ],
    steps: [
      'Zwiebel und Knoblauch fein würfeln und in Olivenöl anbraten.',
      'Rinderhack hinzufügen und krümelig braten.',
      'Tomatenmark einrühren, dann Dosentomaten und Gewürze zugeben.',
      '30 Min. köcheln lassen. Spaghetti kochen und mit Soße servieren.',
    ],
    nutrition: { calories: 520, protein: 32, carbs: 58, fat: 18, fiber: 6 },
    tags: ['klassiker', 'pasta', 'rind'],
  }),
  recipe(2, {
    name: 'Nudeln mit Tomatensoße',
    category: 'klassiker',
    description: 'Einfache, gesunde Tomatensoße über Penne.',
    prepTime: 10, cookTime: 25, meatType: 'keins',
    ingredients: [
      ing('Penne', 250, 'g', 'getreide'),
      ing('Tomaten (Dose)', 400, 'g', 'gemuese'),
      ing('Knoblauch', 3, 'Zehen', 'gewuerze'),
      ing('Olivenöl', 3, 'EL', 'sonstiges'),
      ing('Basilikum', 1, 'Bund', 'gewuerze'),
      ing('Zucker', 1, 'Prise', 'sonstiges'),
    ],
    steps: [
      'Knoblauch in Olivenöl andünsten.',
      'Tomaten zugeben, würzen und 20 Min. köcheln.',
      'Penne al dente kochen, mit Soße und Basilikum servieren.',
    ],
    nutrition: { calories: 380, protein: 12, carbs: 62, fat: 10, fiber: 5 },
    tags: ['vegetarisch', 'pasta', 'schnell'],
  }),
  recipe(3, {
    name: 'Geschnetzeltes mit Reis',
    category: 'klassiker',
    description: 'Zartes Hähnchengeschnetzeltes in Sahnesoße mit Basmatireis.',
    prepTime: 15, cookTime: 25, meatType: 'haehnchen',
    ingredients: [
      ing('Hähnchenbrust', 400, 'g', 'fleisch'),
      ing('Basmatireis', 200, 'g', 'getreide'),
      ing('Sahne', 150, 'ml', 'milchprodukte'),
      ing('Zwiebel', 1, 'Stück', 'gemuese'),
      ing('Paprika', 1, 'Stück', 'gemuese'),
      ing('Brühe', 100, 'ml', 'sonstiges'),
      ing('Petersilie', 1, 'Bund', 'gewuerze'),
    ],
    steps: [
      'Reis kochen. Hähnchen in Streifen schneiden.',
      'Zwiebel und Paprika anbraten, Hähnchen zugeben und braten.',
      'Sahne und Brühe einrühren, 10 Min. köcheln.',
      'Mit Petersilie bestreuen und mit Reis servieren.',
    ],
    nutrition: { calories: 480, protein: 38, carbs: 45, fat: 16, fiber: 3 },
    tags: ['klassiker', 'haehnchen', 'reis'],
  }),
  recipe(4, {
    name: 'Hähnchensalat mit Gurke',
    category: 'salat',
    description: 'Leichter, proteinreicher Salat mit gegrilltem Hähnchen.',
    prepTime: 20, cookTime: 15, meatType: 'haehnchen',
    ingredients: [
      ing('Hähnchenbrust', 300, 'g', 'fleisch'),
      ing('Salat (gemischt)', 150, 'g', 'gemuese'),
      ing('Gurke', 1, 'Stück', 'gemuese'),
      ing('Tomaten', 2, 'Stück', 'gemuese'),
      ing('Olivenöl', 3, 'EL', 'sonstiges'),
      ing('Zitronensaft', 2, 'EL', 'obst'),
      ing('Honig', 1, 'TL', 'sonstiges'),
    ],
    steps: [
      'Hähnchen würzen und in der Pfanne braten, dann in Streifen schneiden.',
      'Salat, Gurke und Tomaten vorbereiten.',
      'Dressing aus Olivenöl, Zitronensaft und Honig mixen.',
      'Alles vermengen und servieren.',
    ],
    nutrition: { calories: 320, protein: 35, carbs: 12, fat: 16, fiber: 4 },
    tags: ['salat', 'haehnchen', 'gesund'],
  }),
  recipe(5, {
    name: 'Rindersteak mit Kartoffeln',
    category: 'ofen',
    description: 'Saftiges Rindersteak mit Ofenkartoffeln und Kräuterbutter.',
    prepTime: 15, cookTime: 35, meatType: 'rind',
    ingredients: [
      ing('Rindersteak', 400, 'g', 'fleisch'),
      ing('Kartoffeln', 500, 'g', 'getreide'),
      ing('Rosmarin', 2, 'Zweige', 'gewuerze'),
      ing('Butter', 40, 'g', 'milchprodukte'),
      ing('Knoblauch', 2, 'Zehen', 'gewuerze'),
      ing('Olivenöl', 3, 'EL', 'sonstiges'),
    ],
    steps: [
      'Kartoffeln halbieren, mit Öl und Rosmarin im Ofen 30 Min. backen.',
      'Steaks bei hoher Hitze 3-4 Min. pro Seite braten.',
      'Kräuterbutter aus Butter und Knoblauch formen.',
      'Steak mit Butter und Kartoffeln servieren.',
    ],
    nutrition: { calories: 580, protein: 42, carbs: 38, fat: 28, fiber: 4 },
    tags: ['rind', 'ofen', 'kartoffeln'],
  }),
  recipe(6, {
    name: 'Schweineschnitzel Wiener Art',
    category: 'pfanne',
    description: 'Knuspriges paniertes Schnitzel mit Zitrone.',
    prepTime: 20, cookTime: 15, meatType: 'schwein',
    ingredients: [
      ing('Schweineschnitzel', 400, 'g', 'fleisch'),
      ing('Paniermehl', 100, 'g', 'getreide'),
      ing('Eier', 2, 'Stück', 'milchprodukte'),
      ing('Mehl', 50, 'g', 'getreide'),
      ing('Zitrone', 1, 'Stück', 'obst'),
      ing('Butter', 60, 'g', 'milchprodukte'),
    ],
    steps: [
      'Schnitzel klopfen und würzen.',
      'Mehl, Ei, Paniermehl – nacheinander panieren.',
      'In Butter goldbraun braten.',
      'Mit Zitronenspalten servieren.',
    ],
    nutrition: { calories: 520, protein: 40, carbs: 28, fat: 26, fiber: 1 },
    tags: ['schwein', 'klassiker'],
  }),
  recipe(7, {
    name: 'Kartoffelgratin',
    category: 'auflauf',
    description: 'Cremiger Kartoffelauflauf mit Käsekruste.',
    prepTime: 20, cookTime: 45, meatType: 'keins',
    ingredients: [
      ing('Kartoffeln', 600, 'g', 'getreide'),
      ing('Sahne', 200, 'ml', 'milchprodukte'),
      ing('Gruyère', 150, 'g', 'milchprodukte'),
      ing('Knoblauch', 2, 'Zehen', 'gewuerze'),
      ing('Muskat', 1, 'Prise', 'gewuerze'),
    ],
    steps: [
      'Kartoffeln in dünne Scheiben schneiden.',
      'Mit Sahne, Knoblauch und Muskat schichten.',
      'Käse darüber streuen und 45 Min. backen.',
    ],
    nutrition: { calories: 420, protein: 14, carbs: 48, fat: 20, fiber: 5 },
    tags: ['vegetarisch', 'auflauf', 'kartoffeln'],
  }),
  recipe(8, {
    name: 'Hähnchen-Wrap mit Paprika',
    category: 'wrap',
    description: 'Frischer Wrap mit gegrilltem Hähnchen und Gemüse.',
    prepTime: 15, cookTime: 12, meatType: 'haehnchen',
    ingredients: [
      ing('Hähnchenbrust', 300, 'g', 'fleisch'),
      ing('Tortilla-Wraps', 4, 'Stück', 'getreide'),
      ing('Paprika', 1, 'Stück', 'gemuese'),
      ing('Salat', 80, 'g', 'gemuese'),
      ing('Tomaten', 2, 'Stück', 'gemuese'),
      ing('Joghurt', 100, 'g', 'milchprodukte'),
    ],
    steps: [
      'Hähnchen würzen und in Streifen braten.',
      'Paprika und Tomaten schneiden.',
      'Wraps mit Joghurt, Salat, Gemüse und Hähnchen füllen.',
      'Einrollen und halbieren.',
    ],
    nutrition: { calories: 380, protein: 32, carbs: 35, fat: 12, fiber: 4 },
    tags: ['wrap', 'haehnchen', 'schnell'],
  }),
  recipe(9, {
    name: 'Rinderhack-Pfanne mit Nudeln',
    category: 'pfanne',
    description: 'Würzige Hackfleischpfanne mit Paprika und Nudeln.',
    prepTime: 15, cookTime: 25, meatType: 'rind',
    ingredients: [
      ing('Rinderhackfleisch', 350, 'g', 'fleisch'),
      ing('Fusilli', 250, 'g', 'getreide'),
      ing('Paprika', 2, 'Stück', 'gemuese'),
      ing('Tomaten', 3, 'Stück', 'gemuese'),
      ing('Zwiebel', 1, 'Stück', 'gemuese'),
      ing('Paprikapulver', 1, 'TL', 'gewuerze'),
    ],
    steps: [
      'Nudeln kochen. Hackfleisch anbraten.',
      'Zwiebel und Paprika zugeben, würzen.',
      'Tomaten hinzufügen und 10 Min. köcheln.',
      'Mit Nudeln servieren.',
    ],
    nutrition: { calories: 510, protein: 34, carbs: 52, fat: 18, fiber: 5 },
    tags: ['rind', 'pfanne', 'pasta'],
  }),
  recipe(10, {
    name: 'Gurkensalat mit Dill',
    category: 'salat',
    description: 'Erfrischender Sommersalat mit saurer Note.',
    prepTime: 10, cookTime: 0, meatType: 'keins',
    ingredients: [
      ing('Gurke', 2, 'Stück', 'gemuese'),
      ing('Saure Sahne', 150, 'g', 'milchprodukte'),
      ing('Dill', 1, 'Bund', 'gewuerze'),
      ing('Essig', 1, 'EL', 'sonstiges'),
      ing('Zucker', 1, 'TL', 'sonstiges'),
    ],
    steps: [
      'Gurken in dünne Scheiben hobeln.',
      'Saure Sahne mit Essig, Zucker und Dill verrühren.',
      'Gurken unterheben und 30 Min. ziehen lassen.',
    ],
    nutrition: { calories: 120, protein: 3, carbs: 10, fat: 8, fiber: 2 },
    tags: ['salat', 'vegetarisch', 'beilage'],
  }),

  // === PASTA (11-20) ===
  recipe(11, {
    name: 'Penne Arrabbiata',
    category: 'pasta',
    description: 'Scharfe Tomatensoße mit Knoblauch und Chili.',
    prepTime: 10, cookTime: 20, meatType: 'keins',
    ingredients: [
      ing('Penne', 250, 'g', 'getreide'),
      ing('Tomaten (Dose)', 400, 'g', 'gemuese'),
      ing('Knoblauch', 4, 'Zehen', 'gewuerze'),
      ing('Chiliflocken', 1, 'TL', 'gewuerze'),
      ing('Olivenöl', 3, 'EL', 'sonstiges'),
      ing('Petersilie', 1, 'Bund', 'gewuerze'),
    ],
    steps: [
      'Knoblauch und Chili in Öl anbraten.',
      'Tomaten zugeben und 15 Min. einkochen.',
      'Penne kochen und mit Soße vermengen.',
    ],
    nutrition: { calories: 390, protein: 12, carbs: 64, fat: 10, fiber: 5 },
    tags: ['pasta', 'vegetarisch', 'scharf'],
  }),
  recipe(12, {
    name: 'Tagliatelle mit Rinder-Ragù',
    category: 'pasta',
    description: 'Langsam geschmortes Rindfleisch-Ragù über breite Nudeln.',
    prepTime: 20, cookTime: 120, meatType: 'rind', difficulty: 'anspruchsvoll',
    ingredients: [
      ing('Tagliatelle', 250, 'g', 'getreide'),
      ing('Rindergulasch', 500, 'g', 'fleisch'),
      ing('Tomaten (Dose)', 400, 'g', 'gemuese'),
      ing('Rotwein', 150, 'ml', 'getraenke'),
      ing('Karotten', 2, 'Stück', 'gemuese'),
      ing('Sellerie', 2, 'Stangen', 'gemuese'),
      ing('Zwiebel', 1, 'Stück', 'gemuese'),
    ],
    steps: [
      'Fleisch scharf anbraten, Gemüse zugeben.',
      'Rotwein und Tomaten hinzufügen.',
      '2 Stunden langsam schmoren.',
      'Tagliatelle kochen und mit Ragù servieren.',
    ],
    nutrition: { calories: 560, protein: 38, carbs: 55, fat: 20, fiber: 5 },
    tags: ['pasta', 'rind', 'schmoren'],
  }),
  recipe(13, {
    name: 'Carbonara Light',
    category: 'pasta',
    description: 'Leichtere Variante mit weniger Sahne, mehr Ei.',
    prepTime: 10, cookTime: 15, meatType: 'schwein',
    ingredients: [
      ing('Spaghetti', 250, 'g', 'getreide'),
      ing('Speck', 150, 'g', 'fleisch'),
      ing('Eier', 3, 'Stück', 'milchprodukte'),
      ing('Parmesan', 60, 'g', 'milchprodukte'),
      ing('Pfeffer', 1, 'TL', 'gewuerze'),
    ],
    steps: [
      'Speck knusprig braten. Spaghetti kochen.',
      'Eier mit Parmesan verquirlen.',
      'Nudeln abgießen, mit Speck und Ei-Mischung vermengen.',
    ],
    nutrition: { calories: 520, protein: 28, carbs: 58, fat: 20, fiber: 3 },
    tags: ['pasta', 'schwein', 'klassiker'],
  }),
  recipe(14, {
    name: 'Lasagne klassisch',
    category: 'auflauf',
    description: 'Schichten aus Nudeln, Hackfleisch und Béchamel.',
    prepTime: 30, cookTime: 45, meatType: 'rind', difficulty: 'mittel',
    ingredients: [
      ing('Lasagneplatten', 250, 'g', 'getreide'),
      ing('Rinderhackfleisch', 400, 'g', 'fleisch'),
      ing('Tomaten (Dose)', 400, 'g', 'gemuese'),
      ing('Milch', 500, 'ml', 'milchprodukte'),
      ing('Butter', 50, 'g', 'milchprodukte'),
      ing('Mehl', 50, 'g', 'getreide'),
      ing('Mozzarella', 200, 'g', 'milchprodukte'),
    ],
    steps: [
      'Hacksoße und Béchamel zubereiten.',
      'Schichtweise in Form legen: Soße, Platten, Béchamel.',
      'Mit Mozzarella bestreuen und 45 Min. backen.',
    ],
    nutrition: { calories: 580, protein: 32, carbs: 52, fat: 26, fiber: 4 },
    tags: ['auflauf', 'rind', 'pasta'],
  }),
  recipe(15, {
    name: 'Pasta mit Hähnchen und Tomaten',
    category: 'pasta',
    description: 'Cremige Tomatensoße mit zartem Hähnchen.',
    prepTime: 15, cookTime: 25, meatType: 'haehnchen',
    ingredients: [
      ing('Farfalle', 250, 'g', 'getreide'),
      ing('Hähnchenbrust', 350, 'g', 'fleisch'),
      ing('Tomaten (Dose)', 400, 'g', 'gemuese'),
      ing('Sahne', 100, 'ml', 'milchprodukte'),
      ing('Basilikum', 1, 'Bund', 'gewuerze'),
    ],
    steps: [
      'Hähnchen würfeln und anbraten.',
      'Tomaten und Sahne zugeben, 15 Min. köcheln.',
      'Farfalle kochen und vermengen.',
    ],
    nutrition: { calories: 490, protein: 36, carbs: 54, fat: 14, fiber: 4 },
    tags: ['pasta', 'haehnchen'],
  }),
  recipe(16, {
    name: 'Nudelsalat mediterran',
    category: 'salat',
    description: 'Kalter Nudelsalat mit Tomaten und Paprika.',
    prepTime: 15, cookTime: 12, meatType: 'keins',
    ingredients: [
      ing('Fusilli', 250, 'g', 'getreide'),
      ing('Tomaten', 3, 'Stück', 'gemuese'),
      ing('Paprika', 1, 'Stück', 'gemuese'),
      ing('Gurke', 1, 'Stück', 'gemuese'),
      ing('Olivenöl', 4, 'EL', 'sonstiges'),
      ing('Feta', 100, 'g', 'milchprodukte'),
    ],
    steps: [
      'Nudeln kochen und abkühlen.',
      'Gemüse würfeln und mit Nudeln vermengen.',
      'Mit Olivenöl und Feta servieren.',
    ],
    nutrition: { calories: 380, protein: 14, carbs: 48, fat: 16, fiber: 4 },
    tags: ['salat', 'pasta', 'vegetarisch'],
  }),
  recipe(17, {
    name: 'Spaghetti Aglio e Olio',
    category: 'pasta',
    description: 'Minimalistisch: Knoblauch, Öl und Petersilie.',
    prepTime: 5, cookTime: 15, meatType: 'keins',
    ingredients: [
      ing('Spaghetti', 250, 'g', 'getreide'),
      ing('Knoblauch', 6, 'Zehen', 'gewuerze'),
      ing('Olivenöl', 6, 'EL', 'sonstiges'),
      ing('Petersilie', 1, 'Bund', 'gewuerze'),
      ing('Chiliflocken', 0.5, 'TL', 'gewuerze'),
    ],
    steps: [
      'Spaghetti kochen. Knoblauch in Öl langsam goldbraun braten.',
      'Nudeln mit etwas Kochwasser in die Pfanne.',
      'Petersilie und Chili unterheben.',
    ],
    nutrition: { calories: 420, protein: 11, carbs: 60, fat: 16, fiber: 3 },
    tags: ['pasta', 'vegetarisch', 'schnell'],
  }),
  recipe(18, {
    name: 'Rigatoni al Forno',
    category: 'auflauf',
    description: 'Überbackene Rigatoni mit Tomaten und Mozzarella.',
    prepTime: 15, cookTime: 30, meatType: 'keins',
    ingredients: [
      ing('Rigatoni', 300, 'g', 'getreide'),
      ing('Tomaten (Dose)', 400, 'g', 'gemuese'),
      ing('Mozzarella', 200, 'g', 'milchprodukte'),
      ing('Parmesan', 50, 'g', 'milchprodukte'),
      ing('Basilikum', 1, 'Bund', 'gewuerze'),
    ],
    steps: [
      'Rigatoni kochen, mit Tomatensoße vermengen.',
      'In Auflaufform füllen, Käse darüber.',
      '30 Min. bei 180°C backen.',
    ],
    nutrition: { calories: 450, protein: 20, carbs: 58, fat: 16, fiber: 4 },
    tags: ['auflauf', 'pasta', 'vegetarisch'],
  }),
  recipe(19, {
    name: 'Schweinefilet mit Nudeln',
    category: 'pasta',
    description: 'Medaillons vom Schweinefilet auf Bandnudeln.',
    prepTime: 15, cookTime: 20, meatType: 'schwein',
    ingredients: [
      ing('Schweinefilet', 350, 'g', 'fleisch'),
      ing('Tagliatelle', 250, 'g', 'getreide'),
      ing('Sahne', 150, 'ml', 'milchprodukte'),
      ing('Senf', 1, 'TL', 'gewuerze'),
      ing('Petersilie', 1, 'Bund', 'gewuerze'),
    ],
    steps: [
      'Filet in Medaillons schneiden und braten.',
      'Sahne-Senf-Soße zubereiten.',
      'Tagliatelle kochen und mit Medaillons servieren.',
    ],
    nutrition: { calories: 540, protein: 40, carbs: 52, fat: 18, fiber: 3 },
    tags: ['schwein', 'pasta'],
  }),
  recipe(20, {
    name: 'Tomaten-Basilikum-Pasta',
    category: 'pasta',
    description: 'Frische Kirschtomaten mit Basilikum und Knoblauch.',
    prepTime: 10, cookTime: 15, meatType: 'keins',
    ingredients: [
      ing('Linguine', 250, 'g', 'getreide'),
      ing('Kirschtomaten', 400, 'g', 'gemuese'),
      ing('Basilikum', 2, 'Bund', 'gewuerze'),
      ing('Knoblauch', 3, 'Zehen', 'gewuerze'),
      ing('Olivenöl', 4, 'EL', 'sonstiges'),
    ],
    steps: [
      'Tomaten halbieren, mit Knoblauch in Öl anbraten.',
      'Linguine kochen und unterheben.',
      'Frisches Basilikum unterrühren.',
    ],
    nutrition: { calories: 400, protein: 12, carbs: 62, fat: 12, fiber: 5 },
    tags: ['pasta', 'vegetarisch', 'sommer'],
  }),
];

// Generate remaining 80 recipes programmatically
const templates = [
  // Aufläufe
  { base: 'Kartoffel-Hack-Auflauf', cat: 'auflauf', meat: 'rind', veg: ['Kartoffeln', 'Zwiebel', 'Paprika'] },
  { base: 'Zucchini-Tomaten-Auflauf', cat: 'auflauf', meat: 'keins', veg: ['Zucchini', 'Tomaten', 'Zwiebel'] },
  { base: 'Hähnchen-Reis-Auflauf', cat: 'auflauf', meat: 'haehnchen', veg: ['Reis', 'Paprika', 'Tomaten'] },
  { base: 'Nudel-Schinken-Auflauf', cat: 'auflauf', meat: 'schwein', veg: ['Nudeln', 'Tomaten'] },
  { base: 'Kartoffel-Schweinehack-Gratin', cat: 'auflauf', meat: 'schwein', veg: ['Kartoffeln', 'Sahne'] },
  { base: 'Rindfleisch-Kartoffel-Auflauf', cat: 'auflauf', meat: 'rind', veg: ['Kartoffeln', 'Karotten'] },
  { base: 'Paprika-Reis-Auflauf', cat: 'auflauf', meat: 'haehnchen', veg: ['Reis', 'Paprika', 'Tomaten'] },
  { base: 'Tomaten-Mozzarella-Auflauf', cat: 'auflauf', meat: 'keins', veg: ['Tomaten', 'Zucchini'] },
  { base: 'Hackfleisch-Lasagne-Röllchen', cat: 'auflauf', meat: 'rind', veg: ['Lasagneplatten', 'Tomaten'] },
  { base: 'Kartoffel-Hähnchen-Gratin', cat: 'auflauf', meat: 'haehnchen', veg: ['Kartoffeln', 'Sahne'] },
  // Pfanne
  { base: 'Hähnchen-Paprika-Pfanne', cat: 'pfanne', meat: 'haehnchen', veg: ['Paprika', 'Tomaten', 'Zwiebel'] },
  { base: 'Rinderstreifen-Pfanne', cat: 'pfanne', meat: 'rind', veg: ['Paprika', 'Zwiebel'] },
  { base: 'Schweinegeschnetzeltes', cat: 'pfanne', meat: 'schwein', veg: ['Paprika', 'Sahne'] },
  { base: 'Hackfleisch-Kartoffel-Pfanne', cat: 'pfanne', meat: 'rind', veg: ['Kartoffeln', 'Zwiebel'] },
  { base: 'Hähnchen-Tomaten-Pfanne', cat: 'pfanne', meat: 'haehnchen', veg: ['Tomaten', 'Paprika'] },
  { base: 'Schweinehack-Paprika-Pfanne', cat: 'pfanne', meat: 'schwein', veg: ['Paprika', 'Tomaten'] },
  { base: 'Rinderhack-Reis-Pfanne', cat: 'pfanne', meat: 'rind', veg: ['Reis', 'Tomaten'] },
  { base: 'Hähnchen-Gurken-Pfanne', cat: 'pfanne', meat: 'haehnchen', veg: ['Gurke', 'Paprika'] },
  { base: 'Schweinefilet-Pfanne', cat: 'pfanne', meat: 'schwein', veg: ['Paprika', 'Sahne'] },
  { base: 'Rindergulasch-Pfanne', cat: 'pfanne', meat: 'rind', veg: ['Zwiebel', 'Paprika'] },
  // Wraps
  { base: 'Hähnchen-Salat-Wrap', cat: 'wrap', meat: 'haehnchen', veg: ['Salat', 'Tomaten', 'Gurke'] },
  { base: 'Rinderhack-Wrap', cat: 'wrap', meat: 'rind', veg: ['Salat', 'Tomaten', 'Paprika'] },
  { base: 'Schweinefilet-Wrap', cat: 'wrap', meat: 'schwein', veg: ['Salat', 'Gurke'] },
  { base: 'Tomaten-Mozzarella-Wrap', cat: 'wrap', meat: 'keins', veg: ['Tomaten', 'Salat'] },
  { base: 'Hähnchen-Avocado-Wrap', cat: 'wrap', meat: 'haehnchen', veg: ['Avocado', 'Salat', 'Tomaten'] },
  { base: 'Paprika-Hack-Wrap', cat: 'wrap', meat: 'rind', veg: ['Paprika', 'Salat'] },
  { base: 'Gurkensalat-Wrap', cat: 'wrap', meat: 'keins', veg: ['Gurke', 'Salat', 'Tomaten'] },
  { base: 'Schweinehack-Wrap', cat: 'wrap', meat: 'schwein', veg: ['Salat', 'Tomaten'] },
  { base: 'Hähnchen-Paprika-Wrap', cat: 'wrap', meat: 'haehnchen', veg: ['Paprika', 'Salat'] },
  { base: 'Rinderstreifen-Wrap', cat: 'wrap', meat: 'rind', veg: ['Salat', 'Gurke', 'Tomaten'] },
  // Ofen
  { base: 'Ofen-Hähnchen mit Kartoffeln', cat: 'ofen', meat: 'haehnchen', veg: ['Kartoffeln', 'Paprika'] },
  { base: 'Schweinebraten im Ofen', cat: 'ofen', meat: 'schwein', veg: ['Kartoffeln', 'Zwiebel'] },
  { base: 'Rinderbraten mit Gemüse', cat: 'ofen', meat: 'rind', veg: ['Karotten', 'Zwiebel'] },
  { base: 'Ofenkartoffeln mit Kräutern', cat: 'ofen', meat: 'keins', veg: ['Kartoffeln', 'Rosmarin'] },
  { base: 'Hähnchenschenkel aus dem Ofen', cat: 'ofen', meat: 'haehnchen', veg: ['Kartoffeln', 'Tomaten'] },
  { base: 'Schweinekotelett im Ofen', cat: 'ofen', meat: 'schwein', veg: ['Kartoffeln', 'Paprika'] },
  { base: 'Rinderrouladen', cat: 'ofen', meat: 'rind', veg: ['Zwiebel', 'Gurken'] },
  { base: 'Ofen-Gemüse mit Hähnchen', cat: 'ofen', meat: 'haehnchen', veg: ['Paprika', 'Tomaten', 'Zucchini'] },
  { base: 'Kartoffel-Hähnchen-Blech', cat: 'ofen', meat: 'haehnchen', veg: ['Kartoffeln', 'Paprika'] },
  { base: 'Schweinefilet im Speckmantel', cat: 'ofen', meat: 'schwein', veg: ['Kartoffeln'] },
  // Salate
  { base: 'Tomaten-Mozzarella-Salat', cat: 'salat', meat: 'keins', veg: ['Tomaten', 'Mozzarella', 'Basilikum'] },
  { base: 'Griechischer Salat', cat: 'salat', meat: 'keins', veg: ['Gurke', 'Tomaten', 'Paprika', 'Oliven'] },
  { base: 'Caesar Salad mit Hähnchen', cat: 'salat', meat: 'haehnchen', veg: ['Salat', 'Parmesan', 'Croutons'] },
  { base: 'Rindfleischsalat', cat: 'salat', meat: 'rind', veg: ['Salat', 'Tomaten', 'Gurke'] },
  { base: 'Paprika-Tomaten-Salat', cat: 'salat', meat: 'keins', veg: ['Paprika', 'Tomaten', 'Zwiebel'] },
  { base: 'Hähnchen-Avocado-Salat', cat: 'salat', meat: 'haehnchen', veg: ['Avocado', 'Salat', 'Tomaten'] },
  { base: 'Kartoffelsalat klassisch', cat: 'salat', meat: 'keins', veg: ['Kartoffeln', 'Gurke', 'Zwiebel'] },
  { base: 'Wurstsalat', cat: 'salat', meat: 'schwein', veg: ['Gurke', 'Zwiebel'] },
  { base: 'Salat mit Rinderstreifen', cat: 'salat', meat: 'rind', veg: ['Salat', 'Tomaten', 'Paprika'] },
  { base: 'Sommersalat mit Obst', cat: 'salat', meat: 'keins', veg: ['Salat', 'Apfel', 'Trauben'] },
  // Suppen
  { base: 'Tomatensuppe cremig', cat: 'suppe', meat: 'keins', veg: ['Tomaten', 'Sahne', 'Basilikum'] },
  { base: 'Hähnchensuppe mit Nudeln', cat: 'suppe', meat: 'haehnchen', veg: ['Karotten', 'Sellerie', 'Nudeln'] },
  { base: 'Kartoffelsuppe', cat: 'suppe', meat: 'keins', veg: ['Kartoffeln', 'Zwiebel', 'Sahne'] },
  { base: 'Rinderkraftbrühe mit Einlage', cat: 'suppe', meat: 'rind', veg: ['Karotten', 'Sellerie', 'Nudeln'] },
  { base: 'Gulaschsuppe', cat: 'suppe', meat: 'rind', veg: ['Paprika', 'Tomaten', 'Kartoffeln'] },
  { base: 'Gemüsesuppe mediterran', cat: 'suppe', meat: 'keins', veg: ['Tomaten', 'Zucchini', 'Paprika'] },
  { base: 'Hähnchen-Kartoffel-Suppe', cat: 'suppe', meat: 'haehnchen', veg: ['Kartoffeln', 'Karotten'] },
  { base: 'Linsensuppe (ohne Erbsen)', cat: 'suppe', meat: 'keins', veg: ['Linsen', 'Karotten', 'Tomaten'] },
  { base: 'Schweinefleisch-Suppe', cat: 'suppe', meat: 'schwein', veg: ['Kartoffeln', 'Karotten'] },
  { base: 'Paprika-Tomaten-Suppe', cat: 'suppe', meat: 'keins', veg: ['Paprika', 'Tomaten'] },
  // Frühstück
  { base: 'Rührei mit Paprika', cat: 'fruehstueck', meat: 'keins', veg: ['Eier', 'Paprika', 'Tomaten'] },
  { base: 'Haferflocken mit Apfel', cat: 'fruehstueck', meat: 'keins', veg: ['Haferflocken', 'Apfel', 'Zimt'] },
  { base: 'French Toast', cat: 'fruehstueck', meat: 'keins', veg: ['Brot', 'Eier', 'Zimt'] },
  { base: 'Joghurt mit Beeren', cat: 'fruehstueck', meat: 'keins', veg: ['Joghurt', 'Himbeeren', 'Blaubeeren'] },
  { base: 'Omelett mit Schinken', cat: 'fruehstueck', meat: 'schwein', veg: ['Eier', 'Schinken', 'Paprika'] },
  { base: 'Smoothie Bowl', cat: 'fruehstueck', meat: 'keins', veg: ['Banane', 'Beeren', 'Joghurt'] },
  { base: 'Avocado-Toast', cat: 'fruehstueck', meat: 'keins', veg: ['Avocado', 'Brot', 'Tomaten'] },
  { base: 'Pancakes klassisch', cat: 'fruehstueck', meat: 'keins', veg: ['Mehl', 'Eier', 'Milch'] },
  { base: 'Müsli mit Obst', cat: 'fruehstueck', meat: 'keins', veg: ['Haferflocken', 'Apfel', 'Banane'] },
  { base: 'Rührei mit Speck', cat: 'fruehstueck', meat: 'schwein', veg: ['Eier', 'Speck'] },
];

const variations = [
  'mediterran', 'klassisch', 'cremig', 'würzig', 'leicht', 'herzhaft',
  'mit Kräutern', 'schnell', 'ofenfrisch', 'deftig', 'frisch', 'sommerlich',
  'mit Käse', 'knusprig', 'zart', 'aromatisch', 'gesund', 'rustikal',
  'fein', 'hausgemacht',
];

let id = 21;
for (let i = 0; i < 80; i++) {
  const tpl = templates[i % templates.length];
  const variation = variations[Math.floor(i / templates.length) % variations.length];
  const name = `${tpl.base} ${variation}`;

  const meatAmount = tpl.meat === 'keins' ? 0 : 300 + (i % 3) * 50;
  const ingredients = [];
  if (tpl.meat !== 'keins') {
    const meatNames = { rind: 'Rinderhackfleisch', schwein: 'Schweinefleisch', haehnchen: 'Hähnchenbrust' };
    ingredients.push(ing(meatNames[tpl.meat], meatAmount, 'g', 'fleisch'));
  }
  for (const v of tpl.veg) {
    const catMap = {
      Kartoffeln: 'getreide', Reis: 'getreide', Nudeln: 'getreide', Lasagneplatten: 'getreide',
      Mehl: 'getreide', Brot: 'getreide', Haferflocken: 'getreide', Linsen: 'getreide',
      Tomaten: 'gemuese', Paprika: 'gemuese', Gurke: 'gemuese', Salat: 'gemuese',
      Zucchini: 'gemuese', Karotten: 'gemuese', Zwiebel: 'gemuese', Sellerie: 'gemuese',
      Avocado: 'gemuese', Oliven: 'gemuese', Kirschtomaten: 'gemuese',
      Sahne: 'milchprodukte', Mozzarella: 'milchprodukte', Parmesan: 'milchprodukte',
      Joghurt: 'milchprodukte', Eier: 'milchprodukte', Milch: 'milchprodukte',
      Feta: 'milchprodukte', Butter: 'milchprodukte',
      Apfel: 'obst', Banane: 'obst', Himbeeren: 'obst', Blaubeeren: 'obst',
      Trauben: 'obst', Beeren: 'obst',
      Rosmarin: 'gewuerze', Basilikum: 'gewuerze', Petersilie: 'gewuerze',
      Knoblauch: 'gewuerze', Oregano: 'gewuerze', Zimt: 'gewuerze',
      Schinken: 'fleisch', Speck: 'fleisch', Croutons: 'getreide',
    };
    ingredients.push(ing(v, v.includes('Salat') ? 150 : 2, v.includes('Salat') ? 'g' : 'Stück', catMap[v] || 'sonstiges'));
  }
  ingredients.push(ing('Olivenöl', 2, 'EL', 'sonstiges'));
  ingredients.push(ing('Salz & Pfeffer', 1, 'Prise', 'gewuerze'));

  const prepTime = 10 + (i % 20);
  const cookTime = tpl.cat === 'salat' ? 0 : 15 + (i % 30);
  const cal = 250 + (i % 300);

  recipes.push(recipe(id++, {
    name,
    category: tpl.cat,
    description: `${name} – ein gesundes, hausgemachtes Gericht für zwei Personen.`,
    prepTime,
    cookTime,
    meatType: tpl.meat,
    difficulty: cookTime > 40 ? 'mittel' : 'einfach',
    ingredients,
    steps: [
      'Alle Zutaten vorbereiten und schneiden.',
      tpl.meat !== 'keins' ? 'Fleisch würzen und in der Pfanne/Ofen garen.' : 'Gemüse vorbereiten und würzen.',
      'Weitere Zutaten hinzufügen und nach Rezeptart zubereiten.',
      'Anrichten und sofort servieren.',
    ],
    nutrition: {
      calories: cal,
      protein: 15 + (i % 25),
      carbs: 20 + (i % 40),
      fat: 8 + (i % 18),
      fiber: 2 + (i % 6),
    },
    tags: [tpl.cat, tpl.meat !== 'keins' ? tpl.meat : 'vegetarisch', variation],
  }));
}

const output = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString().split('T')[0],
  recipes,
};

const outPath = join(__dirname, '..', 'src', 'data', 'recipes.json');
writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');
console.log(`✓ ${recipes.length} Rezepte generiert → ${outPath}`);
