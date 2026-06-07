export type QuantityUnitType = 'stueck' | 'gramm' | 'ml' | 'liter' | 'packung';

export interface QuantityGroup {
  label: string;
  unitType: QuantityUnitType;
  options: string[];
}

export const QUANTITY_PRESETS: QuantityGroup[] = [
  {
    label: 'Stück',
    unitType: 'stueck',
    options: ['1 Stück', '2 Stück', '3 Stück', '4 Stück', '5 Stück', '6 Stück', '10 Stück', '12 Stück'],
  },
  {
    label: 'Gramm',
    unitType: 'gramm',
    options: ['50 g', '100 g', '125 g', '150 g', '200 g', '250 g', '300 g', '400 g', '500 g', '750 g', '800 g', '1000 g'],
  },
  {
    label: 'Milliliter',
    unitType: 'ml',
    options: ['100 ml', '200 ml', '250 ml', '300 ml', '400 ml', '500 ml', '750 ml', '1000 ml'],
  },
  {
    label: 'Liter',
    unitType: 'liter',
    options: ['0,5 Liter', '0,75 Liter', '1 Liter', '1,5 Liter', '2 Liter', '3 Liter'],
  },
  {
    label: 'Packung & Sonstiges',
    unitType: 'packung',
    options: [
      '1 Packung',
      '2 Packungen',
      '1 Bund',
      '1 Dose',
      '2 Dosen',
      '1 Glas',
      '1 Becher',
      '2 Becher',
      '4 Becher',
      '1 Tube',
      '1 Rolle',
      '1 Tüte',
    ],
  },
];

export const DEFAULT_QUANTITY_BY_UNIT: Record<QuantityUnitType, string> = {
  stueck: '1 Stück',
  gramm: '500 g',
  ml: '250 ml',
  liter: '1 Liter',
  packung: '1 Packung',
};

const UNIT_LABELS: Record<QuantityUnitType, string> = {
  stueck: 'Stück',
  gramm: 'Gramm',
  ml: 'Milliliter',
  liter: 'Liter',
  packung: 'Packung',
};

export function getPresetsForUnit(unitType: QuantityUnitType): QuantityGroup[] {
  return QUANTITY_PRESETS.filter((g) => g.unitType === unitType);
}

export function getOptionsForUnit(unitType: QuantityUnitType): string[] {
  return getPresetsForUnit(unitType).flatMap((g) => g.options);
}

export function getUnitLabel(unitType: QuantityUnitType): string {
  return UNIT_LABELS[unitType];
}

export const ALL_QUANTITY_OPTIONS = QUANTITY_PRESETS.flatMap((g) => g.options);

export const EMPTY_QUANTITY = '';

export function formatQuantityDisplay(quantity?: string): { amount: string; unit: string } | null {
  if (!quantity?.trim()) return null;
  const match = quantity.trim().match(/^([\d.,]+)\s*(.*)$/);
  if (!match) return { amount: quantity, unit: '' };
  return { amount: match[1], unit: match[2] || '' };
}
