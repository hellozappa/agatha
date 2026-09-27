# Changelog

All notable changes to Tagatha are documented in this file.

## [1.0.0] - 2026-09-26

### Added

- Add the **Synchronize tag removals** setting, disabled by default.
- Remove tags from frontmatter when synchronized inline tags are removed, and
  remove matching inline tags when synchronized frontmatter tags are removed.
- Track per-note tag state so pre-existing frontmatter-only tags are not
  mistaken for removals.

### Changed

- Document default append-only behavior and the optional two-way removal mode.
- Expand automated coverage for removal planning, property updates, normalized
  matching, and inline-tag text updates.

## [0.1.0] - 2026-09-26

### Added

- Copy inline body tags into the note's YAML `tags` property.
- Preserve existing tags while avoiding case-insensitive duplicates.
- Support multiple and nested tags such as `#client/billing`.
- Add automated tests, continuous integration, and tagged GitHub releases.
