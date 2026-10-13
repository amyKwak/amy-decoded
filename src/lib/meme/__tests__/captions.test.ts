import { describe, expect, it } from "vitest";
import {
  captionRequest,
  cleanCaptions,
  parseImageDataUrl,
  wrapLines,
} from "../captions";

describe("wrapLines", () => {
  // Every character is 10 units wide.
  const measure = (s: string) => s.length * 10;

  it("fills each line up to the width", () => {
    expect(wrapLines("when you finally sit down", 120, measure)).toEqual([
      "when you",
      "finally sit",
      "down",
    ]);
  });

  it("keeps a too-long word on its own line", () => {
    expect(wrapLines("supercalifragilistic yes", 100, measure)).toEqual([
      "supercalifragilistic",
      "yes",
    ]);
  });

  it("handles empty text", () => {
    expect(wrapLines("   ", 100, measure)).toEqual([]);
  });
});

describe("cleanCaptions", () => {
  it("trims, drops empty ones, and keeps at most 3", () => {
    expect(
      cleanCaptions([
        { top: " Nobody: ", bottom: " My cat at 3am " },
        { top: "", bottom: "" },
        { top: "", bottom: "Monday mood" },
        { top: "A", bottom: "B" },
        { top: "C", bottom: "D" },
        "nope",
      ]),
    ).toEqual([
      { top: "Nobody:", bottom: "My cat at 3am" },
      { top: "", bottom: "Monday mood" },
      { top: "A", bottom: "B" },
    ]);
    expect(cleanCaptions(null)).toEqual([]);
  });
});

describe("parseImageDataUrl", () => {
  it("accepts JPEG, PNG and WebP data URLs only", () => {
    expect(parseImageDataUrl("data:image/jpeg;base64,abc=")).toEqual({
      mediaType: "image/jpeg",
      data: "abc=",
    });
    expect(parseImageDataUrl("data:image/gif;base64,abc=")).toBeNull();
    expect(parseImageDataUrl("data:image/png;base64,<script>")).toBeNull();
    expect(parseImageDataUrl(42)).toBeNull();
  });
});

describe("captionRequest", () => {
  it("adds the vibe and the captions to avoid", () => {
    expect(captionRequest("Any", [])).toBe(
      "Write 3 meme captions for this photo. Any vibe works.",
    );
    const msg = captionRequest("Savage", [{ top: "Me", bottom: "Also me" }]);
    expect(msg).toContain("Make them savage.");
    expect(msg).toContain('"Me / Also me"');
  });
});
