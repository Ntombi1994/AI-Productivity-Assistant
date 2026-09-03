import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import {
  Field,
  Panel,
  PanelHeader,
  PrimaryButton,
  Segmented,
  TextInput,
} from "@/components/console";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — COURT Ops Console" },
      {
        name: "description",
        content:
          "Set your sneaker business name, signature and default AI tone for generated emails and plans.",
      },
      { property: "og:title", content: "Settings — COURT Ops Console" },
      {
        property: "og:description",
        content: "Business profile and default AI preferences for the ops console.",
      },
    ],
  }),
  component: Settings,
});

const TONES = ["Formal", "Friendly", "Persuasive"] as const;

function Settings() {
  const [business, setBusiness] = useState("COURT");
  const [signature, setSignature] = useState("Renata Diallo · Operations Lead");
  const [hours, setHours] = useState("08:00–18:00");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Formal");

  return (
    <AppShell eyebrow="Workspace" title="Settings">
      <section className="grid gap-6 lg:grid-cols-12">
        <Panel className="lg:col-span-7">
          <PanelHeader title="Business profile" />
          <div className="mt-5 flex flex-col gap-4">
            <Field label="Business name">
              <TextInput
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
              />
            </Field>
            <Field label="Email signature">
              <TextInput
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
              />
            </Field>
            <Field label="Working hours">
              <TextInput value={hours} onChange={(e) => setHours(e.target.value)} />
            </Field>
            <Segmented
              label="Default email tone"
              options={TONES}
              value={tone}
              onChange={setTone}
            />
            <PrimaryButton
              className="mt-1 w-fit"
              onClick={() => toast.success("Preferences saved")}
            >
              Save preferences
            </PrimaryButton>
          </div>
        </Panel>

        <Panel className="lg:col-span-5">
          <PanelHeader dot="coral" title="AI usage" />
          <div className="mt-5 space-y-3 text-sm leading-relaxed text-bone/75">
            <p>
              Every tool in this console runs on Lovable AI. Drafts, summaries and
              schedules are generated on request and are never sent to customers
              automatically.
            </p>
            <p className="text-xs text-mist">
              Review AI output before sending it to suppliers, buyers or customers.
            </p>
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
