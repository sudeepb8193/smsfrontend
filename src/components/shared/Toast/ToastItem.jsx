import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const VARIANT_ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

/**
 * Individual Toast notification card styled exclusively with the active SMS
 * primary color palette, centered flex alignment, subtle border & shadow,
 * accessible ARIA live semantics, hover-pause timer progress, and dismiss button.
 */
export function ToastItem({ item, onDismiss, onPause, onResume }) {
  const Icon = VARIANT_ICONS[item.variant] || VARIANT_ICONS.info;
  const isAssertive = item.variant === 'error' || item.variant === 'warning';
  const hasAutoDismiss = Number.isFinite(item.duration) && item.duration > 0;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onDismiss(item.id);
    }
  };

  return (
    <div
      role={isAssertive ? 'alert' : 'status'}
      aria-live={isAssertive ? 'assertive' : 'polite'}
      aria-atomic="true"
      data-testid="sms-toast"
      data-toast-variant={item.variant}
      data-toast-id={item.id}
      onMouseEnter={() => onPause(item.id)}
      onMouseLeave={() => onResume(item.id)}
      onFocusCapture={() => onPause(item.id)}
      onBlurCapture={() => onResume(item.id)}
      onKeyDown={handleKeyDown}
      className={`sms-toast-card pointer-events-auto relative w-full sm:w-auto sm:min-w-[320px] sm:max-w-[440px] overflow-hidden backdrop-blur-xl px-3.5 py-3 text-[var(--text-primary)] select-none ${
        item.exiting ? 'sms-toast-exit' : 'sms-toast-enter'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Primary-colored Variant Icon */}
        <div
          className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center"
          style={{
            backgroundColor: 'var(--primary-light, rgba(249, 115, 22, 0.14))',
            color: 'var(--primary, #F97316)',
            border: '1px solid color-mix(in srgb, var(--primary, #F97316) 24%, transparent)',
          }}
        >
          <Icon size={17} strokeWidth={2.2} aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {item.title && (
            <p className="text-[13px] font-bold leading-snug text-[var(--text-primary)] mb-0.5 break-words">
              {item.title}
            </p>
          )}
          <p
            className={`leading-snug break-words ${
              item.title
                ? 'text-xs font-medium text-[var(--text-secondary)]'
                : 'text-[13px] font-medium text-[var(--text-primary)]'
            }`}
          >
            {item.message}
          </p>

          {item.action?.label && typeof item.action.onClick === 'function' && (
            <button
              type="button"
              onClick={() => {
                item.action.onClick();
                onDismiss(item.id);
              }}
              style={{ color: 'var(--primary, #F97316)' }}
              className="mt-1.5 self-start inline-flex items-center text-xs font-bold hover:underline focus-visible:outline-none focus-visible:ring-2 rounded cursor-pointer"
            >
              {item.action.label}
            </button>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={() => onDismiss(item.id)}
          aria-label="Dismiss notification"
          className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary,#F97316)] hover:bg-[var(--primary-light,rgba(249,115,22,0.12))] transition-colors focus-visible:outline-none focus-visible:ring-2 cursor-pointer"
        >
          <X size={15} strokeWidth={2.2} aria-hidden="true" />
        </button>
      </div>

      {/* Primary-colored Auto-dismiss Progress Indicator */}
      {hasAutoDismiss && (
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-black/[0.04] dark:bg-white/[0.06] overflow-hidden"
        >
          <div
            key={`${item.id}-${item.refreshKey}`}
            className="h-full origin-left sms-toast-progress"
            style={{
              background: 'var(--primary-gradient, var(--primary, #F97316))',
              animationDuration: `${item.duration}ms`,
              animationPlayState: item.paused || item.exiting ? 'paused' : 'running',
            }}
          />
        </div>
      )}
    </div>
  );
}

export default ToastItem;
