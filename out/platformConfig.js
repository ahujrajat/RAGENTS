"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLATFORMS = void 0;
exports.resolveTargetPlatform = resolveTargetPlatform;
const vscode = require("vscode");
exports.PLATFORMS = {
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
            const map = {
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
async function resolveTargetPlatform() {
    const setting = vscode.workspace.getConfiguration('ragents').get('targetPlatform', 'ask');
    if (setting === 'copilot' || setting === 'claudeCode') {
        return setting;
    }
    const choice = await vscode.window.showQuickPick([
        { label: 'GitHub Copilot', description: 'Save to .github/', id: 'copilot' },
        { label: 'Claude Code', description: 'Save to .claude/', id: 'claudeCode' },
    ], { placeHolder: 'Select target AI platform' });
    return choice?.id;
}
//# sourceMappingURL=platformConfig.js.map