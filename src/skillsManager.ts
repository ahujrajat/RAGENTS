import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface Skill {
    name: string;
    description: string;
    content: string;
    path: string;
}

/**
 * Discovers and loads skills from the workspace's .github/skills directory
 */
export class SkillsManager {
    private skills: Map<string, Skill> = new Map();

    constructor() {
        this.refreshSkills();
    }

    /**
     * Refresh the list of discovered skills from the workspace
     */
    refreshSkills(): void {
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

    private discoverSkillsInDir(dirPath: string): void {
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
        } catch (error) {
            console.error('Error discovering skills:', error);
        }
    }

    private discoverClaudeCommands(dirPath: string): void {
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
        } catch (error) {
            console.error('Error discovering Claude commands:', error);
        }
    }

    private parseSkillFile(filePath: string, folderName: string): Skill | null {
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
        } catch (error) {
            console.error(`Error parsing skill file ${filePath}:`, error);
            return null;
        }
    }

    /**
     * Get all discovered skills
     */
    getSkills(): Skill[] {
        return Array.from(this.skills.values());
    }

    /**
     * Get a skill by name
     */
    getSkill(name: string): Skill | undefined {
        return this.skills.get(name);
    }

    /**
     * Get skill count
     */
    getSkillCount(): number {
        return this.skills.size;
    }

    /**
     * Format skills list for display
     */
    formatSkillsList(): string {
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
