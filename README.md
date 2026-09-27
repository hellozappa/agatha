# Tagatha

[![CI](https://github.com/hellozappa/tagatha/actions/workflows/ci.yml/badge.svg)](https://github.com/hellozappa/tagatha/actions/workflows/ci.yml)
[![GitHub release](https://img.shields.io/github/v/release/hellozappa/tagatha?sort=semver)](https://github.com/hellozappa/tagatha/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Tagatha keeps a note's inline body tags reflected in its YAML `tags` property.
It adds missing body tags to frontmatter automatically and can optionally keep
tag removals synchronized in both directions.

## Plugin Behavior

- Preserves a note's existing frontmatter tags.
- Case-insensitively avoids duplicate tags.
- Supports nested tags such as `#client/billing`.
- Is append-only by default. Removing an inline tag does not remove it from
  frontmatter (or vice versa) unless **Synchronize tag removals** is enabled in Tagatha's
  settings.
- With **Synchronize tag removals** enabled, removing a tag from either inline
  text or frontmatter removes every matching tag from the other location in that note.
- Compares tags case-insensitively and accepts a leading `#` in frontmatter
  values without creating duplicates.
- Runs locally and has no network access or telemetry.

## Settings

### Synchronize tag removals

This option is **off by default**, preserving Tagatha's original append-only
behavior.

When enabled, Tagatha remembers which tags each note has in inline text and
frontmatter. If a tag that existed in both places is removed from either one,
Tagatha removes it from the other. This prevents ambiguity when the two forms
were already different: an existing frontmatter-only tag is not treated as an
inline-tag deletion.

You can change the option at **Settings → Community plugins → Tagatha**. Turning
it on records fresh snapshots; turning it off clears those snapshots and returns
to append-only synchronization.

## Installation

Download `main.js` and `manifest.json` from the
[latest release](https://github.com/hellozappa/tagatha/releases/latest), then place
both files in a vault folder named `.obsidian/plugins/tagatha`. Enable
**Tagatha** under **Settings → Community plugins**.

## Development

```bash
npm install
npm test
npm run build
```

The production build creates `main.js`. To install the plugin manually, place
`main.js` and `manifest.json` in a vault folder named
`.obsidian/plugins/tagatha`, then enable **Tagatha** in Community plugins.
## Releases

Run `npm version <version> --no-git-tag-version`, update `manifest.json` and
`versions.json` to match, then push a tag with that exact version, such as
`0.1.0`. GitHub Actions validates all four version files, runs the tests, builds
the plugin, and attaches the runtime files to a GitHub release.
