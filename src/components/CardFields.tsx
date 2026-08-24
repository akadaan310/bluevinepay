"use client";

import { Field } from "./Field";
import {
  BRAND_LABEL,
  cvcLength,
  detectBrand,
  digitsOnly,
  expiryInFuture,
  formatCardNumber,
  formatExpiry,
  luhnValid,
} from "@/lib/card";
import type { CardDetails } from "@/lib/types";

export type CardFormState = {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  billingZip: string;
};

export const emptyCard: CardFormState = {
  cardholderName: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
  billingZip: "",
};

export function validateCard(state: CardFormState) {
  const errors: Partial<Record<keyof CardFormState, string>> = {};
  const brand = detectBrand(state.cardNumber);

  if (state.cardholderName.trim().length < 2) {
    errors.cardholderName = "Enter the name printed on the card.";
  }

  const number = digitsOnly(state.cardNumber);
  if (!number) errors.cardNumber = "Enter your card number.";
  else if (!luhnValid(number)) errors.cardNumber = "That card number isn't valid.";

  const [month = "", year = ""] = state.expiry.split("/");
  if (month.length !== 2 || year.length !== 2) {
    errors.expiry = "Use MM/YY.";
  } else if (!expiryInFuture(month, year)) {
    errors.expiry = "That card has expired.";
  }

  if (state.cvc.length !== cvcLength(brand)) {
    errors.cvc = `${cvcLength(brand)} digits.`;
  }

  if (digitsOnly(state.billingZip).length < 5) {
    errors.billingZip = "Enter a 5-digit ZIP.";
  }

  return errors;
}

export function toCardDetails(state: CardFormState): CardDetails {
  const [month = "", year = ""] = state.expiry.split("/");
  return {
    cardholderName: state.cardholderName.trim(),
    cardNumber: state.cardNumber,
    expMonth: month,
    expYear: year,
    cvc: state.cvc,
    billingZip: state.billingZip,
    brand: detectBrand(state.cardNumber),
  };
}

type Props = {
  value: CardFormState;
  onChange: (next: CardFormState) => void;
  errors: Partial<Record<keyof CardFormState, string>>;
  /** "credit" on the send side, "debit" on the receive side. */
  cardKind?: string;
};

export default function CardFields({
  value,
  onChange,
  errors,
  cardKind = "card",
}: Props) {
  const brand = detectBrand(value.cardNumber);
  const set = (patch: Partial<CardFormState>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="grid gap-4">
      <Field
        label="Name on card"
        name="cardholderName"
        autoComplete="cc-name"
        placeholder="Jordan Ellis"
        value={value.cardholderName}
        error={errors.cardholderName}
        onChange={(e) => set({ cardholderName: e.target.value })}
      />

      <Field
        label={cardKind === "debit" ? "Debit card number" : "Card number"}
        name="cardNumber"
        inputMode="numeric"
        autoComplete="cc-number"
        placeholder="4242 4242 4242 4242"
        value={value.cardNumber}
        error={errors.cardNumber}
        onChange={(e) => set({ cardNumber: formatCardNumber(e.target.value) })}
        adornment={
          digitsOnly(value.cardNumber).length >= 2 ? (
            <span className="rounded-md bg-brand-50 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-700">
              {BRAND_LABEL[brand]}
            </span>
          ) : null
        }
      />

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Expires"
          name="expiry"
          inputMode="numeric"
          autoComplete="cc-exp"
          placeholder="MM/YY"
          value={value.expiry}
          error={errors.expiry}
          onChange={(e) => set({ expiry: formatExpiry(e.target.value) })}
        />
        <Field
          label={brand === "amex" ? "CID" : "CVC"}
          name="cvc"
          inputMode="numeric"
          autoComplete="cc-csc"
          placeholder={brand === "amex" ? "1234" : "123"}
          value={value.cvc}
          error={errors.cvc}
          onChange={(e) =>
            set({ cvc: digitsOnly(e.target.value).slice(0, cvcLength(brand)) })
          }
        />
      </div>

      <Field
        label="Billing ZIP code"
        name="billingZip"
        inputMode="numeric"
        autoComplete="postal-code"
        placeholder="94105"
        value={value.billingZip}
        error={errors.billingZip}
        onChange={(e) =>
          set({ billingZip: digitsOnly(e.target.value).slice(0, 5) })
        }
      />
    </div>
  );
}
