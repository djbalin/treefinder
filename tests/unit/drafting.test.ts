import type Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it, vi } from "vitest";
import {
  DRAFT_MODEL,
  type DraftClient,
  draftSection,
} from "@/lib/drafting/claude";
import { buildDraftUpdate, cleanSources } from "@/lib/drafting/submission";

type Message = Anthropic.Beta.Messages.BetaMessage;

function message(partial: Partial<Message>): Message {
  return {
    id: "msg",
    type: "message",
    role: "assistant",
    model: DRAFT_MODEL,
    content: [],
    stop_reason: "end_turn",
    stop_sequence: null,
    usage: { input_tokens: 1, output_tokens: 1 },
    ...partial,
  } as Message;
}

function submit(input: Record<string, unknown>) {
  return message({
    stop_reason: "tool_use",
    content: [
      { type: "tool_use", id: "t1", name: "submit_card", input },
    ] as Message["content"],
  });
}

function fakeClient(responses: Message[]) {
  const stream = vi.fn(() => {
    const next = responses.shift();
    if (!next) throw new Error("No more responses");
    return { finalMessage: async () => next };
  });
  return {
    client: { beta: { messages: { stream } } } as unknown as DraftClient,
    stream,
  };
}

const species = { name: "Småbladet lind", latinName: "Tilia cordata" };

describe("draftSection", () => {
  it("asks Opus 5.5 with web search, a strict submit tool and fallbacks", async () => {
    const { client, stream } = fakeClient([
      submit({ foodSafety: ["Sikker."] }),
    ]);
    const result = await draftSection(client, "safety", species);

    expect(result.input).toEqual({ foodSafety: ["Sikker."] });
    const params = (stream.mock.calls[0] as unknown[])[0] as Record<
      string,
      unknown
    >;
    expect(params).toMatchObject({
      model: "claude-opus-5-5",
      fallbacks: "default",
      betas: ["server-side-fallback-2026-07-01"],
      stream: true,
    });
    const tools = params.tools as {
      name: string;
      type?: string;
      strict?: boolean;
    }[];
    expect(tools.find((tool) => tool.name === "web_search")?.type).toBe(
      "web_search_20260209",
    );
    expect(tools.find((tool) => tool.name === "submit_card")?.strict).toBe(
      true,
    );
    expect(JSON.stringify(params.messages)).toContain("Tilia cordata");
  });

  it("resumes a paused server-tool turn without adding a user message", async () => {
    const paused = message({ stop_reason: "pause_turn", content: [] });
    const { client, stream } = fakeClient([paused, submit({ ok: true })]);

    const result = await draftSection(client, "carving", species);

    expect(result.turns).toBe(2);
    const second = (stream.mock.calls[1] as unknown[])[0] as {
      messages: { role: string }[];
    };
    expect(second.messages.map((item) => item.role)).toEqual([
      "user",
      "assistant",
    ]);
  });

  it("asks again when Claude answers in text instead of calling the tool", async () => {
    const text = message({
      content: [{ type: "text", text: "Her er kortet." }] as Message["content"],
    });
    const { client, stream } = fakeClient([text, submit({ ok: true })]);

    await draftSection(client, "carving", species);
    const second = (stream.mock.calls[1] as unknown[])[0] as {
      messages: { role: string }[];
    };
    expect(second.messages.map((item) => item.role)).toEqual([
      "user",
      "assistant",
      "user",
    ]);
  });

  it("fails on a refusal", async () => {
    const { client } = fakeClient([message({ stop_reason: "refusal" })]);
    await expect(draftSection(client, "safety", species)).rejects.toThrow(
      /afviste/,
    );
  });
});

describe("buildDraftUpdate", () => {
  const current = {
    isWarning: false,
    localNames: { da: ["Småbladet lind"] },
    sources: [
      {
        title: "Gammel snitkilde",
        url: "https://old.example/snit",
        field: "carving" as const,
      },
      {
        title: "Kendetegn",
        url: "https://example.com/id",
        field: "identification" as const,
      },
    ],
  };

  it("keeps valid carving values and drops invalid ones", () => {
    const update = buildDraftUpdate(
      "carving",
      {
        greenCarving: "easy",
        dryHardness: "rock-hard",
        jankaN: 2645.4,
        grainTexture: ["Fin ved.", "  "],
        colourSmell: [],
        goodForTags: ["spoons", "spoons", "boats"],
        goodFor: ["Skeer."],
        riving: ["Kløver let."],
        drying: ["Tørrer hurtigt."],
        sources: [
          {
            title: "Ny kilde",
            url: "https://new.example/snit",
            field: "carving",
          },
          { title: "Ingen url", url: "ikke en url", field: "drying" },
          {
            title: "Forkert felt",
            url: "https://x.example",
            field: "foodSafety",
          },
        ],
      },
      current,
    );

    expect(update.greenCarving).toBe("easy");
    expect(update.dryHardness).toBeNull();
    expect(update.jankaN).toBe(2645);
    expect(update.colourSmell).toBeNull();
    expect(update.goodForTags).toEqual(["spoons"]);
    expect(update.sources).toEqual([
      {
        title: "Kendetegn",
        url: "https://example.com/id",
        field: "identification",
      },
      { title: "Ny kilde", url: "https://new.example/snit", field: "carving" },
    ]);
  });

  it("can flag a species as toxic but never unflags it", () => {
    const flagged = buildDraftUpdate(
      "safety",
      { foodSafety: ["Giftig."], warningReason: "Giftig." },
      current,
    );
    expect(flagged.isWarning).toBe(true);

    const kept = buildDraftUpdate(
      "safety",
      { foodSafety: ["Ok."], warningReason: null },
      { ...current, isWarning: true },
    );
    expect(kept.isWarning).toBe(true);
  });

  it("keeps the Danish names from the species list", () => {
    const update = buildDraftUpdate(
      "identification",
      {
        idFeatures: {
          leaf: ["Hjerteformet."],
          bark: [],
          twig: [],
          shape: [],
          cutWood: [],
        },
        filterTraits: {
          leafType: ["broad"],
          arrangement: ["alternate", "sideways"],
          leafShape: [],
          leafEdge: [],
          bark: [],
          thorns: ["no"],
        },
        localNames: {
          sv: ["Skogslind"],
          nb: [],
          de: ["Winterlinde"],
          nl: [],
          en: ["Small-leaved lime"],
        },
        sources: [],
      },
      current,
    );
    expect(update.localNames?.da).toEqual(["Småbladet lind"]);
    expect(update.localNames?.de).toEqual(["Winterlinde"]);
    expect(update.filterTraits?.arrangement).toEqual(["alternate"]);
  });

  it("only accepts http(s) sources for the section's fields", () => {
    expect(
      cleanSources("safety", [
        { title: "A", url: "javascript:alert(1)", field: "foodSafety" },
        { title: "B", url: "https://b.example", field: "foodSafety" },
      ]),
    ).toEqual([{ title: "B", url: "https://b.example", field: "foodSafety" }]);
  });
});
