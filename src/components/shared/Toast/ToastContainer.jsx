import { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ToastItem from './ToastItem';

/**
 * Fixed bottom-center viewport container for SMS Toast notifications.
 * Dynamically centers within the right-hand workspace content area (excluding
 * any visible desktop sidebar) and stacks notifications upward from the bottom.
 */
export function ToastContainer({ toasts, onDismiss, onPause, onResume }) {
  const [bounds, setBounds] = useState({
    left: '50%',
    maxWidth: 'calc(100vw - 2rem)',
  });

  useLayoutEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const computeBounds = () => {
      const contentEl =
        document.querySelector('[data-sms-content-area="true"]') ||
        document.querySelector('main')?.parentElement;

      if (!contentEl) {
        setBounds((prev) =>
          prev.left === '50%' && prev.maxWidth === 'calc(100vw - 2rem)'
            ? prev
            : { left: '50%', maxWidth: 'calc(100vw - 2rem)' },
        );
        return;
      }

      const rect = contentEl.getBoundingClientRect();
      if (rect.width <= 0) return;

      const nextLeft = `${Math.round((rect.left + rect.width / 2) * 100) / 100}px`;
      const nextMaxWidth = `${Math.max(240, Math.round(rect.width - 32))}px`;

      setBounds((prev) =>
        prev.left === nextLeft && prev.maxWidth === nextMaxWidth
          ? prev
          : { left: nextLeft, maxWidth: nextMaxWidth },
      );
    };

    computeBounds();

    const contentEl =
      document.querySelector('[data-sms-content-area="true"]') ||
      document.querySelector('main')?.parentElement;
    const asideEl = document.querySelector('aside');

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(computeBounds)
        : null;

    if (resizeObserver) {
      if (contentEl) resizeObserver.observe(contentEl);
      if (asideEl) resizeObserver.observe(asideEl);
    }

    window.addEventListener('resize', computeBounds);
    window.addEventListener('sms:layout-change', computeBounds);
    asideEl?.addEventListener('transitionend', computeBounds);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', computeBounds);
      window.removeEventListener('sms:layout-change', computeBounds);
      asideEl?.removeEventListener('transitionend', computeBounds);
    };
  }, [toasts.length]);

  if (typeof document === 'undefined') {
    return null;
  }

  const content = (
    <section
      aria-label="Notifications"
      role="region"
      data-testid="sms-toast-container"
      style={{
        left: bounds.left,
        maxWidth: bounds.maxWidth,
      }}
      className="sms-toast-container pointer-events-none flex flex-col items-center gap-2.5 w-[calc(100vw-2rem)] sm:w-auto"
    >
      {toasts.map((item) => (
        <ToastItem
          key={item.id}
          item={item}
          onDismiss={onDismiss}
          onPause={onPause}
          onResume={onResume}
        />
      ))}
    </section>
  );

  return createPortal(content, document.body);
}

export default ToastContainer;
