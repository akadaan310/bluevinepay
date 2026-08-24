type Props = { steps: string[]; current: number };

export default function Stepper({ steps, current }: Props) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progress">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              aria-current={active ? "step" : undefined}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold transition
                ${
                  done
                    ? "bg-mint-400 text-white"
                    : active
                      ? "bg-brand-600 text-white"
                      : "bg-brand-50 text-brand-300"
                }`}
            >
              {done ? "✓" : i + 1}
            </span>
            <span
              className={`hidden text-[13px] font-semibold sm:block ${
                active ? "text-navy" : "text-muted"
              }`}
            >
              {label}
            </span>
            {i < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className={`h-px flex-1 ${done ? "bg-mint-400" : "bg-hairline"}`}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
