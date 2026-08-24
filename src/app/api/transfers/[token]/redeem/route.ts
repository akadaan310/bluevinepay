import { NextResponse } from "next/server";
import { redeemTransfer } from "@/lib/store";
import type { CardDetails } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  try {
    const body = (await request.json()) as {
      card: CardDetails;
      recipientEmail?: string;
    };
    if (!body?.card?.cardNumber) {
      return NextResponse.json(
        { error: "Card details are required." },
        { status: 400 },
      );
    }

    const transfer = await redeemTransfer({
      token,
      card: body.card,
      recipientEmail: body.recipientEmail,
    });
    return NextResponse.json({ transfer });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not deposit the transfer.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
