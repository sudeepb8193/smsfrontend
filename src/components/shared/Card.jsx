import React from 'react';

export const Card = ({
  title,
  subtitle,
  action,
  footer,
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-md transition-all duration-200 ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-[var(--border-color)]">
          <div>
            {title && <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}

      <div className="card-content">{children}</div>

      {footer && <div className="mt-4 pt-3 border-t border-[var(--border-color)]">{footer}</div>}
    </div>
  );
};

export default Card;
