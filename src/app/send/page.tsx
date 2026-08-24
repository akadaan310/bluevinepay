import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SendFlow from "./SendFlow";

export const metadata = {
  title: "Send money · Bluevine Pay",
};

export default function SendPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader minimal />
      <main className="flex-1 px-5 py-10 sm:py-14">
        <SendFlow />
      </main>
      <SiteFooter />
    </div>
  );
}
