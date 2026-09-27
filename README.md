# Tagatha

[![CI](https://github.com/hellozappa/agatha/actions/workflows/ci.yml/badge.svg)](https://github.com/hellozappa/agatha/actions/workflows/ci.yml)
[![GitHub release](https://img.shields.io/github/v/release/hellozappa/agatha?sort=semver)](https://github.com/hellozappa/agatha/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Tagatha keeps a note's inline body tags reflected in its YAML `tags` property.

Typing:

```markdown
Consider billing options for client work #financial #client/billing
```

adds the missing tags to the note's frontmatter:

```yaml
---
tags:
  - financial
  - client/billing
---
```

## Behavior

- Copies every inline tag recognized by Obsidian in the note body.
- Preserves existing frontmatter tags and their order.
- Avoids duplicate tags case-insensitively.
- Supports nested tags such as `#client/billing`.
- Is append-only. Removing an inline tag does not remove it from frontmatter.
- Runs locally and has no settings, network access, or telemetry.

## Installation

Download `main.js` and `manifest.json` from the
[latest release](https://github.com/hellozappa/agatha/releases/latest), then place
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
