import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getTransfer } from "@/lib/store";
import { formatMoney } from "@/lib/card";
import RedeemFlow from "./RedeemFlow";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const transfer = await getTransfer(token).catch(() => null);
  if (!transfer) return { title: "Transfer not found · Bluevine Pay" };
  return {
    title: `${transfer.senderName} sent you ${formatMoney(transfer.amountCents)} · Bluevine Pay`,
  };
}

export default async function RedeemPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const transfer = await getTransfer(token).catch(() => null);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader minimal />
      <main className="flex-1 px-5 py-10 sm:py-14">
        {transfer ? (
          <RedeemFlow transfer={transfer} />
        ) : (
          <NotFound token={token} />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function NotFound({ token }: { token: string }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-hairline bg-white p-8 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-canvas text-[24px]">
        🔍
      </span>
      <h1 className="mt-5 text-[22px] font-extrabold tracking-[-0.03em] text-navy">
        We couldn&apos;t find that transfer
      </h1>
      <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
        The link <span className="font-mono text-navy">/r/{token}</span> has
        expired or was never issued. Ask the sender to resend it.
      </p>
      <Link
        href="/r/demo"
        className="mt-6 inline-flex h-12 items-center rounded-full bg-brand-600 px-6 text-[15px] font-bold text-white transition hover:bg-brand-700"
      >
        Try the demo link
      </Link>
    </div>
  );
}
