"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillsManager = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
/**
 * Discovers and loads skills from the workspace's .github/skills directory
 */
class SkillsManager {
    constructor() {
        this.skills = new Map();
        this.refreshSkills();
    }
    /**
     * Refresh the list of discovered skills from the workspace
     */
    refreshSkills() {
        this.skills.clear();
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return;
        }
        const wsRoot = workspaceFolders[0].uri.fsPath;
        // Discover from .github/skills (Copilot format: directories with SKILL.md)
        const githubSkillsDir = path.join(wsRoot, '.github', 'skills');
        this.discoverSkillsInDir(githubSkillsDir);
        // Discover from .claude/commands (Claude Code format: flat .md files)
        const claudeCommandsDir = path.join(wsRoot, '.claude', 'commands');
        this.discoverClaudeCommands(claudeCommandsDir);
    }
    discoverSkillsInDir(dirPath) {
        if (!fs.existsSync(dirPath)) {
            return;
        }
        try {
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory() && !entry.name.startsWith('.')) {
                    const skillPath = path.join(dirPath, entry.name);
                    const skillMdPath = path.join(skillPath, 'SKILL.md');
                    if (fs.existsSync(skillMdPath)) {
                        const skill = this.parseSkillFile(skillMdPath, entry.name);
                        if (skill) {
                            this.skills.set(skill.name, skill);
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error('Error discovering skills:', error);
        }
    }
    discoverClaudeCommands(dirPath) {
        if (!fs.existsSync(dirPath)) {
            return;
        }
        try {
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isFile() && entry.name.endsWith('.md') && !entry.name.startsWith('.')) {
                    const filePath = path.join(dirPath, entry.name);
                    const skillName = entry.name.replace(/\.md$/, '');
                    // Avoid duplicates if same skill exists in both locations
                    if (!this.skills.has(skillName)) {
                        const skill = this.parseSkillFile(filePath, skillName);
                        if (skill) {
                            this.skills.set(skill.name, skill);
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error('Error discovering Claude commands:', error);
        }
    }
    parseSkillFile(filePath, folderName) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            // Parse YAML frontmatter
            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
            let name = folderName;
            let description = 'No description available';
            if (frontmatterMatch) {
                const frontmatter = frontmatterMatch[1];
                // Extract name
                const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
                if (nameMatch) {
                    name = nameMatch[1].trim().replace(/^['"]|['"]$/g, '');
                }
                // Extract description
                const descMatch = frontmatter.match(/^description:\s*['"]?([\s\S]*?)['"]?$/m);
                if (descMatch) {
                    description = descMatch[1].trim().replace(/^['"]|['"]$/g, '');
                    // Truncate long descriptions
                    if (description.length > 200) {
                        description = description.substring(0, 200) + '...';
                    }
                }
            }
            return {
                name,
                description,
                content,
                path: filePath
            };
        }
        catch (error) {
            console.error(`Error parsing skill file ${filePath}:`, error);
            return null;
        }
    }
    /**
     * Get all discovered skills
     */
    getSkills() {
        return Array.from(this.skills.values());
    }
    /**
     * Get a skill by name
     */
    getSkill(name) {
        return this.skills.get(name);
    }
    /**
     * Get skill count
     */
    getSkillCount() {
        return this.skills.size;
    }
    /**
     * Format skills list for display
     */
    formatSkillsList() {
        const skills = this.getSkills();
        if (skills.length === 0) {
            return `No skills found in your workspace.

**To add skills:**
1. Open the RAGENTS sidebar
2. Browse to Skills > Public or Skills > Custom
3. Click the download button on any skill

Skills will be saved to \`.github/skills/\` (Copilot) or \`.claude/commands/\` (Claude Code) in your workspace.`;
        }
        let output = `## Available Skills (${skills.length})\n\n`;
        for (const skill of skills) {
            output += `### ${skill.name}\n`;
            output += `${skill.description}\n\n`;
            output += `> Use with: \`@ragents /use ${skill.name}\`\n\n`;
        }
        return output;
    }
}
exports.SkillsManager = SkillsManager;
//# sourceMappingURL=skillsManager.js.map