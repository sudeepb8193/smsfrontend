/**
 * Subtle, non-interactive decorative background for the Modern Floating Dashboard theme.
 * Mirrors the airy pastel backdrop & faint sweeping line accent from the reference layout,
 * generated dynamically from the active SMS primary color tokens.
 */
export const ModernFloatingBackground = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {/* Faint sweeping curved vector lines behind the floating shell */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.28] dark:opacity-[0.12]"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M-60 660 C 320 620, 960 540, 1520 380"
          stroke="var(--primary, #F97316)"
          strokeOpacity="0.24"
          strokeWidth="2.5"
        />
        <path
          d="M-40 240 C 400 180, 1040 160, 1500 260"
          stroke="var(--primary, #F97316)"
          strokeOpacity="0.12"
          strokeWidth="1.5"
        />
      </svg>

      {/* Soft ambient radial wash */}
      <div
        className="absolute -top-40 -right-36 w-[560px] h-[560px] rounded-full opacity-[0.08] dark:opacity-[0.1] blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(var(--color-primary-500-rgb, 249 115 22) / 0.85) 0%, transparent 70%)',
        }}
      />
    </div>
  );
};

export default ModernFloatingBackground;
