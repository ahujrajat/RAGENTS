# Add Superpowers Skills to RAGENTS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 12 Superpowers workflow skills to RAGENTS Public skills directory with dynamic bundling for Claude Code downloads.

**Architecture:** Skill directories are added as-is to `resources/skills/Public/`. Extension's Claude Code download path is enhanced with a `bundleSkillDirectory()` function that concatenates all files in a skill directory into a single `.md`. Copilot path is unchanged.

**Tech Stack:** TypeScript, VS Code Extension API, Node.js fs module

**Spec:** `docs/superpowers/specs/2026-04-08-add-superpowers-skills-design.md`

---

### Task 1: Add `getLanguageTag()` helper to `extension.ts`

**Files:**
- Modify: `src/extension.ts` (add function after the `copyRecursiveSync` function, around line 291)

- [ ] **Step 1: Add the `getLanguageTag` function**

Add this function after `copyRecursiveSync` (after line 291) and before `deactivate()`:

```typescript
function getLanguageTag(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const langMap: Record<string, string> = {
        '.ts': 'typescript',
        '.js': 'javascript',
        '.cjs': 'javascript',
        '.sh': 'bash',
        '.html': 'html',
        '.dot': 'dot',
        '.py': 'python',
    };
    return langMap[ext] || 'text';
}
```

- [ ] **Step 2: Verify no syntax errors**

Run: `cd /Users/rajat.a.ahuja/Desktop/Prompts/RAGENTS && npx tsc --noEmit`
Expected: No errors (or only pre-existing errors)

- [ ] **Step 3: Commit**

```bash
git add src/extension.ts
git commit -m "feat: add getLanguageTag helper for skill file bundling"
```

---

### Task 2: Add `bundleSkillDirectory()` function to `extension.ts`

**Files:**
- Modify: `src/extension.ts` (add function after `getLanguageTag`)

- [ ] **Step 1: Add the `bundleSkillDirectory` function**

Add this function immediately after `getLanguageTag`:

