import { formatQuantityDisplay } from '@/lib/quantity-presets';

interface QuantityBadgeProps {
  quantity?: string;
  categoryColor?: string;
  onClick?: () => void;
}

export function QuantityBadge({ quantity, categoryColor, onClick }: QuantityBadgeProps) {
  if (!quantity?.trim()) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="rounded-lg border border-dashed border-white/15 px-2.5 py-1 text-[10px] italic text-white/35 hover:border-white/30 hover:text-white/50"
      >
        + Menge
      </button>
    );
  }

  const parsed = formatQuantityDisplay(quantity);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium transition-opacity hover:opacity-80"
      style={{
        backgroundColor: categoryColor ? `${categoryColor}22` : 'rgba(255,255,255,0.08)',
        color: categoryColor ?? 'rgba(255,255,255,0.75)',
        border: `1px solid ${categoryColor ? `${categoryColor}44` : 'rgba(255,255,255,0.12)'}`,
      }}
    >
      {parsed ? (
        <>
          <span className="text-sm font-bold leading-none">{parsed.amount}</span>
          {parsed.unit && (
            <span className="text-[10px] uppercase tracking-wide opacity-80">{parsed.unit}</span>
          )}
        </>
      ) : (
        <span className="text-xs">{quantity}</span>
      )}
    </button>
  );
}
