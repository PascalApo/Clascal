interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-5">
      <h2 className="font-display text-xl font-bold accent-gradient-text">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-white/65">{subtitle}</p>}
    </div>
  );
}
