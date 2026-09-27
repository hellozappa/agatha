import { PluginSettingTab, Setting } from "obsidian";

import type TagathaPlugin from "./main";

export interface TagathaSettings {
  synchronizeRemovals: boolean;
  tagSnapshots: Record<string, TagSnapshot>;
}

export interface TagSnapshot {
  frontmatterTags: string[];
  inlineTags: string[];
}

export const DEFAULT_SETTINGS: TagathaSettings = {
  synchronizeRemovals: false,
  tagSnapshots: {},
};

export class TagathaSettingTab extends PluginSettingTab {
  constructor(private readonly plugin: TagathaPlugin) {
    super(plugin.app, plugin);
  }

  display(): void {
    this.containerEl.empty();

    new Setting(this.containerEl)
      .setName("Synchronize tag removals")
      .setDesc(
        "When enabled, removing a tag from inline text removes it from frontmatter, and removing it from frontmatter removes its inline tag. Existing frontmatter-only tags are not treated as removals.",
      )
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.synchronizeRemovals)
          .onChange(async (value) => {
            await this.plugin.setRemovalSynchronization(value);
          });
      });
  }
}
