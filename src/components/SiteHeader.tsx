import Link from "next/link";
import BluevineLogo from "./BluevineLogo";

export default function SiteHeader({ minimal = false }: { minimal?: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-hairline/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="Bluevine Pay home">
          <BluevineLogo />
        </Link>

        {minimal ? (
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-muted">
            <LockIcon />
            Secured by Bluevine
          </span>
        ) : (
          <nav className="flex items-center gap-1.5">
            <Link
              href="/#how-it-works"
              className="hidden rounded-full px-4 py-2 text-[14px] font-semibold text-navy transition hover:bg-brand-50 sm:inline-flex"
            >
              How it works
            </Link>
            <Link
              href="/r/demo"
              className="hidden rounded-full px-4 py-2 text-[14px] font-semibold text-navy transition hover:bg-brand-50 sm:inline-flex"
            >
              Demo redeem link
            </Link>
            <Link
              href="/send"
              className="inline-flex h-10 items-center rounded-full bg-brand-600 px-5 text-[14px] font-bold text-white transition hover:bg-brand-700"
            >
              Send money
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
      <rect
        x="3"
        y="7"
        width="10"
        height="7"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
