import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
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
  TextArea,
} from "@/components/console";
import { summarizeNotes, type NotesSummary } from "@/lib/ai.functions";

export const Route = createFileRoute("/meeting-notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — COURT Ops Console" },
      {
        name: "description",
        content:
          "Paste long sneaker business meeting notes and get a summary, key points, action items, decisions and deadlines.",
      },
      {
        property: "og:title",
        content: "Meeting Notes Summarizer — COURT Ops Console",
      },
      {
        property: "og:description",
        content:
          "Turn long meeting notes into decisions, action items and deadlines in seconds.",
      },
    ],
  }),
  component: MeetingNotes,
});

function MeetingNotes() {
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<NotesSummary | null>(null);
  const [done, setDone] = useState<Record<number, boolean>>({});

  const run = useServerFn(summarizeNotes);
  const mutation = useMutation({
    mutationFn: () => run({ data: { notes } }),
    onSuccess: (data) => {
      setResult(data);
      setDone({});
      toast.success("Notes summarized");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const submit = () => {
    if (notes.trim().length < 20) {
      toast.error("Paste a bit more of your meeting notes first.");
      return;
    }
    mutation.mutate();
  };

  const asText = (r: NotesSummary) =>
    [
      `SUMMARY\n${r.summary}`,
      `KEY POINTS\n${r.keyPoints.map((p) => `- ${p}`).join("\n")}`,
      `ACTION ITEMS\n${r.actionItems.map((p) => `- ${p}`).join("\n")}`,
      `DECISIONS\n${r.decisions.map((p) => `- ${p}`).join("\n")}`,
      `DEADLINES\n${r.deadlines.map((d) => `- ${d.item}: ${d.date}`).join("\n")}`,
    ].join("\n\n");

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(asText(result));
    toast.success("Summary copied");
  };

  const exportNotes = () => {
    if (!result) return;
    const blob = new Blob([asText(result)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meeting-summary.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Notes exported");
  };

  return (
    <AppShell eyebrow="Tool 02" title="Meeting Notes Summarizer">
      <section className="grid gap-6 lg:grid-cols-12">
        <Panel className="lg:col-span-5">
          <PanelHeader
            dot="coral"
            title="Raw notes"
            aside={<span className="label-mono">Input</span>}
          />
          <div className="mt-5 flex flex-col gap-4">
            <Field label="Meeting notes">
              <TextArea
                rows={16}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste the full meeting notes here — supplier updates, drop planning, inventory issues, customer feedback…"
              />
            </Field>
            <PrimaryButton
              className="w-full"
              onClick={submit}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Summarizing…" : "Summarize notes"}
            </PrimaryButton>
          </div>
        </Panel>

        <div className="flex flex-col gap-4 lg:col-span-7">
          <Panel>
            <PanelHeader
              dot="mist"
              title="Summary"
              aside={
                <div className="flex gap-2">
                  <GhostButton onClick={copy} disabled={!result}>
                    Copy
                  </GhostButton>
                  <GhostButton onClick={exportNotes} disabled={!result}>
                    Export
                  </GhostButton>
                  <GhostButton onClick={submit} disabled={mutation.isPending}>
                    Regenerate
                  </GhostButton>
                </div>
              }
            />
            {mutation.isPending ? <LoadingLines /> : null}
            {mutation.isError && !mutation.isPending ? (
              <ErrorNote message={(mutation.error as Error).message} />
            ) : null}
            {!mutation.isPending && !result ? (
              <EmptyState
                title="Your meeting breakdown lands here"
                hint="Paste notes on the left — you'll get a summary, action items, decisions and deadlines."
              />
            ) : null}
            {!mutation.isPending && result ? (
              <div className="slidein mt-4 space-y-3">
                <p className="text-sm leading-relaxed text-pretty text-bone/80">
                  {result.summary}
                </p>
                {result.keyPoints.length ? (
                  <ul className="glass-sunken space-y-2 rounded-xl p-4">
                    {result.keyPoints.map((point, i) => (
                      <li key={i} className="flex gap-3 text-sm text-bone/80">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-volt" />
                        <span className="text-pretty">{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </Panel>

          {result && !mutation.isPending ? (
            <div className="slidein grid gap-4 md:grid-cols-2">
              <Panel>
                <PanelHeader title="Action items" />
                <ul className="mt-4 space-y-2">
                  {result.actionItems.length ? (
                    result.actionItems.map((item, i) => (
                      <li key={i}>
                        <label className="glass-sunken flex cursor-pointer items-start gap-3 rounded-xl px-4 py-3">
                          <input
                            type="checkbox"
                            checked={!!done[i]}
                            onChange={() =>
                              setDone((d) => ({ ...d, [i]: !d[i] }))
                            }
                            className="mt-0.5 size-4 accent-[oklch(0.9_0.19_118)]"
                          />
                          <span
                            className={
                              done[i]
                                ? "text-sm text-mist line-through"
                                : "text-sm text-bone/85"
                            }
                          >
                            {item}
                          </span>
                        </label>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-mist">No action items found.</li>
                  )}
                </ul>
              </Panel>

              <Panel>
                <PanelHeader dot="coral" title="Decisions" />
                <ul className="mt-4 space-y-2">
                  {result.decisions.length ? (
                    result.decisions.map((item, i) => (
                      <li
                        key={i}
                        className="glass-sunken rounded-xl px-4 py-3 text-sm text-pretty text-bone/85"
                      >
                        {item}
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-mist">No decisions recorded.</li>
                  )}
                </ul>
              </Panel>

              <Panel className="md:col-span-2">
                <PanelHeader dot="mist" title="Deadlines" />
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {result.deadlines.length ? (
                    result.deadlines.map((d, i) => (
                      <li
                        key={i}
                        className="glass-sunken flex items-center justify-between gap-4 rounded-xl px-4 py-3"
                      >
                        <span className="text-sm text-bone/85">{d.item}</span>
                        <span className="rounded-full bg-coral/15 px-2.5 py-1 font-mono text-[10px] tracking-wider text-coral uppercase">
                          {d.date}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-mist">No deadlines mentioned.</li>
                  )}
                </ul>
              </Panel>
            </div>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}
