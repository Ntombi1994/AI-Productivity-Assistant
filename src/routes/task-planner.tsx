import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import {
  EmptyState,
  ErrorNote,
  Field,
  GhostButton,
  LoadingLines,
  Panel,
  PanelHeader,
  PrimaryButton,
  Segmented,
  TextInput,
} from "@/components/console";
import { generateSchedule, type GeneratedSchedule } from "@/lib/ai.functions";
import { saveSchedule } from "@/lib/schedule-store";

export const Route = createFileRoute("/task-planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — COURT Ops Console" },
      {
        name: "description",
        content:
          "Enter tasks, deadlines and priorities and get a realistic prioritized daily or weekly schedule for your sneaker business.",
      },
      { property: "og:title", content: "AI Task Planner — COURT Ops Console" },
      {
        property: "og:description",
        content:
          "Prioritized daily and weekly schedules built around your sneaker business deadlines.",
      },
    ],
  }),
  component: TaskPlanner,
});

const PRIORITIES = ["High", "Medium", "Low"] as const;
const RANGES = ["Daily", "Weekly"] as const;

type Draft = {
  id: number;
  title: string;
  priority: (typeof PRIORITIES)[number];
  deadline: string;
  duration: string;
};

let nextId = 1;
const emptyTask = (): Draft => ({
  id: nextId++,
  title: "",
  priority: "Medium",
  deadline: "",
  duration: "",
});

function TaskPlanner() {
  const [tasks, setTasks] = useState<Draft[]>([emptyTask()]);
  const [range, setRange] = useState<(typeof RANGES)[number]>("Daily");
  const [plan, setPlan] = useState<GeneratedSchedule | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});

  const run = useServerFn(generateSchedule);
  const mutation = useMutation({
    mutationFn: () =>
      run({
        data: {
          range,
          tasks: tasks
            .filter((t) => t.title.trim())
            .map(({ title, priority, deadline, duration }) => ({
              title,
              priority,
              deadline,
              duration,
            })),
        },
      }),
    onSuccess: (data) => {
      setPlan(data);
      setDone({});
      saveSchedule({ range, ...data });
      toast.success("Schedule generated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const submit = () => {
    if (!tasks.some((t) => t.title.trim())) {
      toast.error("Add at least one task.");
      return;
    }
    mutation.mutate();
  };

  const update = (id: number, patch: Partial<Draft>) =>
    setTasks((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  return (
    <AppShell
      eyebrow="Tool 03"
      title="AI Task Planner"
      action={
        <Segmented options={RANGES} value={range} onChange={setRange} />
      }
    >
      <section className="grid gap-6 lg:grid-cols-12">
        <Panel className="lg:col-span-5">
          <PanelHeader
            title="Tasks"
            aside={<span className="label-mono">Input</span>}
          />
          <div className="mt-5 flex flex-col gap-4">
            {tasks.map((task, index) => (
              <div key={task.id} className="glass-sunken rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="label-mono">Task {index + 1}</span>
                  {tasks.length > 1 ? (
                    <button
                      type="button"
                      aria-label="Remove task"
                      onClick={() =>
                        setTasks((list) => list.filter((t) => t.id !== task.id))
                      }
                      className="text-mist transition-colors hover:text-coral"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-col gap-3">
                  <TextInput
                    value={task.title}
                    onChange={(e) => update(task.id, { title: e.target.value })}
                    placeholder="Update online sneaker inventory"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Deadline">
                      <TextInput
                        type="date"
                        value={task.deadline}
                        onChange={(e) =>
                          update(task.id, { deadline: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Estimated time">
                      <TextInput
                        value={task.duration}
                        onChange={(e) =>
                          update(task.id, { duration: e.target.value })
                        }
                        placeholder="90 min"
                      />
                    </Field>
                  </div>
                  <Segmented
                    label="Priority"
                    accent="coral"
                    options={PRIORITIES}
                    value={task.priority}
                    onChange={(priority) => update(task.id, { priority })}
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setTasks((list) => [...list, emptyTask()])}
              className="glass-sunken flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-medium text-bone/70 transition-colors hover:text-bone"
            >
              <Plus className="size-4" /> Add task
            </button>

            <PrimaryButton
              className="w-full"
              onClick={submit}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Planning…" : "Generate schedule"}
            </PrimaryButton>
          </div>
        </Panel>

        <Panel className="flex flex-col lg:col-span-7">
          <PanelHeader
            dot="mist"
            title={`${range} schedule`}
            aside={
              <GhostButton onClick={submit} disabled={mutation.isPending}>
                Regenerate
              </GhostButton>
            }
          />
          {mutation.isPending ? <LoadingLines /> : null}
          {mutation.isError && !mutation.isPending ? (
            <ErrorNote message={(mutation.error as Error).message} />
          ) : null}
          {!mutation.isPending && !plan ? (
            <EmptyState
              title="Your prioritized plan appears here"
              hint="Add tasks with deadlines and estimated time, choose daily or weekly, then generate."
            />
          ) : null}
          {!mutation.isPending && plan ? (
            <div className="slidein mt-4 space-y-5">
              {plan.rationale ? (
                <p className="text-xs leading-relaxed text-pretty text-mist">
                  {plan.rationale}
                </p>
              ) : null}
              {plan.days.map((day) => (
                <div key={day.day}>
                  <div className="font-mono text-[11px] tracking-[0.2em] text-volt uppercase">
                    {day.day}
                  </div>
                  <ul className="mt-3 space-y-2">
                    {day.blocks.map((block, i) => {
                      const key = `${day.day}-${i}`;
                      return (
                        <li key={key}>
                          <label className="glass-sunken flex cursor-pointer items-start gap-3 rounded-xl px-4 py-3">
                            <input
                              type="checkbox"
                              checked={!!done[key]}
                              onChange={() =>
                                setDone((d) => ({ ...d, [key]: !d[key] }))
                              }
                              className="mt-1 size-4 accent-[oklch(0.9_0.19_118)]"
                            />
                            <span className="w-24 shrink-0 font-mono text-xs text-mist">
                              {block.start}–{block.end}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span
                                className={
                                  done[key]
                                    ? "block text-sm text-mist line-through"
                                    : "block text-sm text-bone/90"
                                }
                              >
                                {block.task}
                              </span>
                              {block.note ? (
                                <span className="mt-0.5 block text-xs text-bone/50">
                                  {block.note}
                                </span>
                              ) : null}
                            </span>
                            <span
                              className={
                                block.priority === "High"
                                  ? "rounded-full bg-coral/15 px-2.5 py-1 font-mono text-[10px] tracking-wider text-coral uppercase"
                                  : block.priority === "Medium"
                                    ? "rounded-full bg-volt/15 px-2.5 py-1 font-mono text-[10px] tracking-wider text-volt uppercase"
                                    : "rounded-full bg-steel/40 px-2.5 py-1 font-mono text-[10px] tracking-wider text-bone/70 uppercase"
                              }
                            >
                              {block.priority}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ) : null}
        </Panel>
      </section>
    </AppShell>
  );
}
