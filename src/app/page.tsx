import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const STEPS = [
  {
    title: "Enter the amount",
    body: "Tell us who you're paying and how much. Bluevine Pay works with anyone — no account needed on their side.",
  },
  {
    title: "Pay with your card",
    body: "Fund the transfer with any credit or debit card you already carry. You'll see the total before you confirm.",
  },
  {
    title: "They get a link",
    body: "Your recipient opens a secure redeem link, adds their debit card, and the money lands in their account.",
  },
];

const STATS = [
  { value: "1M+", label: "businesses banking with Bluevine" },
  { value: "$2B+", label: "in deposits held" },
  { value: "A+", label: "BBB rating" },
];

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-navy text-white">
          <div
            aria-hidden="true"
            className="absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-brand-600/45 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-56 -left-40 h-[28rem] w-[28rem] rounded-full bg-mint-400/15 blur-3xl"
          />

          <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
            <div className="bvp-rise">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[12.5px] font-semibold tracking-wide">
                <span className="h-1.5 w-1.5 rounded-full bg-mint-400" />
                New from Bluevine
              </span>

              <h1 className="mt-5 text-[clamp(2.25rem,6vw,3.75rem)] font-extrabold leading-[1.03] tracking-[-0.035em]">
                Send money with
                <br />
                the card in your
                <br />
                <span className="text-brand-300">wallet.</span>
              </h1>

              <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-white/75">
                Pay for a transfer with your card, and we&apos;ll send your
                recipient a link. They add their debit card and the money is
                deposited — usually in minutes.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/send"
                  className="inline-flex items-center rounded-full bg-white px-7 py-3.5 text-[15px] font-bold text-navy transition hover:bg-brand-50"
                >
                  Send money
                </Link>
                <Link
                  href="/r/demo"
                  className="inline-flex items-center rounded-full border border-white/25 px-7 py-3.5 text-[15px] font-bold text-white transition hover:bg-white/10"
                >
                  See a $600 redeem link
                </Link>
              </div>

              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/15 pt-6">
                {STATS.map((stat) => (
                  <div key={stat.label}>
                    <dt className="text-[22px] font-extrabold tracking-[-0.02em]">
                      {stat.value}
                    </dt>
                    <dd className="mt-1 text-[12px] leading-snug text-white/60">
                      {stat.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <HeroReceipt />
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
          <h2 className="max-w-xl text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold leading-tight tracking-[-0.03em] text-navy">
            Three steps, start to deposit
          </h2>
          <p className="mt-3 max-w-lg text-[16px] leading-relaxed text-muted">
            No wires, no routing numbers, no waiting on an app download.
          </p>

          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="rounded-2xl border border-hairline bg-white p-6 shadow-[0_1px_2px_rgba(22,45,90,0.04)]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-[15px] font-extrabold text-brand-600">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-[17px] font-bold tracking-[-0.015em] text-navy">
                  {step.title}
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Closing CTA */}
        <section className="mx-auto max-w-6xl px-5 pb-16 lg:pb-24">
          <div className="flex flex-col items-start gap-6 rounded-3xl bg-brand-600 px-7 py-10 text-white sm:flex-row sm:items-center sm:justify-between sm:px-12">
            <div>
              <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] font-extrabold tracking-[-0.03em]">
                Ready to send your first transfer?
              </h2>
              <p className="mt-2 text-[15px] text-white/80">
                It takes about a minute.
              </p>
            </div>
            <Link
              href="/send"
              className="inline-flex shrink-0 items-center rounded-full bg-white px-7 py-3.5 text-[15px] font-bold text-brand-700 transition hover:bg-brand-50"
            >
              Get started
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

/** The floating receipt card in the hero. */
function HeroReceipt() {
  const rows = [
    ["Transfer amount", "$600.00"],
    ["Bluevine Pay fee", "$0.00"],
    ["Card processing", "$8.70"],
  ];

  return (
    <div className="bvp-rise rounded-3xl bg-white p-6 text-ink shadow-[0_30px_70px_-30px_rgba(13,28,61,0.85)] sm:p-8">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-muted">
          Transfer preview
        </span>
        <span className="rounded-full bg-mint-100 px-2.5 py-1 text-[11px] font-bold text-mint-600">
          Ready to send
        </span>
      </div>

      <p className="mt-5 text-[44px] font-extrabold leading-none tracking-[-0.04em] text-navy tabular-nums">
        $600.00
      </p>
      <p className="mt-2 text-[14px] text-muted">
        To <span className="font-semibold text-navy">Maya Okonkwo</span> ·
        maya@example.com
      </p>

      <dl className="mt-6 space-y-2.5 border-t border-hairline pt-5 text-[14px]">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between">
            <dt className="text-muted">{label}</dt>
            <dd className="font-semibold text-navy tabular-nums">{value}</dd>
          </div>
        ))}
        <div className="flex justify-between border-t border-hairline pt-3 text-[15px]">
          <dt className="font-bold text-navy">Your card is charged</dt>
          <dd className="font-extrabold text-navy tabular-nums">$608.70</dd>
        </div>
      </dl>

      <div className="mt-6 flex items-center gap-3 rounded-xl bg-canvas p-3.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-[13px] font-bold text-white">
          AK
        </span>
        <p className="text-[13px] leading-snug text-muted">
          Sent by <span className="font-semibold text-navy">Abed Kadaan</span> —
          recipient gets a link, no account needed.
        </p>
      </div>
    </div>
  );
}
