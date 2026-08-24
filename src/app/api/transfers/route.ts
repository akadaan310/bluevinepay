import { NextResponse } from "next/server";
import { createTransfer } from "@/lib/store";
import type { CreateTransferInput } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateTransferInput;

    if (!body?.amountCents || body.amountCents <= 0) {
      return NextResponse.json(
        { error: "Enter an amount to send." },
        { status: 400 },
      );
    }
    if (!body.recipientName?.trim() || !body.senderName?.trim()) {
      return NextResponse.json(
        { error: "Both names are required." },
        { status: 400 },
      );
    }

    const transfer = await createTransfer(body);
    return NextResponse.json({ transfer }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create the transfer.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
