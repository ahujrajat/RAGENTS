# Design: Add Superpowers Skills to RAGENTS Public Skills Directory

**Date:** 2026-04-08
**Status:** Approved

## Summary

Add 12 skills from the Superpowers Claude Code plugin (v5.0.7) into the RAGENTS `resources/skills/Public/` directory, making them available to both GitHub Copilot and Claude Code users. Enhance the extension's Claude Code download path to dynamically bundle multi-file skill directories into a single `.md` slash command.

## Goals

- Make Superpowers workflow skills available to all RAGENTS users
- Dual-platform support: Copilot gets native multi-file directories, Claude Code gets bundled single-file slash commands
- Single source of truth — no duplicate content to maintain
- Proper attribution to the Superpowers plugin

## Skills Inventory (12 included, 2 excluded)

### Included

| Skill | Files | Companion Files |
|-------|-------|-----------------|
| brainstorming | 8 | visual-companion.md, spec-document-reviewer-prompt.md, scripts/* (5 files) |
| dispatching-parallel-agents | 1 | — |
| executing-plans | 1 | — |
| finishing-a-development-branch | 1 | — |
| receiving-code-review | 1 | — |
| requesting-code-review | 2 | code-reviewer.md |
| subagent-driven-development | 4 | spec-reviewer-prompt.md, implementer-prompt.md, code-quality-reviewer-prompt.md |
| systematic-debugging | 11 (10 bundled, CREATION-LOG.md excluded) | 7 companion markdown + condition-based-waiting-example.ts, find-polluter.sh |
| test-driven-development | 2 | testing-anti-patterns.md |
| using-git-worktrees | 1 | — |
| verification-before-completion | 1 | — |
| writing-plans | 2 | plan-document-reviewer-prompt.md |

### Excluded

| Skill | Reason |
|-------|--------|
| using-superpowers | Meta skill — teaches Claude how to navigate the Superpowers plugin registry. Not applicable outside the plugin. |
| writing-skills | Meta skill — teaches Claude how to author new Superpowers skills in plugin-specific format. Not applicable outside the plugin. |

## Architecture

### Approach: Dynamic Bundling in Extension

Single source of truth: each skill lives as its native directory (with SKILL.md + companions) in `resources/skills/Public/`. The extension handles platform differences at download time.

```
resources/skills/Public/
├── brainstorming/
│   ├── SKILL.md              ← modified with disclaimer + attribution
│   ├── visual-companion.md
│   ├── spec-document-reviewer-prompt.md
│   └── scripts/
│       ├── start-server.sh
│       ├── stop-server.sh
│       ├── server.cjs
│       ├── helper.js
│       └── frame-template.html
├── systematic-debugging/
│   ├── SKILL.md
│   ├── root-cause-tracing.md
│   ├── defense-in-depth.md
│   ├── condition-based-waiting.md
│   ├── condition-based-waiting-example.ts
│   ├── find-polluter.sh
│   ├── test-pressure-1.md
│   ├── test-pressure-2.md
│   ├── test-pressure-3.md
│   └── test-academic.md
├── dispatching-parallel-agents/
│   └── SKILL.md
├── ... (9 more skills)
└── git-commit/                ← existing skill, unchanged
    └── SKILL.md
```

### Download Flow

**Copilot:** No changes. Existing `copyRecursiveSync` copies the full directory to `.github/skills/{name}/`.

**Claude Code:** Enhanced. Instead of reading only `SKILL.md`, a new `bundleSkillDirectory()` function:

1. Reads `SKILL.md` first (always primary content)
2. Walks remaining files in the directory, excluding `SKILL.md`, `.DS_Store`, `CREATION-LOG.md`
3. For each companion file, appends:
   - Separator: `\n\n---\n\n`
   - Header: `## Companion: {relative-path}`
   - For `.md` files: content inlined directly
   - For non-markdown files: wrapped in fenced code block with language tag
4. Writes the bundled result as `{skill-name}.md` to `.claude/commands/`

**Bundling order:** `SKILL.md` first, then remaining files sorted alphabetically by relative path (deterministic output).

**File type to language tag mapping:**

| Extension | Language Tag |
|-----------|-------------|
| `.ts` | `typescript` |
| `.js`, `.cjs` | `javascript` |
| `.sh` | `bash` |
| `.html` | `html` |
| `.dot` | `dot` |
| `.py` | `python` |
| `*` (fallback) | `text` |

## Code Changes

### `src/extension.ts`

**Modified section:** Claude Code skill download path (current lines 123-148).

Add a `bundleSkillDirectory(dirPath: string): string` function that:
- Reads `SKILL.md` content
- Recursively walks the directory for companion files
- Applies the bundling rules above
- Returns the concatenated string

Replace the current Claude Code skill logic:
```
// Before: just reads SKILL.md
const content = fs.readFileSync(skillMdPath, 'utf8');

// After: bundles all files
const content = bundleSkillDirectory(item.resourcePath);
```

**New helper:** `getLanguageTag(filePath: string): string` — maps file extensions to fenced code block language tags.

### `src/ragentsProvider.ts`

No changes. Skill directories already render correctly as `public-skill-container` nodes.

### `src/platformConfig.ts`

No changes.

### `src/skillsManager.ts`

No changes.

## SKILL.md Modification Template

Each skill's `SKILL.md` is modified before inclusion:

**Frontmatter** — normalized to:

```yaml
---
name: {skill-name}
description: "{original description}"
license: MIT
attribution: "Superpowers plugin (v5.0.7) by the Superpowers team"
---
```

**Disclaimer + Attribution** — inserted after frontmatter, before body:

```markdown
> [!IMPORTANT]
> This asset is a publicly contributed resource. It is provided "as is" and should be reviewed for accuracy, security, and applicability to your specific context before use.

> [!NOTE]
> **Attribution:** This skill was originally created as part of the [Superpowers](https://github.com/superpowers-ai/superpowers) plugin for Claude Code. Included in RAGENTS with attribution.
```

**Body** — preserved as-is, except:
- References to excluded skills (`using-superpowers`, `writing-skills`) are removed or noted as unavailable
- Plugin-specific frontmatter fields (e.g., `allowed-tools`) are removed

## Edge Cases

### `brainstorming/scripts/` — Runtime files

The brainstorming skill includes 5 runtime files for a visual companion feature (HTTP server, HTML template). When bundled for Claude Code, these are inlined as fenced code blocks — preserved for reference but not auto-executable. Core skill functionality (brainstorming process, questions, design flow) works fully without the visual companion. Copilot users get the full directory structure.

### Cross-skill references

Some skills reference each other (e.g., brainstorming invokes writing-plans). All 12 included skills are available, so these references remain valid. References to the 2 excluded skills are cleaned up during content preparation.

### Frontmatter normalization

Source skills have inconsistent frontmatter. All are normalized to the template above during content preparation.

## What Does NOT Change

- Tree view rendering (ragentsProvider.ts)
- Preview behavior
- Copilot download path
- Existing skills in `resources/skills/Public/`
- `skillsManager.ts` discovery logic
- `platformConfig.ts` directory mappings

## Testing

- Download each of the 12 skills for Copilot → verify full directory structure in `.github/skills/`
- Download each of the 12 skills for Claude Code → verify single bundled `.md` in `.claude/commands/`
- Verify bundled `.md` contains SKILL.md content first, then all companions in order
- Verify non-markdown files are wrapped in correct fenced code blocks
- Verify existing skills (e.g., git-commit) still work unchanged
- Preview each skill in the sidebar → verify disclaimer + attribution visible
