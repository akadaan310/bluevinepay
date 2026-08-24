"use client";

import { BRAND_LABEL, detectBrand, digitsOnly } from "@/lib/card";
import type { CardFormState } from "./CardFields";

const DOT = "•";

function displayNumber(cardNumber: string) {
  const brand = detectBrand(cardNumber);
  const groups = brand === "amex" ? [4, 6, 5] : [4, 4, 4, 4];
  const n = digitsOnly(cardNumber);
  let i = 0;
  return groups
    .map((size) => {
      const slice = n.slice(i, i + size);
      i += size;
      return slice.padEnd(size, DOT);
    })
    .join(" ");
}

export default function CardPreview({ card }: { card: CardFormState }) {
  const brand = detectBrand(card.cardNumber);

  return (
    <div className="relative aspect-[1.586] w-full overflow-hidden rounded-2xl bg-navy p-5 text-white shadow-[0_18px_40px_-20px_rgba(13,28,61,0.9)]">
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-600/55 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-mint-400/25 blur-2xl"
      />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div
            aria-hidden="true"
            className="h-8 w-11 rounded-md bg-gradient-to-br from-amber-200 to-amber-400/80"
          />
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">
            {digitsOnly(card.cardNumber).length >= 2
              ? BRAND_LABEL[brand]
              : "bluevine pay"}
          </span>
        </div>

        <p className="font-mono text-[clamp(15px,4.4vw,21px)] tracking-[0.06em] text-white/95 tabular-nums">
          {displayNumber(card.cardNumber)}
        </p>

        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/50">
              Cardholder
            </p>
            <p className="truncate text-[13px] font-semibold uppercase tracking-wide">
              {card.cardholderName || "Your name"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/50">
              Expires
            </p>
            <p className="text-[13px] font-semibold tabular-nums">
              {card.expiry || "MM/YY"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