```typescript
function bundleSkillDirectory(dirPath: string): string {
    const skillMdPath = path.join(dirPath, 'SKILL.md');
    if (!fs.existsSync(skillMdPath)) {
        return '';
    }

    let bundle = fs.readFileSync(skillMdPath, 'utf8');

    const excludedFiles = new Set(['SKILL.md', '.DS_Store', 'CREATION-LOG.md']);

    function collectFiles(dir: string, basePath: string): string[] {
        const results: string[] = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(basePath, fullPath);
            if (entry.isDirectory()) {
                results.push(...collectFiles(fullPath, basePath));
            } else if (!excludedFiles.has(entry.name)) {
                results.push(relativePath);
            }
        }
        return results;
    }

    const companionFiles = collectFiles(dirPath, dirPath).sort();

    for (const relPath of companionFiles) {
        const fullPath = path.join(dirPath, relPath);
        const content = fs.readFileSync(fullPath, 'utf8');
        const isMd = relPath.endsWith('.md');

        bundle += '\n\n---\n\n';
        bundle += `## Companion: ${relPath}\n\n`;

        if (isMd) {
            bundle += content;
        } else {
            const lang = getLanguageTag(fullPath);
            bundle += '```' + lang + '\n' + content + '\n```';
        }
    }

    return bundle;
}
```

- [ ] **Step 2: Verify no syntax errors**

Run: `cd /Users/rajat.a.ahuja/Desktop/Prompts/RAGENTS && npx tsc --noEmit`
Expected: No errors (or only pre-existing errors)

- [ ] **Step 3: Commit**

```bash
git add src/extension.ts
git commit -m "feat: add bundleSkillDirectory function for multi-file skill bundling"
```

---

### Task 3: Modify Claude Code skill download path to use bundling

**Files:**
- Modify: `src/extension.ts:123-128` (Claude Code skill directory download block)

- [ ] **Step 1: Replace the SKILL.md-only read with bundleSkillDirectory call**

In the `ragents.download` command handler, find this block (around line 123-128):

```typescript
                    // Flatten skill directory: read SKILL.md, save as {name}.md
                    const skillMdPath = path.join(item.resourcePath, 'SKILL.md');
                    if (fs.existsSync(skillMdPath)) {
                        const content = fs.readFileSync(skillMdPath, 'utf8');
```

Replace with:

```typescript
                    // Bundle skill directory: SKILL.md + all companion files into single .md
                    const skillMdPath = path.join(item.resourcePath, 'SKILL.md');
                    if (fs.existsSync(skillMdPath)) {
                        const content = bundleSkillDirectory(item.resourcePath);
```

This is a one-line change: `fs.readFileSync(skillMdPath, 'utf8')` becomes `bundleSkillDirectory(item.resourcePath)`. Everything else in the block (collision check, write, notification) stays identical.

- [ ] **Step 2: Verify no syntax errors**

Run: `cd /Users/rajat.a.ahuja/Desktop/Prompts/RAGENTS && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Compile the extension**

Run: `cd /Users/rajat.a.ahuja/Desktop/Prompts/RAGENTS && npm run compile`
Expected: Clean compilation

- [ ] **Step 4: Commit**

```bash
git add src/extension.ts
git commit -m "feat: use bundleSkillDirectory for Claude Code skill downloads"
```

---

### Task 4: Add 6 single-file Superpowers skills

**Files:**
- Create: `resources/skills/Public/dispatching-parallel-agents/SKILL.md`
- Create: `resources/skills/Public/executing-plans/SKILL.md`
- Create: `resources/skills/Public/finishing-a-development-branch/SKILL.md`
- Create: `resources/skills/Public/receiving-code-review/SKILL.md`
- Create: `resources/skills/Public/using-git-worktrees/SKILL.md`
- Create: `resources/skills/Public/verification-before-completion/SKILL.md`

Source: `/Users/rajat.a.ahuja/.claude/plugins/cache/claude-plugins-official/superpowers/5.0.7/skills/`

- [ ] **Step 1: Create the 6 skill directories**

```bash
cd /Users/rajat.a.ahuja/Desktop/Prompts/RAGENTS
mkdir -p resources/skills/Public/dispatching-parallel-agents
mkdir -p resources/skills/Public/executing-plans
mkdir -p resources/skills/Public/finishing-a-development-branch
mkdir -p resources/skills/Public/receiving-code-review
mkdir -p resources/skills/Public/using-git-worktrees
mkdir -p resources/skills/Public/verification-before-completion
```

- [ ] **Step 2: Copy SKILL.md from each source skill**

```bash
SP="/Users/rajat.a.ahuja/.claude/plugins/cache/claude-plugins-official/superpowers/5.0.7/skills"
DEST="/Users/rajat.a.ahuja/Desktop/Prompts/RAGENTS/resources/skills/Public"

cp "$SP/dispatching-parallel-agents/SKILL.md" "$DEST/dispatching-parallel-agents/SKILL.md"
cp "$SP/executing-plans/SKILL.md" "$DEST/executing-plans/SKILL.md"
cp "$SP/finishing-a-development-branch/SKILL.md" "$DEST/finishing-a-development-branch/SKILL.md"
cp "$SP/receiving-code-review/SKILL.md" "$DEST/receiving-code-review/SKILL.md"
cp "$SP/using-git-worktrees/SKILL.md" "$DEST/using-git-worktrees/SKILL.md"
cp "$SP/verification-before-completion/SKILL.md" "$DEST/verification-before-completion/SKILL.md"
```

- [ ] **Step 3: Modify each SKILL.md — normalize frontmatter and add disclaimer/attribution**

For each of the 6 files, replace the existing frontmatter block and insert the disclaimer + attribution after it. The frontmatter pattern is the same for all — keep `name` and `description` from the original, add `license` and `attribution`, then insert the two callout blocks before the body.

**Template to apply to each file (replacing everything from start of file through end of frontmatter `---`):**

```markdown
---
name: {original name}
description: "{original description}"
license: MIT
attribution: "Superpowers plugin (v5.0.7) by the Superpowers team"
---

> [!IMPORTANT]
> This asset is a publicly contributed resource. It is provided "as is" and should be reviewed for accuracy, security, and applicability to your specific context before use.

> [!NOTE]
> **Attribution:** This skill was originally created as part of the [Superpowers](https://github.com/superpowers-ai/superpowers) plugin for Claude Code. Included in RAGENTS with attribution.

```

Then the rest of the original body follows unchanged.

Apply this to all 6 files:
- `dispatching-parallel-agents/SKILL.md` — name: `dispatching-parallel-agents`, description: `Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies`
- `executing-plans/SKILL.md` — name: `executing-plans`, description: `Use when you have a written implementation plan to execute in a separate session with review checkpoints`
- `finishing-a-development-branch/SKILL.md` — name: `finishing-a-development-branch`, description: `Use when implementation is complete, all tests pass, and you need to decide how to integrate the work - guides completion of development work by presenting structured options for merge, PR, or cleanup`
- `receiving-code-review/SKILL.md` — name: `receiving-code-review`, description: `Use when receiving code review feedback, before implementing suggestions, especially if feedback seems unclear or technically questionable - requires technical rigor and verification, not performative agreement or blind implementation`
- `using-git-worktrees/SKILL.md` — name: `using-git-worktrees`, description: `Use when starting feature work that needs isolation from current workspace or before executing implementation plans - creates isolated git worktrees with smart directory selection and safety verification`
- `verification-before-completion/SKILL.md` — name: `verification-before-completion`, description: `Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evidence before assertions always`

- [ ] **Step 4: Verify all 6 files exist and have the disclaimer**

```bash
for skill in dispatching-parallel-agents executing-plans finishing-a-development-branch receiving-code-review using-git-worktrees verification-before-completion; do
    echo "=== $skill ==="
    head -12 "resources/skills/Public/$skill/SKILL.md"
    echo
done
```

Expected: Each file shows the normalized frontmatter followed by the `[!IMPORTANT]` and `[!NOTE]` blocks.

- [ ] **Step 5: Commit**

```bash
git add resources/skills/Public/dispatching-parallel-agents/ resources/skills/Public/executing-plans/ resources/skills/Public/finishing-a-development-branch/ resources/skills/Public/receiving-code-review/ resources/skills/Public/using-git-worktrees/ resources/skills/Public/verification-before-completion/
git commit -m "feat: add 6 single-file Superpowers skills to Public directory"
```

---

### Task 5: Add brainstorming skill (8 files)

**Files:**
- Create: `resources/skills/Public/brainstorming/SKILL.md`
- Create: `resources/skills/Public/brainstorming/visual-companion.md`
- Create: `resources/skills/Public/brainstorming/spec-document-reviewer-prompt.md`
- Create: `resources/skills/Public/brainstorming/scripts/start-server.sh`
- Create: `resources/skills/Public/brainstorming/scripts/stop-server.sh`
- Create: `resources/skills/Public/brainstorming/scripts/server.cjs`
- Create: `resources/skills/Public/brainstorming/scripts/helper.js`
- Create: `resources/skills/Public/brainstorming/scripts/frame-template.html`

Source: `/Users/rajat.a.ahuja/.claude/plugins/cache/claude-plugins-official/superpowers/5.0.7/skills/brainstorming/`

- [ ] **Step 1: Copy the entire brainstorming directory**

```bash
SP="/Users/rajat.a.ahuja/.claude/plugins/cache/claude-plugins-official/superpowers/5.0.7/skills"
DEST="/Users/rajat.a.ahuja/Desktop/Prompts/RAGENTS/resources/skills/Public"

cp -R "$SP/brainstorming" "$DEST/brainstorming"
```

- [ ] **Step 2: Modify SKILL.md frontmatter and add disclaimer/attribution**

Edit `resources/skills/Public/brainstorming/SKILL.md`:

Replace the frontmatter:
```yaml
---
name: brainstorming
description: "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation."
---
```

With:
```yaml
---
name: brainstorming
description: "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation."
license: MIT
attribution: "Superpowers plugin (v5.0.7) by the Superpowers team"
---

> [!IMPORTANT]
> This asset is a publicly contributed resource. It is provided "as is" and should be reviewed for accuracy, security, and applicability to your specific context before use.

> [!NOTE]
> **Attribution:** This skill was originally created as part of the [Superpowers](https://github.com/superpowers-ai/superpowers) plugin for Claude Code. Included in RAGENTS with attribution.

```

The body after the frontmatter remains unchanged.

- [ ] **Step 3: Verify all 8 files are present**

```bash
find resources/skills/Public/brainstorming -type f | sort
```

Expected output:
```
resources/skills/Public/brainstorming/SKILL.md
resources/skills/Public/brainstorming/scripts/frame-template.html
resources/skills/Public/brainstorming/scripts/helper.js
resources/skills/Public/brainstorming/scripts/server.cjs
resources/skills/Public/brainstorming/scripts/start-server.sh
resources/skills/Public/brainstorming/scripts/stop-server.sh
resources/skills/Public/brainstorming/spec-document-reviewer-prompt.md
resources/skills/Public/brainstorming/visual-companion.md
```

- [ ] **Step 4: Commit**

```bash
git add resources/skills/Public/brainstorming/
git commit -m "feat: add brainstorming Superpowers skill with companion files"
```

---

### Task 6: Add systematic-debugging skill (10 bundled files)

**Files:**
- Create: `resources/skills/Public/systematic-debugging/SKILL.md`
- Create: `resources/skills/Public/systematic-debugging/root-cause-tracing.md`
- Create: `resources/skills/Public/systematic-debugging/defense-in-depth.md`
- Create: `resources/skills/Public/systematic-debugging/condition-based-waiting.md`
- Create: `resources/skills/Public/systematic-debugging/condition-based-waiting-example.ts`
- Create: `resources/skills/Public/systematic-debugging/find-polluter.sh`
- Create: `resources/skills/Public/systematic-debugging/test-pressure-1.md`
- Create: `resources/skills/Public/systematic-debugging/test-pressure-2.md`
- Create: `resources/skills/Public/systematic-debugging/test-pressure-3.md`
- Create: `resources/skills/Public/systematic-debugging/test-academic.md`

Source: `/Users/rajat.a.ahuja/.claude/plugins/cache/claude-plugins-official/superpowers/5.0.7/skills/systematic-debugging/`

- [ ] **Step 1: Copy the entire directory**

```bash
SP="/Users/rajat.a.ahuja/.claude/plugins/cache/claude-plugins-official/superpowers/5.0.7/skills"
DEST="/Users/rajat.a.ahuja/Desktop/Prompts/RAGENTS/resources/skills/Public"

cp -R "$SP/systematic-debugging" "$DEST/systematic-debugging"
```

- [ ] **Step 2: Remove CREATION-LOG.md (excluded per spec)**

```bash
rm "$DEST/systematic-debugging/CREATION-LOG.md"
```

- [ ] **Step 3: Modify SKILL.md frontmatter and add disclaimer/attribution**

Edit `resources/skills/Public/systematic-debugging/SKILL.md`:

Replace the frontmatter:
```yaml
---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
---
```

With:
```yaml
---
name: systematic-debugging
description: "Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes"
license: MIT
attribution: "Superpowers plugin (v5.0.7) by the Superpowers team"
---

> [!IMPORTANT]
> This asset is a publicly contributed resource. It is provided "as is" and should be reviewed for accuracy, security, and applicability to your specific context before use.

> [!NOTE]
> **Attribution:** This skill was originally created as part of the [Superpowers](https://github.com/superpowers-ai/superpowers) plugin for Claude Code. Included in RAGENTS with attribution.

```

- [ ] **Step 4: Verify 10 files present (CREATION-LOG.md removed)**

```bash
find resources/skills/Public/systematic-debugging -type f | sort
```

Expected: 10 files (no CREATION-LOG.md)

- [ ] **Step 5: Commit**

```bash
git add resources/skills/Public/systematic-debugging/
git commit -m "feat: add systematic-debugging Superpowers skill with companion files"
```

---

### Task 7: Add remaining 4 multi-file skills

**Files:**
- Create: `resources/skills/Public/requesting-code-review/SKILL.md`
- Create: `resources/skills/Public/requesting-code-review/code-reviewer.md`
- Create: `resources/skills/Public/subagent-driven-development/SKILL.md`
- Create: `resources/skills/Public/subagent-driven-development/spec-reviewer-prompt.md`
- Create: `resources/skills/Public/subagent-driven-development/implementer-prompt.md`
- Create: `resources/skills/Public/subagent-driven-development/code-quality-reviewer-prompt.md`
- Create: `resources/skills/Public/test-driven-development/SKILL.md`
- Create: `resources/skills/Public/test-driven-development/testing-anti-patterns.md`
- Create: `resources/skills/Public/writing-plans/SKILL.md`
- Create: `resources/skills/Public/writing-plans/plan-document-reviewer-prompt.md`

Source: `/Users/rajat.a.ahuja/.claude/plugins/cache/claude-plugins-official/superpowers/5.0.7/skills/`

- [ ] **Step 1: Copy all 4 skill directories**

```bash
SP="/Users/rajat.a.ahuja/.claude/plugins/cache/claude-plugins-official/superpowers/5.0.7/skills"
DEST="/Users/rajat.a.ahuja/Desktop/Prompts/RAGENTS/resources/skills/Public"

cp -R "$SP/requesting-code-review" "$DEST/requesting-code-review"
cp -R "$SP/subagent-driven-development" "$DEST/subagent-driven-development"
cp -R "$SP/test-driven-development" "$DEST/test-driven-development"
cp -R "$SP/writing-plans" "$DEST/writing-plans"
```

- [ ] **Step 2: Modify each SKILL.md — normalize frontmatter and add disclaimer/attribution**

Apply the same frontmatter template to each. Original values:

- `requesting-code-review/SKILL.md` — name: `requesting-code-review`, description: `Use when completing tasks, implementing major features, or before merging to verify work meets requirements`
- `subagent-driven-development/SKILL.md` — name: `subagent-driven-development`, description: `Use when executing implementation plans with independent tasks in the current session`
- `test-driven-development/SKILL.md` — name: `test-driven-development`, description: `Use when implementing any feature or bugfix, before writing implementation code`
- `writing-plans/SKILL.md` — name: `writing-plans`, description: `Use when you have a spec or requirements for a multi-step task, before touching code`

For each file, replace the frontmatter with:

```yaml
---
name: {original name}
description: "{original description}"
license: MIT
attribution: "Superpowers plugin (v5.0.7) by the Superpowers team"
---

> [!IMPORTANT]
> This asset is a publicly contributed resource. It is provided "as is" and should be reviewed for accuracy, security, and applicability to your specific context before use.

> [!NOTE]
> **Attribution:** This skill was originally created as part of the [Superpowers](https://github.com/superpowers-ai/superpowers) plugin for Claude Code. Included in RAGENTS with attribution.

```

Body remains unchanged for all 4.

- [ ] **Step 3: Verify file counts for each skill**

```bash
for skill in requesting-code-review subagent-driven-development test-driven-development writing-plans; do
    echo "=== $skill ==="
    find "resources/skills/Public/$skill" -type f | wc -l
    find "resources/skills/Public/$skill" -type f | sort
    echo
done
```

Expected counts: requesting-code-review=2, subagent-driven-development=4, test-driven-development=2, writing-plans=2

- [ ] **Step 4: Commit**

```bash
git add resources/skills/Public/requesting-code-review/ resources/skills/Public/subagent-driven-development/ resources/skills/Public/test-driven-development/ resources/skills/Public/writing-plans/
git commit -m "feat: add 4 multi-file Superpowers skills to Public directory"
```

---

### Task 8: Final compile and verification

**Files:**
- None modified (verification only)

- [ ] **Step 1: Full compile**

Run: `cd /Users/rajat.a.ahuja/Desktop/Prompts/RAGENTS && npm run compile`
Expected: Clean compilation, no errors

- [ ] **Step 2: Verify all 12 new skill directories exist**

```bash
cd /Users/rajat.a.ahuja/Desktop/Prompts/RAGENTS
for skill in brainstorming dispatching-parallel-agents executing-plans finishing-a-development-branch receiving-code-review requesting-code-review subagent-driven-development systematic-debugging test-driven-development using-git-worktrees verification-before-completion writing-plans; do
    if [ -f "resources/skills/Public/$skill/SKILL.md" ]; then
        echo "OK: $skill"
    else
        echo "MISSING: $skill"
    fi
done
```

Expected: All 12 show "OK"

- [ ] **Step 3: Verify existing skills are untouched**

```bash
ls resources/skills/Public/git-commit/SKILL.md
head -5 resources/skills/Public/git-commit/SKILL.md
```

Expected: File exists with original content (no disclaimer/attribution — it was already there independently)

- [ ] **Step 4: Spot-check bundling output for a multi-file skill**

To verify the bundling logic works, manually call the equivalent logic on systematic-debugging. Create a quick test script:

```bash
cd /Users/rajat.a.ahuja/Desktop/Prompts/RAGENTS
node -e "
const fs = require('fs');
const path = require('path');
const dir = 'resources/skills/Public/systematic-debugging';
const files = [];
function walk(d, base) {
    for (const e of fs.readdirSync(d, {withFileTypes:true})) {
        if (e.isDirectory()) walk(path.join(d,e.name), base);
        else if (!['SKILL.md','.DS_Store','CREATION-LOG.md'].includes(e.name))
            files.push(path.relative(base, path.join(d,e.name)));
    }
}
walk(dir, dir);
files.sort();
console.log('Companion files found:', files.length);
files.forEach(f => console.log('  ', f));
"
```

Expected: 9 companion files listed alphabetically

- [ ] **Step 5: Verify total skill count in Public directory**

```bash
ls -d resources/skills/Public/*/  | wc -l
```

Expected: Existing skills count + 12 new ones. Current existing: ~12 (git-commit, markdown-to-html, agentic-eval, etc.) + 12 new = ~24 total directories.
