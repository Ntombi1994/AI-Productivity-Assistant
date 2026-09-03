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
  Segmented,
  TextArea,
  TextInput,
} from "@/components/console";
import { generateEmail, type GeneratedEmail } from "@/lib/ai.functions";

export const Route = createFileRoute("/email-generator")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — COURT Ops Console" },
      {
        name: "description",
        content:
          "Generate supplier, customer and partnership emails for your sneaker business in a formal, friendly or persuasive tone.",
      },
      { property: "og:title", content: "Smart Email Generator — COURT Ops Console" },
      {
        property: "og:description",
        content:
          "AI-drafted sneaker business emails with tone control, copy and regenerate.",
      },
    ],
  }),
  component: EmailGenerator,
});

const TONES = ["Formal", "Friendly", "Persuasive"] as const;

function EmailGenerator() {
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [details, setDetails] = useState("");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Formal");
  const [draft, setDraft] = useState<GeneratedEmail | null>(null);
  const [editing, setEditing] = useState(false);

  const run = useServerFn(generateEmail);
  const mutation = useMutation({
    mutationFn: () => run({ data: { purpose, recipient, tone, details } }),
    onSuccess: (result) => {
      setDraft(result);
      setEditing(false);
      toast.success("Email drafted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const submit = () => {
    if (!purpose.trim()) {
      toast.error("Add an email purpose first.");
      return;
    }
    mutation.mutate();
  };

  const copy = async () => {
    if (!draft) return;
    await navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`);
    toast.success("Copied to clipboard");
  };

  return (
    <AppShell
      eyebrow="Tool 01"
      title="Smart Email Generator"
      action={
        <span className="glass hidden rounded-full px-4 py-2 font-mono text-xs tracking-wider text-mist uppercase sm:block">
          {tone}
        </span>
      }
    >
      <section className="grid gap-6 lg:grid-cols-12">
        <Panel className="lg:col-span-5">
          <PanelHeader
            title="Compose brief"
            aside={<span className="label-mono">Input</span>}
          />
          <div className="mt-5 flex flex-col gap-4">
            <Field label="Email purpose">
              <TextInput
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Restock confirmation for the Meridian high-top"
              />
            </Field>
            <Field label="Recipient / customer type">
              <TextInput
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Wholesale buyer — Vault Athletics"
              />
            </Field>
            <Field label="Key details">
              <TextArea
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Batch #447, 300 units, ships Friday. Requesting PO confirmation and freight carrier."
              />
            </Field>
            <Segmented
              label="Tone"
              options={TONES}
              value={tone}
              onChange={setTone}
            />
            <PrimaryButton
              className="mt-1 w-full"
              onClick={submit}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Generating…" : "Generate email"}
            </PrimaryButton>
          </div>
        </Panel>

        <Panel className="flex flex-col lg:col-span-7">
          <PanelHeader
            dot="mist"
            title="Generated draft"
            aside={
              <div className="flex gap-2">
                <GhostButton onClick={copy} disabled={!draft}>
                  Copy
                </GhostButton>
                <GhostButton
                  onClick={() => setEditing((v) => !v)}
                  disabled={!draft}
                >
                  {editing ? "Done" : "Edit"}
                </GhostButton>
                <GhostButton
                  onClick={submit}
                  disabled={mutation.isPending || !purpose.trim()}
                >
                  Regenerate
                </GhostButton>
              </div>
            }
          />

          {mutation.isPending ? <LoadingLines /> : null}
          {mutation.isError && !mutation.isPending ? (
            <ErrorNote message={(mutation.error as Error).message} />
          ) : null}

          {!mutation.isPending && !draft ? (
            <EmptyState
              title="Your draft will appear here"
              hint="Describe the purpose, who it's going to and the key details, then generate."
            />
          ) : null}

          {!mutation.isPending && draft ? (
            <div className="glass-sunken slidein mt-4 flex-1 rounded-xl p-5">
              <div className="border-b border-bone/10 pb-4">
                <div className="label-mono">Subject</div>
                {editing ? (
                  <TextInput
                    className="mt-1.5"
                    value={draft.subject}
                    onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                  />
                ) : (
                  <div className="mt-1.5 text-sm font-medium">{draft.subject}</div>
                )}
              </div>
              {editing ? (
                <TextArea
                  className="mt-4"
                  rows={14}
                  value={draft.body}
                  onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                />
              ) : (
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-pretty text-bone/80">
                  {draft.body
                    .split(/\n{2,}/)
                    .filter(Boolean)
                    .map((para, i) => (
                      <p key={i} className="whitespace-pre-line">
                        {para}
                      </p>
                    ))}
                </div>
              )}
            </div>
          ) : null}
        </Panel>
      </section>
    </AppShell>
  );
}
