import { NextResponse } from "next/server";
import { getTransfer } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  try {
    const transfer = await getTransfer(token);
    if (!transfer) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    return NextResponse.json({ transfer });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load the transfer.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
