export type CardBrand =
  | "visa"
  | "mastercard"
  | "amex"
  | "discover"
  | "unknown";

/** Raw card details as typed into a form. Demo-only — see README. */
export type CardDetails = {
  cardholderName: string;
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  billingZip: string;
  brand: CardBrand;
};

export type TransferStatus = "pending" | "claimed";

export type Transfer = {
  token: string;
  senderName: string;
  senderEmail: string;
  recipientName: string;
  recipientContact: string;
  amountCents: number;
  note: string;
  status: TransferStatus;
  createdAt: string;
  claimedAt: string | null;
};

export type CreateTransferInput = {
  senderName: string;
  senderEmail: string;
  recipientName: string;
  recipientContact: string;
  amountCents: number;
  note: string;
  card: CardDetails;
};

export type RedeemTransferInput = {
  token: string;
  card: CardDetails;
  recipientEmail?: string;
};
