import { describe, expect, it } from "vitest";

import {
  createTagPropertyUpdate,
  getStableInlineTags,
  mergeTags,
  normalizeTag,
} from "../src/tag-utils";

describe("normalizeTag", () => {
  it("removes the inline hash prefix", () => {
    expect(normalizeTag("#financial")).toBe("financial");
    expect(normalizeTag(" #client/billing ")).toBe("client/billing");
  });

  it("rejects empty tag values", () => {
    expect(normalizeTag("#")).toBeNull();
    expect(normalizeTag("   ")).toBeNull();
  });
});

describe("getStableInlineTags", () => {
  const trailingTag = {
    tag: "#financial",
    position: { start: { offset: 0 }, end: { offset: 10 } },
  };

  it("defers a tag that is still at the active editor boundary", () => {
    expect(getStableInlineTags([trailingTag], 11, false, 10)).toEqual([]);
  });

  it("includes a tag after the user types a boundary character", () => {
    expect(getStableInlineTags([trailingTag], 11, false, 11)).toEqual([
      "#financial",
    ]);
  });

  it("includes a trailing tag when the user leaves the note", () => {
    expect(getStableInlineTags([trailingTag], 10, true, null)).toEqual([
      "#financial",
    ]);
  });

  it("uses the document boundary when no editor cursor is available", () => {
    expect(getStableInlineTags([trailingTag], 10, false, null)).toEqual([]);
    expect(getStableInlineTags([trailingTag], 11, false, null)).toEqual([
      "#financial",
    ]);
  });
});

describe("mergeTags", () => {
  it("appends inline tags while preserving existing tag order", () => {
    expect(
      mergeTags(["client-work"], ["#financial", "#client/billing"]),
    ).toEqual({
      tags: ["client-work", "financial", "client/billing"],
      added: ["financial", "client/billing"],
    });
  });

  it("deduplicates tags case-insensitively", () => {
    expect(mergeTags(["Financial"], ["#financial", "#FINANCIAL"])).toEqual({
      tags: ["Financial"],
      added: [],
    });
  });

  it("does not rewrite repeated existing tags while deduplicating additions", () => {
    expect(
      mergeTags(["financial", "financial"], ["#client", "#client"]),
    ).toEqual({
      tags: ["financial", "financial", "client"],
      added: ["client"],
    });
  });
});

describe("createTagPropertyUpdate", () => {
  it("preserves the casing and raw values of an existing Tags property", () => {
    const frontmatter = { Tags: ["Writing", 42] };

    expect(
      createTagPropertyUpdate(frontmatter, ["Writing"], ["#financial"]),
    ).toEqual({
      key: "Tags",
      value: ["Writing", 42, "financial"],
    });
  });

  it("creates a lowercase tags property when none exists", () => {
    expect(createTagPropertyUpdate({}, [], ["#financial"])).toEqual({
      key: "tags",
      value: ["financial"],
    });
  });

  it("does not rewrite the property when every inline tag already exists", () => {
    expect(
      createTagPropertyUpdate(
        { tags: ["Financial"] },
        ["Financial"],
        ["#financial"],
      ),
    ).toBeNull();
  });
});
