import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";

const NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/email-generator", label: "Email Generator" },
  { to: "/meeting-notes", label: "Meeting Notes" },
  { to: "/task-planner", label: "Task Planner" },
  { to: "/schedule", label: "Schedule" },
  { to: "/settings", label: "Settings" },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      <div className="label-mono mb-2 px-3">Workspace</div>
      {NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          activeOptions={{ exact: item.to === "/" }}
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-bone/70 transition-colors hover:bg-bone/5 hover:text-bone"
          activeProps={{
            className:
              "flex items-center gap-3 rounded-xl bg-volt/10 px-3 py-2 text-sm font-medium text-volt ring-1 ring-volt/20",
          }}
        >
          <span className="size-1.5 shrink-0 rounded-full bg-current opacity-70" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-2 pt-2">
      <div className="flex size-9 items-center justify-center rounded-lg bg-volt text-ink">
        <span className="font-mono text-sm font-bold">C</span>
      </div>
      <div className="leading-none">
        <div className="text-sm font-semibold tracking-tight">COURT</div>
        <div className="label-mono mt-1">Ops Console</div>
      </div>
    </div>
  );
}

export function AppShell({
  eyebrow,
  title,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink text-bone selection:bg-volt/30">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-24 h-96 w-96 rounded-full bg-volt/10 blur-3xl" />
        <div className="absolute top-1/3 right-0 h-80 w-80 rounded-full bg-coral/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-steel/40 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-[1440px] gap-6 px-4 py-6 lg:px-8">
        <aside className="glass hidden w-64 shrink-0 flex-col rounded-2xl p-4 lg:flex">
          <div className="mb-8">
            <Brand />
          </div>
          <NavList />
          <div className="mt-auto">
            <div className="glass-sunken rounded-xl p-3">
              <div className="flex items-center gap-2">
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-coral/20 font-mono text-xs font-bold text-coral">
                  RD
                </div>
                <div className="min-w-0 leading-tight">
                  <div className="truncate text-sm font-medium">Renata Diallo</div>
                  <div className="label-mono mt-0.5 truncate">Ops Lead</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setOpen(true)}
                className="glass mt-1 grid size-10 shrink-0 place-items-center rounded-xl text-bone lg:hidden"
              >
                <Menu className="size-5" />
              </button>
              <div className="min-w-0">
                <div className="font-mono text-[11px] tracking-[0.2em] text-volt uppercase">
                  {eyebrow}
                </div>
                <h1 className="mt-2 max-w-[26ch] text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-3xl">
                  {title}
                </h1>
              </div>
            </div>
            {action ? <div className="flex items-center gap-3">{action}</div> : null}
          </header>

          {children}

          <footer className="glass-sunken rounded-xl px-5 py-4">
            <p className="text-xs leading-relaxed text-pretty text-mist">
              <span className="font-mono tracking-wider text-volt/80 uppercase">
                Responsible AI —{" "}
              </span>
              AI-generated content is provided as assistance and may require review
              before being used for important business decisions or customer
              communication.
            </p>
          </footer>
        </main>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
          />
          <div className="glass slidein absolute inset-y-0 left-0 flex w-72 flex-col p-4">
            <div className="mb-8 flex items-start justify-between">
              <Brand />
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
                className="grid size-9 place-items-center rounded-lg text-mist hover:text-bone"
              >
                <X className="size-5" />
              </button>
            </div>
            <NavList onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
