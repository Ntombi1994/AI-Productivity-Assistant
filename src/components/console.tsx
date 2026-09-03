import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass rounded-2xl p-5 sm:p-6", className)}>{children}</div>
  );
}

export function PanelHeader({
  dot = "volt",
  title,
  aside,
}: {
  dot?: "volt" | "coral" | "mist";
  title: string;
  aside?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "size-2 shrink-0 rounded-full",
            dot === "volt" && "bg-volt",
            dot === "coral" && "bg-coral",
            dot === "mist" && "bg-mist",
          )}
        />
        <span className="text-sm font-semibold">{title}</span>
      </div>
      {aside}
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="label-mono mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

const controlClass =
  "glass-sunken w-full rounded-xl px-3 py-2 text-sm text-bone placeholder:text-mist/60 focus:outline-none focus:ring-2 focus:ring-volt/40";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(controlClass, props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} className={cn(controlClass, "resize-y", props.className)} />
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  accent = "volt",
  label,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  accent?: "volt" | "coral";
  label?: string;
}) {
  return (
    <div>
      {label ? <span className="label-mono mb-1.5 block">{label}</span> : null}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option)}
              className={cn(
                "rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:py-1.5",
                active
                  ? accent === "volt"
                    ? "bg-volt text-ink"
                    : "bg-coral/20 text-coral ring-1 ring-coral/30"
                  : "glass-sunken text-bone/70 hover:text-bone",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PrimaryButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "rounded-xl bg-volt px-4 py-2.5 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
        className,
      )}
    />
  );
}

export function GhostButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "glass-sunken rounded-lg px-3 py-1.5 text-xs font-medium text-bone/70 transition-colors hover:text-bone disabled:opacity-50",
        className,
      )}
    />
  );
}

export function LoadingLines() {
  return (
    <div className="mt-5 space-y-3">
      <div className="flex gap-2">
        <div className="shimmer h-2 w-24 rounded-full" />
        <div className="shimmer h-2 w-16 rounded-full" />
        <div className="shimmer h-2 w-32 rounded-full" />
      </div>
      <div className="shimmer h-2 w-full rounded-full" />
      <div className="shimmer h-2 w-11/12 rounded-full" />
      <div className="shimmer h-2 w-4/5 rounded-full" />
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="glass-sunken mt-4 flex flex-1 flex-col items-center justify-center rounded-xl p-8 text-center">
      <div className="label-mono">Nothing generated yet</div>
      <p className="mt-3 text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-[42ch] text-xs text-pretty text-bone/60">{hint}</p>
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <p className="mt-4 rounded-xl bg-coral/10 px-4 py-3 text-xs text-coral ring-1 ring-coral/25">
      {message}
    </p>
  );
}
