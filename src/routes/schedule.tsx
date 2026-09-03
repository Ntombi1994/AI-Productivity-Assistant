import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  EmptyState,
  Panel,
  PanelHeader,
  PrimaryButton,
} from "@/components/console";
import { loadSchedule, type StoredSchedule } from "@/lib/schedule-store";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "Schedule — COURT Ops Console" },
      {
        name: "description",
        content:
          "Review the latest AI-generated daily or weekly schedule for your sneaker business operations.",
      },
      { property: "og:title", content: "Schedule — COURT Ops Console" },
      {
        property: "og:description",
        content: "Your saved sneaker business schedule, prioritized by AI.",
      },
    ],
  }),
  component: SchedulePage,
});

function SchedulePage() {
  const [plan, setPlan] = useState<StoredSchedule | null>(null);

  useEffect(() => {
    setPlan(loadSchedule());
  }, []);

  return (
    <AppShell
      eyebrow="Planning"
      title="Your saved schedule"
      action={
        <Link to="/task-planner">
          <PrimaryButton>Open planner</PrimaryButton>
        </Link>
      }
    >
      <Panel className="flex flex-col">
        <PanelHeader
          title={plan ? `${plan.range} plan` : "No plan yet"}
          aside={<span className="label-mono">Latest generation</span>}
        />
        {!plan ? (
          <EmptyState
            title="Nothing scheduled yet"
            hint="Generate a plan in the AI Task Planner and it will be saved here for quick reference."
          />
        ) : (
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {plan.days.map((day) => (
              <div key={day.day} className="glass-sunken rounded-xl p-4">
                <div className="font-mono text-[11px] tracking-[0.2em] text-volt uppercase">
                  {day.day}
                </div>
                <ul className="mt-3 space-y-3">
                  {day.blocks.map((block, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-24 shrink-0 font-mono text-xs text-mist">
                        {block.start}–{block.end}
                      </span>
                      <span className="min-w-0 flex-1 text-sm text-bone/85">
                        {block.task}
                      </span>
                      <span
                        className={
                          block.priority === "High"
                            ? "rounded-full bg-coral/15 px-2 py-0.5 font-mono text-[10px] tracking-wider text-coral uppercase"
                            : block.priority === "Medium"
                              ? "rounded-full bg-volt/15 px-2 py-0.5 font-mono text-[10px] tracking-wider text-volt uppercase"
                              : "rounded-full bg-steel/40 px-2 py-0.5 font-mono text-[10px] tracking-wider text-bone/70 uppercase"
                        }
                      >
                        {block.priority}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </AppShell>
  );
}
