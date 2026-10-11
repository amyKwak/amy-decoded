import { MAX_QUESTION_CHARS } from "./types";

export const MAX_ASK_MESSAGES = 60;
export const MAX_ASK_BODY_CHARS = 150_000;
const MAX_TOOL_RESULT_CHARS = 30_000;

type Block = { type?: unknown; text?: unknown; content?: unknown };
type Message = { role?: unknown; content?: unknown };

/**
 * Validates the conversation the browser sends to the Ask proxy. The proxy
 * must not become a general-purpose Claude endpoint, so user turns are
 * limited to short questions and tool results, and overall size is capped.
 * Returns an error message, or null when valid.
 */
export function validateAskMessages(messages: unknown): string | null {
  if (!Array.isArray(messages) || messages.length === 0) return "messages must be a non-empty array";
  if (messages.length > MAX_ASK_MESSAGES) return "This conversation is too long. Start a new one.";
  if (JSON.stringify(messages).length > MAX_ASK_BODY_CHARS) {
    return "This conversation is too long. Start a new one.";
  }

  for (let i = 0; i < messages.length; i++) {
    const m = messages[i] as Message;
    const expected = i % 2 === 0 ? "user" : "assistant";
    if (m?.role !== expected) return "messages must alternate user and assistant, starting with user";

    if (m.role === "user") {
      if (typeof m.content === "string") {
        if (m.content.length > MAX_QUESTION_CHARS) return `Questions are limited to ${MAX_QUESTION_CHARS} characters.`;
        continue;
      }
      if (!Array.isArray(m.content) || m.content.length === 0) return "invalid user message";
      for (const b of m.content as Block[]) {
        if (b?.type === "tool_result") {
          if (typeof b.content !== "string" || b.content.length > MAX_TOOL_RESULT_CHARS) {
            return "invalid tool result";
          }
        } else if (b?.type === "text") {
          if (typeof b.text !== "string" || b.text.length > MAX_QUESTION_CHARS) return "invalid text block";
        } else {
          return "user messages may only contain questions and tool results";
        }
      }
    } else if (!Array.isArray(m.content) && typeof m.content !== "string") {
      return "invalid assistant message";
    }
  }

  if (messages.length % 2 === 0) return "the last message must be from the user";
  return null;
}

/** The newest free-text question, if the last turn is one. */
export function latestQuestion(messages: Message[]): string | null {
  const last = messages[messages.length - 1];
  return typeof last?.content === "string" ? last.content : null;
}
