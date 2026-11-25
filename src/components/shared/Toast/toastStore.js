/**
 * Centralized Toast Notification Store for Salon Management System (SMS).
 * Framework-agnostic reactive store compatible with React's useSyncExternalStore
 * and direct imperative calls (toast.success, toast.error, toast.warning, toast.info).
 */

const DEFAULT_DURATION_MS = 4000;
const MAX_VISIBLE_TOASTS = 4;
const EXIT_ANIMATION_MS = 200;
const DEDUPE_WINDOW_MS = 600;

let config = {
  defaultDuration: DEFAULT_DURATION_MS,
  maxToasts: MAX_VISIBLE_TOASTS,
  exitDuration: EXIT_ANIMATION_MS,
};

let toasts = [];
const listeners = new Set();
const timers = new Map();
const recentSignatures = new Map();

let idCounter = 0;

function generateToastId() {
  idCounter += 1;
  return `sms-toast-${Date.now()}-${idCounter}`;
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function clearItemTimers(id) {
  const entry = timers.get(id);
  if (!entry) return;
  if (entry.timeoutId) clearTimeout(entry.timeoutId);
  if (entry.exitTimeoutId) clearTimeout(entry.exitTimeoutId);
  timers.delete(id);
}

function removeToastImmediately(id) {
  clearItemTimers(id);
  const next = toasts.filter((t) => t.id !== id);
  if (next.length !== toasts.length) {
    toasts = next;
    emitChange();
  }
}

function scheduleAutoDismiss(id, delay) {
  const existing = timers.get(id) || {};
  if (existing.timeoutId) {
    clearTimeout(existing.timeoutId);
  }

  if (!Number.isFinite(delay) || delay <= 0) {
    timers.set(id, { ...existing, timeoutId: null, startedAt: null });
    return;
  }

  const startedAt = Date.now();
  const timeoutId = setTimeout(() => {
    dismissToast(id);
  }, delay);

  timers.set(id, {
    ...existing,
    timeoutId,
    startedAt,
  });
}

function buildSignature(variant, title, message) {
  return `${variant}::${String(title || '').trim()}::${String(message || '').trim()}`;
}

function pruneRecentSignatures(now) {
  for (const [sig, ts] of recentSignatures.entries()) {
    if (now - ts > DEDUPE_WINDOW_MS) {
      recentSignatures.delete(sig);
    }
  }
}

/**
 * Configure global toast behavior (typically invoked by ToastProvider).
 */
export function configureToastStore(nextConfig = {}) {
  config = {
    ...config,
    ...(typeof nextConfig.defaultDuration === 'number'
      ? { defaultDuration: nextConfig.defaultDuration }
      : {}),
    ...(typeof nextConfig.maxToasts === 'number' && nextConfig.maxToasts > 0
      ? { maxToasts: nextConfig.maxToasts }
      : {}),
    ...(typeof nextConfig.exitDuration === 'number' && nextConfig.exitDuration >= 0
      ? { exitDuration: nextConfig.exitDuration }
      : {}),
  };
}

/**
 * Subscribe to toast store updates (for useSyncExternalStore).
 */
export function subscribeToToasts(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Get current immutable snapshot of active toasts.
 */
export function getToastSnapshot() {
  return toasts;
}

/**
 * Add or deduplicate a toast notification.
 * @param {'success' | 'error' | 'warning' | 'info'} variant
 * @param {string} message
 * @param {Object} [options]
 * @returns {string | null} Toast ID
 */
export function addToast(variant = 'info', message, options = {}) {
  const resolvedVariant = ['success', 'error', 'warning', 'info'].includes(variant)
    ? variant
    : 'info';

  const resolvedTitle = options.title ? String(options.title) : null;
  const resolvedMessage =
    message !== undefined && message !== null
      ? String(message)
      : options.description
      ? String(options.description)
      : '';

  if (!resolvedMessage.trim() && !resolvedTitle) {
    return null;
  }

  const duration =
    options.duration !== undefined ? options.duration : config.defaultDuration;
  const now = Date.now();
  pruneRecentSignatures(now);

  const signature = buildSignature(resolvedVariant, resolvedTitle, resolvedMessage);

  // Deduplicate by explicit ID or matching active/recent notification
  const existingById = options.id
    ? toasts.find((t) => t.id === options.id && !t.exiting)
    : null;
  const existingBySignature = toasts.find(
    (t) => !t.exiting && t.signature === signature,
  );
  const existingToast = existingById || existingBySignature;

  if (existingToast) {
    toasts = toasts.map((t) =>
      t.id === existingToast.id
        ? {
            ...t,
            variant: resolvedVariant,
            title: resolvedTitle,
            message: resolvedMessage,
            duration,
            remaining: duration,
            paused: false,
            refreshKey: t.refreshKey + 1,
            action: options.action || t.action || null,
          }
        : t,
    );
    recentSignatures.set(signature, now);
    scheduleAutoDismiss(existingToast.id, duration);
    emitChange();
    return existingToast.id;
  }

  // Guard against rapid identical triggers right after dismissal (e.g. StrictMode double-effects)
  const recentTs = recentSignatures.get(signature);
  if (recentTs && now - recentTs < DEDUPE_WINDOW_MS) {
    return null;
  }
  recentSignatures.set(signature, now);

  // Enforce max visible active toasts by exiting the oldest active toast(s)
  const activeToasts = toasts.filter((t) => !t.exiting);
  if (activeToasts.length >= config.maxToasts) {
    const overflowCount = activeToasts.length - config.maxToasts + 1;
    for (let i = 0; i < overflowCount; i += 1) {
      dismissToast(activeToasts[i].id);
    }
  }

  const id = options.id ? String(options.id) : generateToastId();
  const newToast = {
    id,
    variant: resolvedVariant,
    title: resolvedTitle,
    message: resolvedMessage,
    duration,
    remaining: duration,
    paused: false,
    exiting: false,
    createdAt: now,
    refreshKey: 0,
    signature,
    action: options.action || null,
  };

  toasts = [...toasts, newToast];
  scheduleAutoDismiss(id, duration);
  emitChange();
  return id;
}

/**
 * Trigger smooth exit animation and remove a toast (or all toasts when id is omitted).
 */
export function dismissToast(id) {
  if (!id) {
    clearToasts();
    return;
  }

  const target = toasts.find((t) => t.id === id);
  if (!target || target.exiting) return;

  const existing = timers.get(id) || {};
  if (existing.timeoutId) {
    clearTimeout(existing.timeoutId);
  }

  if (config.exitDuration <= 0) {
    removeToastImmediately(id);
    return;
  }

  toasts = toasts.map((t) =>
    t.id === id ? { ...t, exiting: true, paused: true } : t,
  );

  const exitTimeoutId = setTimeout(() => {
    removeToastImmediately(id);
  }, config.exitDuration);

  timers.set(id, {
    ...existing,
    timeoutId: null,
    exitTimeoutId,
  });

  emitChange();
}

/**
 * Dismiss all active toasts gracefully.
 */
export function clearToasts() {
  if (toasts.length === 0) return;

  if (config.exitDuration <= 0) {
    for (const t of toasts) {
      clearItemTimers(t.id);
    }
    toasts = [];
    emitChange();
    return;
  }

  const activeIds = toasts.filter((t) => !t.exiting).map((t) => t.id);
  for (const id of activeIds) {
    dismissToast(id);
  }
}

/**
 * Pause auto-dismiss timer while user hovers or focuses a toast.
 */
export function pauseToast(id) {
  const target = toasts.find((t) => t.id === id);
  if (!target || target.exiting || target.paused) return;
  if (!Number.isFinite(target.duration) || target.duration <= 0) return;

  const entry = timers.get(id);
  const elapsed = entry?.startedAt ? Date.now() - entry.startedAt : 0;
  const remaining = Math.max(250, target.remaining - elapsed);

  if (entry?.timeoutId) {
    clearTimeout(entry.timeoutId);
  }
  timers.set(id, { ...entry, timeoutId: null, startedAt: null });

  toasts = toasts.map((t) =>
    t.id === id ? { ...t, paused: true, remaining } : t,
  );
  emitChange();
}

/**
 * Resume auto-dismiss timer after hover or focus ends.
 */
export function resumeToast(id) {
  const target = toasts.find((t) => t.id === id);
  if (!target || target.exiting || !target.paused) return;
  if (!Number.isFinite(target.duration) || target.duration <= 0) return;

  toasts = toasts.map((t) => (t.id === id ? { ...t, paused: false } : t));
  scheduleAutoDismiss(id, target.remaining);
  emitChange();
}

/**
 * Reset store completely (primarily for automated tests).
 */
export function resetToastStore() {
  for (const t of toasts) {
    clearItemTimers(t.id);
  }
  for (const id of timers.keys()) {
    clearItemTimers(id);
  }
  toasts = [];
  recentSignatures.clear();
  idCounter = 0;
  config = {
    defaultDuration: DEFAULT_DURATION_MS,
    maxToasts: MAX_VISIBLE_TOASTS,
    exitDuration: EXIT_ANIMATION_MS,
  };
  emitChange();
}

/**
 * Imperative toast API compatible across hooks, services, and components.
 */
export const toast = Object.assign(
  (message, options) => addToast('info', message, options),
  {
    success: (message, options) => addToast('success', message, options),
    error: (message, options) => addToast('error', message, options),
    warning: (message, options) => addToast('warning', message, options),
    info: (message, options) => addToast('info', message, options),
    dismiss: (id) => dismissToast(id),
    clear: () => clearToasts(),
  },
);
