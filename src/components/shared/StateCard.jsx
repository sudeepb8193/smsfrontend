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
        selected ? 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
      }`}>
        {Icon ? <Icon className="h-5 w-5" /> : <Check className="h-5 w-5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-900 dark:text-white">{title}</span>
        {description && <span className="mt-0.5 block text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</span>}
      </span>
      {trailing}
      {selected && <Check className="h-4 w-4 shrink-0 text-primary-600" />}
    </>
  );

  const className = `flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
    selected
      ? 'border-primary-500 bg-primary-50/70 shadow-sm dark:bg-primary-500/10'
      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
  }`;

  return onClick ? (
    <button type="button" aria-pressed={selected} onClick={onClick} className={className}>{content}</button>
  ) : (
    <div className={className}>{content}</div>
  );
}
