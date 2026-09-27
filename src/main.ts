import { EditorView } from "@codemirror/view";
import {
  MarkdownView,
  Plugin,
  TFile,
  parseFrontMatterTags,
  type CachedMetadata,
} from "obsidian";

import { PathDebouncer } from "./path-debouncer";
import {
  createTagPropertyUpdate,
  getStableInlineTags,
  mergeTags,
} from "./tag-utils";

const TAG_SYNC_DELAY_MILLISECONDS = 1_000;

export default class TagathaPlugin extends Plugin {
  private activeFilePath: string | null = null;
  private readonly debouncer = new PathDebouncer(TAG_SYNC_DELAY_MILLISECONDS);
  private readonly syncChains = new Map<string, Promise<void>>();
  private isUnloading = false;

  onload(): void {
    this.app.workspace.onLayoutReady(() => {
      this.activeFilePath = this.app.workspace.getActiveFile()?.path ?? null;
    });

    this.registerEvent(
      this.app.metadataCache.on(
        "changed",
        (file: TFile, _data: string, cache: CachedMetadata) => {
          if (!this.app.workspace.layoutReady || cache.tags === undefined) {
            return;
          }

          this.debouncer.schedule(file.path, () => {
            this.enqueueSync(file.path, false);
          });
        },
      ),
    );

    this.registerEditorExtension(
      EditorView.updateListener.of((update) => {
        if (!update.selectionSet) {
          return;
        }

        const path = this.app.workspace.getActiveFile()?.path;
        if (path !== undefined) {
          this.debouncer.schedule(path, () => {
            this.enqueueSync(path, false);
          });
        }
      }),
    );

    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        if (!this.app.workspace.layoutReady) {
          return;
        }

        const previousPath = this.activeFilePath;
        this.activeFilePath = this.app.workspace.getActiveFile()?.path ?? null;
        if (previousPath !== null && previousPath !== this.activeFilePath) {
          this.debouncer.cancel(previousPath);
          this.enqueueSync(previousPath, true);
        }
      }),
    );
  }

  onunload(): void {
    this.isUnloading = true;
    this.activeFilePath = null;
    this.debouncer.clearAll();
    this.syncChains.clear();
  }

  private enqueueSync(path: string, includeTrailingTag: boolean): void {
    const previous = this.syncChains.get(path) ?? Promise.resolve();
    const next = previous
      .catch(() => undefined)
      .then(async () => {
        if (!this.isUnloading) {
          await this.syncBodyTags(path, includeTrailingTag);
        }
      });

    this.syncChains.set(path, next);

    void next
      .catch((error: unknown) => {
        console.error(`Tagatha could not update tags for ${path}.`, error);
      })
      .finally(() => {
        if (this.syncChains.get(path) === next) {
          this.syncChains.delete(path);
        }
      });
  }

  private async syncBodyTags(
    path: string,
    includeTrailingTag: boolean,
  ): Promise<void> {
    const abstractFile = this.app.vault.getAbstractFileByPath(path);
    if (!(abstractFile instanceof TFile) || abstractFile.extension !== "md") {
      return;
    }

    const cache = this.app.metadataCache.getFileCache(abstractFile);
    const cachedTags = cache?.tags ?? [];
    const shouldIncludeTrailingTag =
      includeTrailingTag || this.activeFilePath !== path;
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    const editingOffset =
      activeView?.file?.path === path
        ? activeView.editor.posToOffset(activeView.editor.getCursor("head"))
        : null;
    const contentLength = shouldIncludeTrailingTag
      ? Number.POSITIVE_INFINITY
      : (await this.app.vault.cachedRead(abstractFile)).length;
    if (this.isUnloading) {
      return;
    }

    const inlineTags = getStableInlineTags(
      cachedTags,
      contentLength,
      shouldIncludeTrailingTag,
      editingOffset,
    );
    if (inlineTags.length === 0) {
      return;
    }

    const cachedFrontmatterTags = parseFrontMatterTags(cache?.frontmatter) ?? [];
    const cachedMerge = mergeTags(cachedFrontmatterTags, inlineTags);
    if (cachedMerge.added.length === 0) {
      return;
    }

    if (this.isUnloading) {
      return;
    }

    await this.app.fileManager.processFrontMatter(
      abstractFile,
      (frontmatter: Record<string, unknown>) => {
        const existingTags = parseFrontMatterTags(frontmatter) ?? [];
        const update = createTagPropertyUpdate(
          frontmatter,
          existingTags,
          inlineTags,
        );
        if (update !== null) {
          frontmatter[update.key] = update.value;
        }
      },
    );
  }
}
