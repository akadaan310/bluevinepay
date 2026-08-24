"use client";

import { useMemo, useState } from "react";
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
import Stepper from "@/components/Stepper";
import { digitsOnly, formatMoney, last4 } from "@/lib/card";
import { cardFeeCents, totalChargeCents } from "@/lib/fees";
import type { Transfer } from "@/lib/types";

const STEPS = ["Details", "Payment", "Review"];

const PRESETS = [2500, 10000, 60000];

type Details = {
  senderName: string;
  senderEmail: string;
  recipientName: string;
  recipientContact: string;
  amount: string;
  note: string;
};

const emptyDetails: Details = {
  senderName: "",
  senderEmail: "",
  recipientName: "",
  recipientContact: "",
  amount: "",
  note: "",
};

function parseAmountCents(amount: string) {
  const n = Number(amount.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

export default function SendFlow() {
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState<Details>(emptyDetails);
  const [card, setCard] = useState<CardFormState>(emptyCard);
  const [detailErrors, setDetailErrors] = useState<
    Partial<Record<keyof Details, string>>
  >({});
  const [cardErrors, setCardErrors] = useState<
    Partial<Record<keyof CardFormState, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [transfer, setTransfer] = useState<Transfer | null>(null);

  const amountCents = useMemo(
    () => parseAmountCents(details.amount),
    [details.amount],
  );
  const fee = cardFeeCents(amountCents);
  const total = totalChargeCents(amountCents);

  if (transfer) {
    return <SentConfirmation transfer={transfer} cardLast4={last4(card.cardNumber)} />;
  }

  function validateDetails() {
    const errors: Partial<Record<keyof Details, string>> = {};
    if (details.senderName.trim().length < 2) {
      errors.senderName = "Tell us who the money is from.";
    }
    if (!/^\S+@\S+\.\S+$/.test(details.senderEmail.trim())) {
      errors.senderEmail = "Enter a valid email for your receipt.";
    }
    if (details.recipientName.trim().length < 2) {
      errors.recipientName = "Who are you sending to?";
    }
    const contact = details.recipientContact.trim();
    const isEmail = /^\S+@\S+\.\S+$/.test(contact);
    const isPhone = digitsOnly(contact).length >= 10;
    if (!isEmail && !isPhone) {
      errors.recipientContact = "Enter their email or mobile number.";
    }
    if (amountCents < 100) errors.amount = "Minimum transfer is $1.00.";
    else if (amountCents > 1000000) errors.amount = "Maximum transfer is $10,000.";
    setDetailErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function goToPayment() {
    if (validateDetails()) setStep(1);
  }

  function goToReview() {
    const errors = validateCard(card);
    setCardErrors(errors);
    if (Object.keys(errors).length === 0) setStep(2);
  }

  async function submit() {
    setSubmitting(true);
    setServerError("");
    try {
      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: details.senderName.trim(),
          senderEmail: details.senderEmail.trim(),
          recipientName: details.recipientName.trim(),
          recipientContact: details.recipientContact.trim(),
          amountCents,
          note: details.note.trim(),
          card: toCardDetails(card),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Something went wrong.");
      setTransfer(data.transfer as Transfer);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mx-auto max-w-2xl">
        <Stepper steps={STEPS} current={step} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <section className="rounded-2xl border border-hairline bg-white p-6 shadow-[0_1px_2px_rgba(22,45,90,0.04)] sm:p-8">
          {step === 0 ? (
            <DetailsStep
              details={details}
              errors={detailErrors}
              amountCents={amountCents}
              onChange={setDetails}
              onNext={goToPayment}
            />
          ) : step === 1 ? (
            <PaymentStep
              card={card}
              errors={cardErrors}
              total={total}
              onChange={setCard}
              onBack={() => setStep(0)}
              onNext={goToReview}
            />
          ) : (
            <ReviewStep
              details={details}
              card={card}
              amountCents={amountCents}
              fee={fee}
              total={total}
              submitting={submitting}
              error={serverError}
              onBack={() => setStep(1)}
              onSubmit={submit}
            />
          )}
        </section>

        <Summary
          amountCents={amountCents}
          fee={fee}
          total={total}
          recipientName={details.recipientName}
          presets={step === 0 ? PRESETS : undefined}
          onPreset={(cents) =>
            setDetails((d) => ({ ...d, amount: (cents / 100).toFixed(2) }))
          }
        />
      </div>
    </div>
  );
}

function StepHeading({ title, body }: { title: string; body: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-[24px] font-extrabold tracking-[-0.03em] text-navy">
        {title}
      </h1>
      <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function DetailsStep({
  details,
  errors,
  amountCents,
  onChange,
  onNext,
}: {
  details: Details;
  errors: Partial<Record<keyof Details, string>>;
  amountCents: number;
  onChange: (next: Details) => void;
  onNext: () => void;
}) {
  const set = (patch: Partial<Details>) => onChange({ ...details, ...patch });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
      noValidate
    >
      <StepHeading
        title="Who are you paying?"
        body="Your recipient doesn't need a Bluevine account — they'll get a link to claim it."
      />

      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Your name"
            name="senderName"
            autoComplete="name"
            placeholder="Abed Kadaan"
            value={details.senderName}
            error={errors.senderName}
            onChange={(e) => set({ senderName: e.target.value })}
          />
          <Field
            label="Your email"
            name="senderEmail"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={details.senderEmail}
            error={errors.senderEmail}
            hint="For your receipt."
            onChange={(e) => set({ senderEmail: e.target.value })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Recipient name"
            name="recipientName"
            placeholder="Maya Okonkwo"
            value={details.recipientName}
            error={errors.recipientName}
            onChange={(e) => set({ recipientName: e.target.value })}
          />
          <Field
            label="Recipient email or mobile"
            name="recipientContact"
            placeholder="maya@example.com"
            value={details.recipientContact}
            error={errors.recipientContact}
            hint="Where we send the redeem link."
            onChange={(e) => set({ recipientContact: e.target.value })}
          />
        </div>

        <label className="block" htmlFor="amount">
          <span className="mb-1.5 block text-[13px] font-semibold text-navy">
            Amount
          </span>
          <span className="relative block">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[26px] font-extrabold text-navy/35">
              $
            </span>
            <input
              id="amount"
              name="amount"
              inputMode="decimal"
              placeholder="0.00"
              value={details.amount}
              aria-invalid={errors.amount ? true : undefined}
              onChange={(e) =>
                set({ amount: e.target.value.replace(/[^0-9.]/g, "") })
              }
              className={`h-16 w-full rounded-xl border bg-white pl-10 pr-4 text-[26px] font-extrabold tabular-nums text-navy outline-none transition
                placeholder:text-navy/25
                focus:border-brand-600 focus:ring-4 focus:ring-brand-600/12
                ${errors.amount ? "border-red-400" : "border-hairline"}`}
            />
          </span>
          {errors.amount ? (
            <span className="mt-1.5 block text-[12.5px] font-medium text-red-600">
              {errors.amount}
            </span>
          ) : (
            <span className="mt-1.5 block text-[12.5px] text-muted">
              {amountCents > 0
                ? `Sending ${formatMoney(amountCents)}`
                : "Between $1.00 and $10,000.00"}
            </span>
          )}
        </label>

        <Field
          label="Note (optional)"
          name="note"
          maxLength={140}
          placeholder="Thanks for dinner!"
          value={details.note}
          onChange={(e) => set({ note: e.target.value })}
        />
      </div>

      <div className="mt-7 flex justify-end">
        <Button type="submit">Continue to payment</Button>
      </div>
    </form>
  );
}

function PaymentStep({
  card,
  errors,
  total,
  onChange,
  onBack,
  onNext,
}: {
  card: CardFormState;
  errors: Partial<Record<keyof CardFormState, string>>;
  total: number;
  onChange: (next: CardFormState) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
      noValidate
    >
      <StepHeading
        title="Pay with your card"
        body={`We'll authorize ${formatMoney(total)} on the card below to fund this transfer.`}
      />

      <div className="mb-6 sm:max-w-xs">
        <CardPreview card={card} />
      </div>

      <CardFields value={card} onChange={onChange} errors={errors} />

      <div className="mt-7 flex flex-wrap justify-between gap-3">
        <Button type="button" variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Review transfer</Button>
      </div>
    </form>
  );
}

function ReviewStep({
  details,
  card,
  amountCents,
  fee,
  total,
  submitting,
  error,
  onBack,
  onSubmit,
}: {
  details: Details;
  card: CardFormState;
  amountCents: number;
  fee: number;
  total: number;
  submitting: boolean;
  error: string;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const rows: [string, string][] = [
    ["To", `${details.recipientName} · ${details.recipientContact}`],
    ["From", `${details.senderName} · ${details.senderEmail}`],
    ["Paying with", `Card ending ${last4(card.cardNumber)} · exp ${card.expiry}`],
    ["Transfer amount", formatMoney(amountCents)],
    ["Card processing", formatMoney(fee)],
  ];

  return (
    <div>
      <StepHeading
        title="Review and send"
        body="Check the details — your recipient gets their link right after you confirm."
      />

      <dl className="divide-y divide-hairline overflow-hidden rounded-xl border border-hairline">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3.5"
          >
            <dt className="text-[13.5px] font-medium text-muted">{label}</dt>
            <dd className="text-right text-[14px] font-semibold text-navy">
              {value}
            </dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between bg-canvas px-4 py-4">
          <dt className="text-[14.5px] font-bold text-navy">
            Total charged to your card
          </dt>
          <dd className="text-[18px] font-extrabold tabular-nums text-navy">
            {formatMoney(total)}
          </dd>
        </div>
      </dl>

      {details.note ? (
        <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-[13.5px] leading-relaxed text-brand-900">
          <span className="font-semibold">Your note:</span> {details.note}
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-[13.5px] font-medium text-red-700"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-7 flex flex-wrap justify-between gap-3">
        <Button type="button" variant="secondary" onClick={onBack} disabled={submitting}>
          Back
        </Button>
        <Button type="button" loading={submitting} onClick={onSubmit}>
          {submitting ? "Sending…" : `Send ${formatMoney(amountCents)}`}
        </Button>
      </div>

      <p className="mt-4 text-center text-[12px] text-muted">
        Demo only — no card is charged and no money moves.
      </p>
    </div>
  );
}

function Summary({
  amountCents,
  fee,
  total,
  recipientName,
  presets,
  onPreset,
}: {
  amountCents: number;
  fee: number;
  total: number;
  recipientName: string;
  presets?: number[];
  onPreset: (cents: number) => void;
}) {
  return (
    <aside className="rounded-2xl border border-hairline bg-white p-6 lg:sticky lg:top-24">
      <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-muted">
        Transfer summary
      </h2>

      <p className="mt-4 text-[34px] font-extrabold leading-none tracking-[-0.035em] text-navy tabular-nums">
        {formatMoney(amountCents)}
      </p>
      <p className="mt-1.5 text-[13.5px] text-muted">
        {recipientName ? `to ${recipientName}` : "to your recipient"}
      </p>

      {presets ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {presets.map((cents) => (
            <button
              key={cents}
              type="button"
              onClick={() => onPreset(cents)}
              className="rounded-full border border-hairline px-3 py-1.5 text-[13px] font-semibold text-navy transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              {formatMoney(cents)}
            </button>
          ))}
        </div>
      ) : null}

      <dl className="mt-5 space-y-2.5 border-t border-hairline pt-5 text-[13.5px]">
        <div className="flex justify-between">
          <dt className="text-muted">Bluevine Pay fee</dt>
          <dd className="font-semibold text-mint-600">$0.00</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Card processing</dt>
          <dd className="font-semibold text-navy tabular-nums">
            {formatMoney(fee)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-hairline pt-3">
          <dt className="font-bold text-navy">Total</dt>
          <dd className="font-extrabold text-navy tabular-nums">
            {formatMoney(total)}
          </dd>
        </div>
      </dl>
    </aside>
  );
}

function SentConfirmation({
  transfer,
  cardLast4,
}: {
  transfer: Transfer;
  cardLast4: string;
}) {
  const link = `/r/${transfer.token}`;

  return (
    <div className="bvp-rise mx-auto w-full max-w-xl rounded-2xl border border-hairline bg-white p-7 text-center shadow-[0_1px_2px_rgba(22,45,90,0.04)] sm:p-10">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mint-100 text-[26px] text-mint-600">
        ✓
      </span>

      <h1 className="mt-5 text-[26px] font-extrabold tracking-[-0.03em] text-navy">
        {formatMoney(transfer.amountCents)} is on its way
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        We charged the card ending {cardLast4} and sent{" "}
        <span className="font-semibold text-navy">{transfer.recipientName}</span>{" "}
        a redeem link at {transfer.recipientContact}.
      </p>

      <div className="mt-6 rounded-xl border border-dashed border-brand-200 bg-brand-50 p-4 text-left">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-brand-700">
          Their redeem link
        </p>
        <p className="mt-1.5 break-all font-mono text-[13.5px] text-brand-900">
          {link}
        </p>
      </div>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          href={link}
          className="inline-flex h-12 items-center rounded-full bg-brand-600 px-6 text-[15px] font-bold text-white transition hover:bg-brand-700"
        >
          Open the redeem page
        </Link>
        <Link
          href="/"
          className="inline-flex h-12 items-center rounded-full border border-hairline px-6 text-[15px] font-bold text-navy transition hover:border-brand-300"
        >
          Done
        </Link>
      </div>
    </div>
  );
}
