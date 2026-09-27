export interface TagMergeResult {
  tags: string[];
  added: string[];
}

export interface TagPropertyUpdate {
  key: string;
  value: unknown[];
}

export interface PositionedInlineTag {
  tag: string;
  position: {
    start: {
      offset: number;
    };
    end: {
      offset: number;
    };
  };
}

export function normalizeTag(tag: string): string | null {
  const normalized = tag.trim().replace(/^#+/, "");
  return normalized.length > 0 ? normalized : null;
}

export function mergeTags(
  existingTags: readonly string[],
  inlineTags: readonly string[],
): TagMergeResult {
  const tags: string[] = [];
  const added: string[] = [];
  const seen = new Set<string>();

  for (const tag of existingTags) {
    const normalized = normalizeTag(tag);
    if (normalized === null) {
      continue;
    }

    tags.push(normalized);
    seen.add(normalized.toLowerCase());
  }

  for (const tag of inlineTags) {
    const normalized = normalizeTag(tag);
    if (normalized === null) {
      continue;
    }

    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    tags.push(normalized);
    added.push(normalized);
  }

  return { tags, added };
}

export function createTagPropertyUpdate(
  frontmatter: Record<string, unknown>,
  existingTags: readonly string[],
  inlineTags: readonly string[],
): TagPropertyUpdate | null {
  const merge = mergeTags(existingTags, inlineTags);
  if (merge.added.length === 0) {
    return null;
  }

  const key =
    Object.keys(frontmatter).find(
      (frontmatterKey) => frontmatterKey.toLowerCase() === "tags",
    ) ?? "tags";
  const currentValue = frontmatter[key];
  const currentValues = Array.isArray(currentValue)
    ? [...currentValue]
    : currentValue === undefined || currentValue === null
      ? []
      : [currentValue];

  return {
    key,
    value: [...currentValues, ...merge.added],
  };
}

export function getStableInlineTags(
  tags: readonly PositionedInlineTag[],
  contentLength: number,
  includeTrailingTag: boolean,
  editingOffset: number | null,
): string[] {
  return tags
    .filter(
      (tag) => {
        if (includeTrailingTag) {
          return true;
        }

        if (editingOffset !== null) {
          return (
            editingOffset < tag.position.start.offset ||
            editingOffset > tag.position.end.offset
          );
        }

        return tag.position.end.offset < contentLength;
      },
    )
    .map((tag) => tag.tag);
}
