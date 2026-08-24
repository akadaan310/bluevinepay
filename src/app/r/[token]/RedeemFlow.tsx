"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import CardFields, {
  emptyCard,
  toCardDetails,
  validateCard,
  type CardFormState,
} from "@/components/CardFields";
import CardPreview from "@/components/CardPreview";
import { Field } from "@/components/Field";
import { formatMoney, last4 } from "@/lib/card";
import type { Transfer } from "@/lib/types";

export default function RedeemFlow({ transfer }: { transfer: Transfer }) {
  const [card, setCard] = useState<CardFormState>(emptyCard);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [errors, setErrors] = useState<
    Partial<Record<keyof CardFormState, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [claimed, setClaimed] = useState(transfer.status === "claimed");

  const initials = transfer.senderName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    const cardErrors = validateCard(card);
    const badEmail = !/^\S+@\S+\.\S+$/.test(email.trim())
      ? "Enter an email so we can send your deposit receipt."
      : "";

    setErrors(cardErrors);
    setEmailError(badEmail);
    if (Object.keys(cardErrors).length > 0 || badEmail) return;

    setSubmitting(true);
    setServerError("");
    try {
      const response = await fetch(`/api/transfers/${transfer.token}/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card: toCardDetails(card),
          recipientEmail: email.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Something went wrong.");
      setClaimed(true);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (claimed) {
    return (
      <Deposited transfer={transfer} cardLast4={last4(card.cardNumber)} />
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start">
      {/* The "Abed Kadaan sent you $600" panel */}
      <aside className="bvp-rise relative overflow-hidden rounded-2xl bg-navy p-7 text-white lg:sticky lg:top-24">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-600/50 blur-3xl"
        />
        <div className="relative">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-[16px] font-extrabold">
            {initials}
          </span>

          <p className="mt-5 text-[15px] font-semibold text-white/70">
            {transfer.senderName} sent you
          </p>
          <p className="mt-1 text-[46px] font-extrabold leading-none tracking-[-0.04em] tabular-nums">
            {formatMoney(transfer.amountCents)}
          </p>

          {transfer.note ? (
            <p className="mt-5 rounded-xl bg-white/10 px-4 py-3 text-[14px] leading-relaxed text-white/85">
              “{transfer.note}”
            </p>
          ) : null}

          <ul className="mt-6 space-y-2.5 border-t border-white/15 pt-5 text-[13.5px] text-white/70">
            {[
              "No account or app download needed",
              "Deposited straight to your debit card",
              "Typically arrives within minutes",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-0.5 text-mint-400">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Debit card capture */}
      <section className="rounded-2xl border border-hairline bg-white p-6 shadow-[0_1px_2px_rgba(22,45,90,0.04)] sm:p-8">
        <h1 className="text-[24px] font-extrabold tracking-[-0.03em] text-navy">
          Where should we deposit it?
        </h1>
        <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">
          Enter the debit card tied to the account you want the{" "}
          {formatMoney(transfer.amountCents)} in. We&apos;ll push the funds
          straight to it.
        </p>

        <form onSubmit={submit} noValidate className="mt-6">
          <div className="mb-6 sm:max-w-xs">
            <CardPreview card={card} />
          </div>

          <CardFields
            value={card}
            onChange={setCard}
            errors={errors}
            cardKind="debit"
          />

          <div className="mt-4">
            <Field
              label="Your email"
              name="recipientEmail"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              error={emailError}
              hint="We'll send your deposit receipt here."
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <p className="mt-5 flex items-start gap-2.5 rounded-xl bg-canvas px-4 py-3 text-[12.5px] leading-relaxed text-muted">
            <span aria-hidden="true">🔒</span>
            Deposits only work with debit cards — credit and prepaid cards
            can&apos;t receive a push payment.
          </p>

          {serverError ? (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-[13.5px] font-medium text-red-700"
            >
              {serverError}
            </p>
          ) : null}

          <Button type="submit" loading={submitting} className="mt-6 w-full">
            {submitting
              ? "Depositing…"
              : `Deposit ${formatMoney(transfer.amountCents)}`}
          </Button>

          <p className="mt-3 text-center text-[12px] text-muted">
            Demo only — no card is charged and no money moves.
          </p>
        </form>
      </section>
    </div>
  );
}

function Deposited({
  transfer,
  cardLast4,
}: {
  transfer: Transfer;
  cardLast4: string;
}) {
  return (
    <div className="bvp-rise mx-auto w-full max-w-xl rounded-2xl border border-hairline bg-white p-7 text-center shadow-[0_1px_2px_rgba(22,45,90,0.04)] sm:p-10">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mint-100 text-[26px] text-mint-600">
        ✓
      </span>

      <h1 className="mt-5 text-[26px] font-extrabold tracking-[-0.03em] text-navy">
        {formatMoney(transfer.amountCents)} deposited
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        {transfer.senderName}&apos;s transfer is on its way to your{" "}
        {cardLast4 ? `card ending ${cardLast4}` : "debit card"}. Most deposits
        land within minutes.
      </p>

      <dl className="mt-6 divide-y divide-hairline overflow-hidden rounded-xl border border-hairline text-left">
        {[
          ["From", transfer.senderName],
          ["Amount", formatMoney(transfer.amountCents)],
          ["Deposit fee", "$0.00"],
          ["Status", "Sent to your bank"],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between px-4 py-3.5">
            <dt className="text-[13.5px] text-muted">{label}</dt>
            <dd className="text-[14px] font-semibold text-navy">{value}</dd>
          </div>
        ))}
      </dl>

      <Link
        href="/"
        className="mt-7 inline-flex h-12 items-center rounded-full bg-brand-600 px-6 text-[15px] font-bold text-white transition hover:bg-brand-700"
      >
        Explore Bluevine Pay
      </Link>
    </div>
  );
}
