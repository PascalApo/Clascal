import {
  QUANTITY_PRESETS,
  EMPTY_QUANTITY,
  getPresetsForUnit,
  getUnitLabel,
  type QuantityUnitType,
} from '@/lib/quantity-presets';

interface QuantitySelectProps {
  value: string;
  onChange: (value: string) => void;
  unitType?: QuantityUnitType;
  className?: string;
  compact?: boolean;
}

export function QuantitySelect({
  value,
  onChange,
  unitType,
  className = '',
  compact = false,
}: QuantitySelectProps) {
  const groups = unitType ? getPresetsForUnit(unitType) : QUANTITY_PRESETS;
  const placeholder = unitType
    ? `${getUnitLabel(unitType)} wählen…`
    : 'Menge wählen…';

  return (
    <select
      value={value || EMPTY_QUANTITY}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-xl bg-dark-200 outline-none ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-2.5 text-sm'} ${className}`}
    >
      <option value="">{placeholder}</option>
      {groups.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
