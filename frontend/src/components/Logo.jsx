/** Simple mark: a surveyed plot divided into fields. Decorative only. */
export default function Logo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <rect x="2" y="2" width="36" height="36" rx="8" fill="var(--color-primary)" />
      <path
        d="M9 11 L31 9 L30 31 L10 30 Z"
        fill="none"
        stroke="var(--color-paper)"
        strokeWidth="2"
      />
      <path
        d="M20 10 L20 30.5 M9.6 20.5 L30.5 19.5"
        stroke="var(--color-accent-light)"
        strokeWidth="2"
      />
      <circle cx="20" cy="20" r="2.4" fill="var(--color-accent-light)" />
    </svg>
  );
}
