import { Check } from 'lucide-react';

export default function StateCard({
  title,
  description,
  icon: Icon,
  selected = false,
  onClick,
  trailing,
}) {
  const content = (
    <>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
        selected ? 'bg-primary-500/15 text-primary-500 border border-primary-500/30' : 'bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--border-color)]'
      }`}>
        {Icon ? <Icon className="h-5 w-5" /> : <Check className="h-5 w-5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-[var(--text-primary)]">{title}</span>
        {description && <span className="mt-0.5 block text-xs leading-5 text-[var(--text-muted)]">{description}</span>}
      </span>
      {trailing}
      {selected && <Check className="h-4 w-4 shrink-0 text-primary-500" />}
    </>
  );

  const className = `flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
    selected
      ? 'border-primary-500 bg-primary-500/10 shadow-sm text-[var(--text-primary)]'
      : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--border-hover)] text-[var(--text-primary)]'
  }`;

  return onClick ? (
    <button type="button" aria-pressed={selected} onClick={onClick} className={className}>{content}</button>
  ) : (
    <div className={className}>{content}</div>
  );
}
