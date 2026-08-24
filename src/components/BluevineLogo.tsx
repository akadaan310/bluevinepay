type Props = {
  /** Renders the wordmark in white for use on the navy surfaces. */
  inverted?: boolean;
  className?: string;
};

/**
 * Bluevine Pay lockup: a vine-leaf mark plus the wordmark and a "Pay"
 * product tag, drawn in the brand blue.
 */
export default function BluevineLogo({ inverted = false, className }: Props) {
  const wordmark = inverted ? "text-white" : "text-navy";
  const tag = inverted
    ? "border-white/30 text-white/80"
    : "border-brand-200 text-brand-600";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="h-8 w-8 shrink-0"
        fill="none"
      >
        <rect width="32" height="32" rx="9" fill="var(--color-brand-600)" />
        <path
          d="M22.5 8.4c-6.3-.5-10.9 2-11.9 6.4-.5 2.2.2 4.3 1.7 5.7l-2 3.1a.9.9 0 1 0 1.5 1l2-3.1c2 .7 4.2.4 6-1 3.5-2.7 4.2-7.8 2.7-12.1Z"
          fill="#fff"
          fillOpacity="0.95"
        />
        <path
          d="M13.6 21.2c1.2-4.2 4-7.4 8-9.4"
          stroke="var(--color-brand-600)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="flex items-baseline gap-1.5">
        <span
          className={`text-[19px] font-extrabold tracking-[-0.03em] ${wordmark}`}
        >
          bluevine
        </span>
        <span
          className={`rounded-full border px-1.5 py-px text-[10px] font-bold uppercase tracking-[0.12em] ${tag}`}
        >
          Pay
        </span>
      </span>
    </span>
  );
}
