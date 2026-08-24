import BluevineLogo from "./BluevineLogo";

export default function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
        <BluevineLogo />
        <p className="max-w-md text-[12.5px] leading-relaxed text-muted">
          Prototype only — no money moves and no card is ever charged. Bluevine
          is a financial technology company, not a bank.
        </p>
      </div>
    </footer>
  );
}
