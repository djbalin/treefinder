import Anthropic from "@anthropic-ai/sdk";
import {
  type DraftSection,
  SECTION_SCHEMAS,
  SECTION_TASKS,
  SYSTEM_PROMPT,
} from "./sections";

export const DRAFT_MODEL = "claude-opus-5-5";
const SUBMIT_TOOL = "submit_card";
const MAX_TURNS = 5;

/** The part of the SDK client the drafting call uses (replaced in tests). */
export type DraftClient = {
  beta: {
    messages: {
      stream: (
        params: Anthropic.Beta.Messages.MessageCreateParamsStreaming,
      ) => {
        finalMessage: () => Promise<Anthropic.Beta.Messages.BetaMessage>;
      };
    };
  };
};

export function createDraftClient(): DraftClient {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY mangler, så kortet kan ikke skrives.");
  }
  return new Anthropic({
    // Three sections run in one request; together they must fit inside the
    // API route's maxDuration (300 s).
    timeout: Number(process.env.DRAFT_TIMEOUT_MS ?? 90_000),
    maxRetries: 0,
  });
}

export type SpeciesToDraft = {
  name: string;
  latinName: string;
  isWarning?: boolean | null;
};

export type DraftResult = {
  input: Record<string, unknown>;
  usage: Anthropic.Beta.Messages.BetaUsage;
  turns: number;
};

/**
 * Asks Claude to research and write one section of a card. Claude searches
 * the web and answers by calling the strict `submit_card` tool, whose input
 * is the section. Server-tool pauses are resumed; a refusal, or no
 * submission after a few turns, is an error.
 */
export async function draftSection(
  client: DraftClient,
  section: DraftSection,
  species: SpeciesToDraft,
): Promise<DraftResult> {
  const messages: Anthropic.Beta.Messages.BetaMessageParam[] = [
    {
      role: "user",
      content: [
        `Art: ${species.name} (${species.latinName}).`,
        species.isWarning
          ? "Arten er markeret som giftig eller uegnet til madredskaber."
          : "",
        SECTION_TASKS[section],
      ]
        .filter(Boolean)
        .join("\n"),
    },
  ];

  for (let turn = 1; turn <= MAX_TURNS; turn++) {
    const response = await client.beta.messages
      .stream({
        model: DRAFT_MODEL,
        max_tokens: 16000,
        output_config: { effort: "medium" },
        // Route declined requests to a fallback model instead of stopping.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: SYSTEM_PROMPT,
        tools: [
          { type: "web_search_20260209", name: "web_search", max_uses: 5 },
          {
            name: SUBMIT_TOOL,
            description:
              "Indsend den færdige sektion af kortet. Kaldes præcis én gang, til sidst.",
            strict: true,
            input_schema: SECTION_SCHEMAS[
              section
            ] as Anthropic.Beta.Messages.BetaTool.InputSchema,
          },
        ],
        messages,
        stream: true,
      })
      .finalMessage();

    const submission = response.content.find(
      (block): block is Anthropic.Beta.Messages.BetaToolUseBlock =>
        block.type === "tool_use" && block.name === SUBMIT_TOOL,
    );
    if (submission) {
      return {
        input: submission.input as Record<string, unknown>,
        usage: response.usage,
        turns: turn,
      };
    }

    if (response.stop_reason === "refusal") {
      throw new Error(
        `Claude afviste at skrive afsnittet (${response.stop_details?.category ?? "ukendt"}).`,
      );
    }

    messages.push({ role: "assistant", content: response.content });
    if (response.stop_reason !== "pause_turn") {
      // A text answer instead of a submission: ask once more for the tool call.
      messages.push({
        role: "user",
        content: `Kald ${SUBMIT_TOOL} med resultatet.`,
      });
    }
  }

  throw new Error(`Ingen ${SUBMIT_TOOL} efter ${MAX_TURNS} forsøg.`);
}
