import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { RagentsProvider, RagentItem } from './ragentsProvider';
import { SkillsManager } from './skillsManager';
import { PLATFORMS, resolveTargetPlatform } from './platformConfig';

export function activate(context: vscode.ExtensionContext) {
    const rootPath = context.extensionPath;
    const ragentsProvider = new RagentsProvider(rootPath);

    vscode.window.registerTreeDataProvider('ragentsView', ragentsProvider);

    vscode.commands.registerCommand('ragents.refresh', () => ragentsProvider.refresh());

    vscode.commands.registerCommand('ragents.preview', async (filePath: string, isPublic: boolean) => {
        const fileUri = vscode.Uri.file(filePath);
        if (isPublic) {
            const content = fs.readFileSync(filePath, 'utf8');
            const warning = '> [!WARNING]\n> This content is public and obtained from the internet. Use with caution.\n\n';
            const doc = await vscode.workspace.openTextDocument({ content: warning + content, language: 'markdown' });
            vscode.window.showTextDocument(doc);
        } else {
            const doc = await vscode.workspace.openTextDocument(fileUri);
            vscode.window.showTextDocument(doc);
        }
    });

    vscode.commands.registerCommand('ragents.download', async (item: RagentItem) => {
        if (!item.resourcePath) { return; }

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('Please open a workspace to download agents.');
            return;
        }

        // Resolve target platform
        const platformId = await resolveTargetPlatform();
        if (!platformId) { return; }
        const platform = PLATFORMS[platformId];

        // Determine category from path parts
        const parts = item.resourcePath.split(path.sep);
        const resIndex = parts.indexOf('resources');
        let category = 'agents';

        if (resIndex !== -1 && parts.length > resIndex + 1) {
            const detectedCategory = parts[resIndex + 1].toLowerCase();
            if (['agents', 'prompts', 'instructions', 'skills'].includes(detectedCategory)) {
                category = detectedCategory;
            } else {
                category = detectedCategory;
            }
        }

        const wsRoot = workspaceFolders[0].uri.fsPath;

        // Special handling for Claude Code instructions
        if (platformId === 'claudeCode' && category === 'instructions') {
            const destChoice = await vscode.window.showQuickPick(
                [
                    { label: 'Append to CLAUDE.md', description: 'Add as section to project root CLAUDE.md' },
                    { label: 'Save to .claude/', description: 'Save as separate file in .claude/ directory' },
                ],
                { placeHolder: 'Where should this instruction be saved?' }
            );
            if (!destChoice) { return; }

            const originalFileName = path.basename(item.resourcePath);

            if (destChoice.label === 'Append to CLAUDE.md') {
                try {
                    const claudeMdPath = path.join(wsRoot, 'CLAUDE.md');
                    const content = fs.readFileSync(item.resourcePath, 'utf8');
                    const marker = `<!-- RAGENTS: ${originalFileName} -->`;
                    const separator = fs.existsSync(claudeMdPath) ? '\n\n---\n\n' : '';
                    fs.appendFileSync(claudeMdPath, separator + marker + '\n' + content);
                    vscode.window.showInformationMessage(`Appended ${originalFileName} to CLAUDE.md`);
                    const doc = await vscode.workspace.openTextDocument(claudeMdPath);
                    await vscode.window.showTextDocument(doc);
                } catch (error: any) {
                    vscode.window.showErrorMessage(`Error appending to CLAUDE.md: ${error.message}`);
                }
                return;
            }

            // Fall through: save to .claude/ as separate file
            const targetDir = path.join(wsRoot, '.claude');
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            const adaptedName = platform.adaptFileName(originalFileName, category);
            const destPath = path.join(targetDir, adaptedName);
            try {
                fs.copyFileSync(item.resourcePath, destPath);
                vscode.window.showInformationMessage(`Downloaded ${adaptedName} to .claude/`);
                const doc = await vscode.workspace.openTextDocument(destPath);
                await vscode.window.showTextDocument(doc);
            } catch (error: any) {
                vscode.window.showErrorMessage(`Error downloading item: ${error.message}`);
            }
            return;
        }

        // Standard path for all other categories
        const categorySubdir = platform.categoryDir(category);
        const targetDir = path.join(wsRoot, platform.baseDir, categorySubdir);

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const originalFileName = path.basename(item.resourcePath);
        const fileName = platform.adaptFileName(originalFileName, category);
        const destPath = path.join(targetDir, fileName);
        const displayPath = `${platform.baseDir}/${categorySubdir}/`;

        try {
            const stat = fs.lstatSync(item.resourcePath);

            if (stat.isDirectory()) {
                if (platformId === 'claudeCode') {
                    // Flatten skill directory: read SKILL.md, save as {name}.md
                    const skillMdPath = path.join(item.resourcePath, 'SKILL.md');
                    if (fs.existsSync(skillMdPath)) {
                        const content = fs.readFileSync(skillMdPath, 'utf8');
                        const flatFileName = originalFileName + '.md';
                        const flatDestPath = path.join(targetDir, flatFileName);

                        // Check for name collision
                        if (fs.existsSync(flatDestPath)) {
                            const overwrite = await vscode.window.showWarningMessage(
                                `"${flatFileName}" already exists in ${displayPath}. Overwrite?`,
                                'Overwrite', 'Cancel'
                            );
                            if (overwrite !== 'Overwrite') { return; }
                        }

                        fs.writeFileSync(flatDestPath, content);
                        vscode.window.showInformationMessage(
                            `Downloaded skill "${originalFileName}" to ${displayPath} as slash command.`
                        );
                        const doc = await vscode.workspace.openTextDocument(flatDestPath);
                        await vscode.window.showTextDocument(doc);
                    } else {
                        vscode.window.showErrorMessage(`Skill "${originalFileName}" has no SKILL.md file.`);
                    }
                } else {
                    // Copilot: recursive copy for directories (Skills)
                    copyRecursiveSync(item.resourcePath, destPath);

                    if (category === 'skills') {
                        const action = await vscode.window.showInformationMessage(
                            `Downloaded skill "${originalFileName}" to ${displayPath}. Run /skills reload in chat to make it available.`,
                            'Copy Command'
                        );
                        if (action === 'Copy Command') {
                            await vscode.env.clipboard.writeText('/skills reload');
                            vscode.window.showInformationMessage('Command copied! Paste in chat to reload skills.');
                        }
                    } else {
                        vscode.window.showInformationMessage(`Downloaded ${originalFileName} to ${displayPath}`);
                    }
                }
            } else {
                // Single file: check for name collision in Claude Code commands
                if (platformId === 'claudeCode' && (category === 'prompts' || category === 'skills') && fs.existsSync(destPath)) {
                    const overwrite = await vscode.window.showWarningMessage(
                        `"${fileName}" already exists in ${displayPath}. Overwrite?`,
                        'Overwrite', 'Cancel'
                    );
                    if (overwrite !== 'Overwrite') { return; }
                }

                if (item.contextValue === 'public-file') {
                    const content = fs.readFileSync(item.resourcePath, 'utf8');
                    const warning = '> [!WARNING]\n> This content is public and obtained from the internet. Use with caution.\n\n';
                    const hasDisclaimer = content.includes('> [!IMPORTANT]') || content.includes('> [!WARNING]');

                    if (!hasDisclaimer) {
                        fs.writeFileSync(destPath, warning + content);
                    } else {
                        fs.copyFileSync(item.resourcePath, destPath);
                    }
                } else {
                    fs.copyFileSync(item.resourcePath, destPath);
                }
                vscode.window.showInformationMessage(`Downloaded ${fileName} to ${displayPath}`);

                const doc = await vscode.workspace.openTextDocument(destPath);
                await vscode.window.showTextDocument(doc);
            }

        } catch (error: any) {
            vscode.window.showErrorMessage(`Error downloading item: ${error.message}`);
        }
    });

    // Initialize Skills Manager
    const skillsManager = new SkillsManager();

    // Register Chat Participant for @ragents
    const ragentsChat = vscode.chat.createChatParticipant('ragents.skills', async (request, context, response, token) => {
        const command = request.command;
        const prompt = request.prompt.trim();

        // Refresh skills on each request to pick up new downloads
        skillsManager.refreshSkills();

        if (command === 'list' || (!command && !prompt)) {
            // List all available skills
            response.markdown(skillsManager.formatSkillsList());
            return;
        }

        if (command === 'use') {
            // Parse: first word is skill name, rest is user query
            const parts = prompt.split(/\s+/);
            const skillName = parts[0];
            const userQuery = parts.slice(1).join(' ');

            if (!skillName) {
                response.markdown('Please specify a skill name. Example: `@ragents /use git-commit describe my changes`\n\n' + skillsManager.formatSkillsList());
                return;
            }

            const skill = skillsManager.getSkill(skillName);

            if (!skill) {
                response.markdown(`Skill "${skillName}" not found.\n\n` + skillsManager.formatSkillsList());
                return;
            }

            // If no user query provided, show skill info and prompt for request
            if (!userQuery) {
                response.markdown(`## Skill: ${skill.name}\n\n**${skill.description}**\n\n---\n\n**Usage:** \`@ragents /use ${skill.name} <your request>\`\n\nExample: \`@ragents /use ${skill.name} help me with my current task\``);
                return;
            }

            // Use the Language Model to process the skill with user's request
            try {
                const [model] = await vscode.lm.selectChatModels({ vendor: 'copilot', family: 'gpt-4o' });

                if (!model) {
                    // Fallback: show skill content with the request
                    response.markdown(`## Using Skill: ${skill.name}\n\n**Your request:** ${userQuery}\n\n---\n\n**Skill instructions to follow:**\n\n${skill.content}`);
                    return;
                }

                // Build messages with skill as system context
                const messages = [
                    vscode.LanguageModelChatMessage.User(`You are an AI assistant. Follow these skill instructions carefully to help the user:\n\n${skill.content}\n\n---\n\nUser's request: ${userQuery}`)
                ];

                const chatResponse = await model.sendRequest(messages, {}, token);

                // Stream the response
                for await (const fragment of chatResponse.text) {
                    response.markdown(fragment);
                }
            } catch (error: any) {
                // Fallback if LM not available
                response.markdown(`## Using Skill: ${skill.name}\n\n**Your request:** ${userQuery}\n\n---\n\n**Skill instructions:**\n\n${skill.content}\n\n*Note: Please apply these instructions to fulfill the request.*`);
            }
            return;
        }

        // Default: show help
        response.markdown('Use `@ragents /list` to see available skills, or `@ragents /use <skill-name> <your request>` to use a skill.');
    });

    ragentsChat.iconPath = vscode.Uri.joinPath(context.extensionUri, 'resources', 'icon.svg');
    context.subscriptions.push(ragentsChat);
}

function copyRecursiveSync(src: string, dest: string) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = stats && stats.isDirectory();
    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }
        fs.readdirSync(src).forEach((childItemName) => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

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

export function deactivate() { }
