/** Card processing rate used across the demo receipts (1.45% of the amount). */
export const CARD_RATE = 0.0145;

export function cardFeeCents(amountCents: number) {
  return Math.round(amountCents * CARD_RATE);
}

export function totalChargeCents(amountCents: number) {
  return amountCents + cardFeeCents(amountCents);
}
