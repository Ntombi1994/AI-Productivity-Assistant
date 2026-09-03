import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.7-flash";

const BRAND_CONTEXT =
  "You are the operations assistant for COURT, a sneaker business (retail, wholesale, drops, inventory, suppliers, customer support). Be concrete, professional and concise.";

async function callGateway(system: string, user: string, json: boolean) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured for this workspace.");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: `${BRAND_CONTEXT}\n${system}` },
        { role: "user", content: user },
      ],
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429)
      throw new Error("Too many requests right now — please try again shortly.");
    if (res.status === 402)
      throw new Error("AI credits are exhausted. Add credits to keep generating.");
    if (res.status === 403)
      throw new Error("AI access is blocked for this workspace.");
    throw new Error(`AI request failed (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("The AI returned an empty response. Try again.");
  return text;
}

function parseJson<T>(text: string): T {
  const cleaned = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

/* ---------------- Smart Email Generator ---------------- */

export type GeneratedEmail = { subject: string; body: string };

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        purpose: z.string().min(1),
        recipient: z.string().default(""),
        tone: z.enum(["Formal", "Friendly", "Persuasive"]),
        details: z.string().default(""),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<GeneratedEmail> => {
    const text = await callGateway(
      'Write one business email. Respond ONLY with json of shape {"subject": string, "body": string}. The body uses plain text paragraphs separated by blank lines, no markdown.',
      `Tone: ${data.tone}\nPurpose: ${data.purpose}\nRecipient / customer type: ${data.recipient || "unspecified"}\nKey details: ${data.details || "none provided"}`,
      true,
    );
    const parsed = parseJson<GeneratedEmail>(text);
    return { subject: parsed.subject ?? "", body: parsed.body ?? "" };
  });

/* ---------------- Meeting Notes Summarizer ---------------- */

export type NotesSummary = {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  decisions: string[];
  deadlines: Array<{ item: string; date: string }>;
};

export const summarizeNotes = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ notes: z.string().min(1) }).parse(data),
  )
  .handler(async ({ data }): Promise<NotesSummary> => {
    const text = await callGateway(
      'Summarize meeting notes. Respond ONLY with json of shape {"summary": string, "keyPoints": string[], "actionItems": string[], "decisions": string[], "deadlines": [{"item": string, "date": string}]}. Use empty arrays when nothing applies.',
      data.notes,
      true,
    );
    const parsed = parseJson<Partial<NotesSummary>>(text);
    return {
      summary: parsed.summary ?? "",
      keyPoints: parsed.keyPoints ?? [],
      actionItems: parsed.actionItems ?? [],
      decisions: parsed.decisions ?? [],
      deadlines: parsed.deadlines ?? [],
    };
  });

/* ---------------- AI Task Planner ---------------- */

export type ScheduleBlock = {
  start: string;
  end: string;
  task: string;
  priority: "High" | "Medium" | "Low";
  note?: string;
};
export type ScheduleDay = { day: string; blocks: ScheduleBlock[] };
export type GeneratedSchedule = { rationale: string; days: ScheduleDay[] };

export const generateSchedule = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        range: z.enum(["Daily", "Weekly"]),
        tasks: z.array(
          z.object({
            title: z.string().min(1),
            priority: z.enum(["High", "Medium", "Low"]),
            deadline: z.string().default(""),
            duration: z.string().default(""),
          }),
        ),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<GeneratedSchedule> => {
    const list = data.tasks
      .map(
        (t) =>
          `- ${t.title} | priority ${t.priority} | deadline ${t.deadline || "none"} | estimated ${t.duration || "unspecified"}`,
      )
      .join("\n");

    const text = await callGateway(
      `Build a realistic ${data.range === "Daily" ? "single-day" : "Monday-to-Friday"} working schedule between 08:00 and 18:00 with breaks respected. Order tasks by urgency and impact. Respond ONLY with json of shape {"rationale": string, "days": [{"day": string, "blocks": [{"start": "HH:MM", "end": "HH:MM", "task": string, "priority": "High"|"Medium"|"Low", "note": string}]}]}. ${data.range === "Daily" ? "Return exactly one day." : "Return up to five days."}`,
      list,
      true,
    );
    const parsed = parseJson<Partial<GeneratedSchedule>>(text);
    return { rationale: parsed.rationale ?? "", days: parsed.days ?? [] };
  });
