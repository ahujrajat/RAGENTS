import * as vscode from 'vscode';

export type PlatformId = 'copilot' | 'claudeCode';

export interface PlatformConfig {
    label: string;
    baseDir: string;
    categoryDir: (category: string) => string;
    adaptFileName: (fileName: string, category: string) => string;
}

export const PLATFORMS: Record<PlatformId, PlatformConfig> = {
    copilot: {
        label: 'GitHub Copilot (.github/)',
        baseDir: '.github',
        categoryDir: (category) => category,
        adaptFileName: (fileName, _category) => fileName,
    },
    claudeCode: {
        label: 'Claude Code (.claude/)',
        baseDir: '.claude',
        categoryDir: (category) => {
            const map: Record<string, string> = {
                agents: 'agents',
                prompts: 'commands',
                instructions: '',
                skills: 'commands',
            };
            return map[category] ?? category;
        },
        adaptFileName: (fileName, category) => {
            if (category === 'agents') {
                return fileName.replace(/\.agent\.md$/, '.md');
            }
            if (category === 'prompts') {
                return fileName.replace(/\.prompt\.md$/, '.md');
            }
            if (category === 'instructions') {
                return fileName.replace(/\.instructions\.md$/, '.md');
            }
            return fileName;
        },
    },
};

export async function resolveTargetPlatform(): Promise<PlatformId | undefined> {
    const setting = vscode.workspace.getConfiguration('ragents').get<string>('targetPlatform', 'ask');

    if (setting === 'copilot' || setting === 'claudeCode') {
        return setting;
    }

    const choice = await vscode.window.showQuickPick(
        [
            { label: 'GitHub Copilot', description: 'Save to .github/', id: 'copilot' as PlatformId },
            { label: 'Claude Code', description: 'Save to .claude/', id: 'claudeCode' as PlatformId },
        ],
        { placeHolder: 'Select target AI platform' }
    );

    return choice?.id;
}
