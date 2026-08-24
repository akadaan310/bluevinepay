import type { CardBrand } from "./types";

export function digitsOnly(value: string) {
  return value.replace(/\D+/g, "");
}

export function detectBrand(cardNumber: string): CardBrand {
  const n = digitsOnly(cardNumber);
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  if (/^(6011|65|64[4-9])/.test(n)) return "discover";
  return "unknown";
}

export const BRAND_LABEL: Record<CardBrand, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
  discover: "Discover",
  unknown: "Card",
};

/** Amex is 15 digits in 4-6-5 groups; everything else we treat as 16 in 4s. */
export function cardMaxDigits(brand: CardBrand) {
  return brand === "amex" ? 15 : 16;
}

export function cvcLength(brand: CardBrand) {
  return brand === "amex" ? 4 : 3;
}

export function formatCardNumber(value: string) {
  const brand = detectBrand(value);
  const n = digitsOnly(value).slice(0, cardMaxDigits(brand));
  const groups = brand === "amex" ? [4, 6, 5] : [4, 4, 4, 4];
  const out: string[] = [];
  let i = 0;
  for (const size of groups) {
    if (i >= n.length) break;
    out.push(n.slice(i, i + size));
    i += size;
  }
  return out.join(" ");
}

export function formatExpiry(value: string) {
  const n = digitsOnly(value).slice(0, 4);
  if (n.length === 0) return "";
  // A lone "2".."9" can only be a month if we pad it: 3 -> 03/
  if (n.length === 1) return /[2-9]/.test(n) ? `0${n}/` : n;
  const month = n.slice(0, 2);
  const year = n.slice(2);
  return year ? `${month}/${year}` : `${month}/`;
}

export function luhnValid(cardNumber: string) {
  const n = digitsOnly(cardNumber);
  if (n.length < 12) return false;
  let sum = 0;
  let double = false;
  for (let i = n.length - 1; i >= 0; i--) {
    let d = Number(n[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

export function expiryInFuture(month: string, year: string) {
  const m = Number(month);
  const y = Number(year.length === 2 ? `20${year}` : year);
  if (!m || !y || m < 1 || m > 12) return false;
  const now = new Date();
  // Cards stay valid through the last day of their expiry month.
  const end = new Date(y, m, 1);
  return end > now;
}

export function last4(cardNumber: string) {
  return digitsOnly(cardNumber).slice(-4);
}

export function formatMoney(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}
