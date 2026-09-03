import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PrimaryButton } from "@/components/console";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "COURT Ops Console — AI Productivity for Sneaker Businesses" },
      {
        name: "description",
        content:
          "Run your sneaker business faster: AI email drafting, meeting note summaries and prioritized daily or weekly schedules in one console.",
      },
      {
        property: "og:title",
        content: "COURT Ops Console — AI Productivity for Sneaker Businesses",
      },
      {
        property: "og:description",
        content:
          "AI email drafting, meeting summaries and smart scheduling for sneaker retail and wholesale teams.",
      },
    ],
  }),
  component: Dashboard,
});

const STATS = [
  { label: "Tasks due today", value: "12", meta: "+3", bar: "w-3/4 bg-volt" },
  { label: "Upcoming meetings", value: "4", note: "Next · Supplier call 10:30" },
  {
    label: "Completed tasks",
    value: "28",
    meta: "this week",
    bar: "w-5/6 bg-coral",
  },
  { label: "Weekly productivity", value: "86", meta: "%", bar: "w-[86%] bg-volt" },
] as const;

const TOOLS = [
  {
    n: "01",
    to: "/email-generator",
    title: "Smart Email Generator",
    body: "Draft supplier, customer and partnership messages in any tone.",
    tone: "volt",
  },
  {
    n: "02",
    to: "/meeting-notes",
    title: "Meeting Notes Summarizer",
    body: "Turn long notes into decisions, action items and deadlines.",
    tone: "coral",
  },
  {
    n: "03",
    to: "/task-planner",
    title: "AI Task Planner",
    body: "Prioritize and schedule daily or weekly workflows automatically.",
    tone: "steel",
  },
] as const;

function Dashboard() {
  return (
    <AppShell
      eyebrow="Daily operations"
      title="Welcome back! Let's make your sneaker business more productive today."
      action={
        <>
          <div className="glass hidden items-center gap-2 rounded-full px-4 py-2 text-sm text-mist sm:flex">
            <span className="size-1.5 rounded-full bg-steel" />
            <span className="font-mono text-xs tracking-wider uppercase">
              Ops · live
            </span>
          </div>
          <Link to="/task-planner">
            <PrimaryButton>Generate plan</PrimaryButton>
          </Link>
        </>
      }
    >
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-5">
            <div className="label-mono">{stat.label}</div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight">
                {stat.value}
              </span>
              {"meta" in stat && stat.meta ? (
                <span className="font-mono text-[11px] text-volt">{stat.meta}</span>
              ) : null}
            </div>
            {"bar" in stat && stat.bar ? (
              <div className="glass-sunken mt-3 h-1.5 overflow-hidden rounded-full">
                <div className={`h-full rounded-full ${stat.bar}`} />
              </div>
            ) : null}
            {"note" in stat && stat.note ? (
              <div className="mt-3 text-xs text-bone/60">{stat.note}</div>
            ) : null}
          </div>
        ))}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div className="font-mono text-[11px] tracking-[0.2em] text-mist uppercase">
            AI tools
          </div>
          <span className="font-mono text-[10px] text-mist">Open a workspace</span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.n}
              to={tool.to}
              className="glass group rounded-2xl p-5 text-left transition-transform hover:-translate-y-1"
            >
              <div
                className={
                  tool.tone === "volt"
                    ? "grid size-9 place-items-center rounded-lg bg-volt/10 text-volt ring-1 ring-volt/20"
                    : tool.tone === "coral"
                      ? "grid size-9 place-items-center rounded-lg bg-coral/10 text-coral ring-1 ring-coral/20"
                      : "grid size-9 place-items-center rounded-lg bg-steel/40 text-bone ring-1 ring-bone/10"
                }
              >
                <span className="font-mono text-xs font-bold">{tool.n}</span>
              </div>
              <div className="mt-4 text-sm leading-tight font-semibold">
                {tool.title}
              </div>
              <p className="mt-1 text-xs text-pretty text-bone/60">{tool.body}</p>
              <div className="mt-4 font-mono text-[10px] tracking-wider uppercase opacity-70 transition-opacity group-hover:opacity-100">
                Open →
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-12">
        <div className="glass rounded-2xl p-5 sm:p-6 lg:col-span-7">
          <div className="label-mono">Today at a glance</div>
          <ul className="mt-4 space-y-3">
            {[
              { time: "09:00", task: "Confirm restock with Meridian Supply", p: "High" },
              { time: "10:30", task: "Supplier call — Batch #447 freight", p: "High" },
              { time: "14:00", task: "Reply to pre-order customer emails", p: "Medium" },
              { time: "15:30", task: "Plan drop marketing campaign", p: "Low" },
            ].map((row) => (
              <li
                key={row.time}
                className="glass-sunken flex items-center gap-4 rounded-xl px-4 py-3"
              >
                <span className="font-mono text-xs text-mist">{row.time}</span>
                <span className="flex-1 text-sm">{row.task}</span>
                <span
                  className={
                    row.p === "High"
                      ? "rounded-full bg-coral/15 px-2.5 py-1 font-mono text-[10px] tracking-wider text-coral uppercase"
                      : row.p === "Medium"
                        ? "rounded-full bg-volt/15 px-2.5 py-1 font-mono text-[10px] tracking-wider text-volt uppercase"
                        : "rounded-full bg-steel/40 px-2.5 py-1 font-mono text-[10px] tracking-wider text-bone/70 uppercase"
                  }
                >
                  {row.p}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass flex flex-col rounded-2xl p-5 sm:p-6 lg:col-span-5">
          <div className="label-mono">Where teams start</div>
          <p className="mt-3 text-sm leading-relaxed text-pretty text-bone/80">
            Draft a supplier email, turn this morning's meeting into action items, or
            let the planner sequence the rest of your week around the next drop.
          </p>
          <div className="mt-auto flex flex-wrap gap-2 pt-6">
            <Link to="/email-generator">
              <PrimaryButton>Draft an email</PrimaryButton>
            </Link>
            <Link
              to="/meeting-notes"
              className="glass-sunken rounded-xl px-4 py-2.5 text-sm font-medium text-bone/80 transition-colors hover:text-bone"
            >
              Summarize notes
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
