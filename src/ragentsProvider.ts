import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class RagentsProvider implements vscode.TreeDataProvider<RagentItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<RagentItem | undefined | null | void> = new vscode.EventEmitter<RagentItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<RagentItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private workspaceRoot: string) { }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: RagentItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: RagentItem): Thenable<RagentItem[]> {
        if (!this.workspaceRoot) {
            return Promise.resolve([]);
        }

        const resourcesPath = path.join(this.workspaceRoot, 'resources');

        if (element) {
            // Level 2: Inside Category (e.g., Agents), list Sub-Categories (Public/Custom)
            if (element.contextValue === 'category') {
                return Promise.resolve(this.getItemsInDir(path.join(resourcesPath, element.label as string), vscode.TreeItemCollapsibleState.Collapsed, 'subcategory'));
            }
            // Level 3: Inside Sub-Category (e.g., Public), list Files
            if (element.contextValue === 'subcategory') {
                // element.resourcePath points to .../Category/SubCategory
                return Promise.resolve(this.getItemsInDir(element.resourcePath!, vscode.TreeItemCollapsibleState.None, 'file'));
            }
            return Promise.resolve([]);
        } else {
            // Level 1: List Categories (Agents, Instructions, Prompts, Skills)
            return Promise.resolve(this.getItemsInDir(resourcesPath, vscode.TreeItemCollapsibleState.Collapsed, 'category'));
        }
    }

    private getItemsInDir(dirPath: string, collapsibleState: vscode.TreeItemCollapsibleState, type: 'category' | 'subcategory' | 'file'): RagentItem[] {
        if (this.pathExists(dirPath)) {
            const dirents = fs.readdirSync(dirPath, { withFileTypes: true });
            return dirents.map(dirent => {
                const name = dirent.name;
                const isDir = dirent.isDirectory();

                if (name.startsWith('.') || name === 'icon.svg') return null;

                if (type === 'category' && isDir) {
                    const item = new RagentItem(name, vscode.TreeItemCollapsibleState.Collapsed, 'category');
                    item.resourcePath = path.join(dirPath, name);
                    return item;
                }

                if (type === 'subcategory' && isDir) {
                    const item = new RagentItem(name, vscode.TreeItemCollapsibleState.Collapsed, 'subcategory');
                    item.resourcePath = path.join(dirPath, name);
                    return item;
                }

                if (type === 'file') {
                    // It's a leaf node in the tree (file or skill folder)
                    let contextValue = 'file';
                    let item: RagentItem;

                    if (isDir) {
                        // It's a Skill Directory
                        contextValue = 'skill-container';
                        if (dirPath.includes('Public')) {
                            contextValue = 'public-skill-container';
                        }
                        item = new RagentItem(name, vscode.TreeItemCollapsibleState.None, contextValue);
                        item.resourcePath = path.join(dirPath, name);

                        // For preview, point to SKILL.md inside
                        item.command = {
                            command: 'ragents.preview',
                            title: 'Preview',
                            arguments: [path.join(item.resourcePath, 'SKILL.md'), contextValue === 'public-skill-container']
                        };
                    } else {
                        // It's a regular file
                        if (dirPath.includes('Public')) {
                            contextValue = 'public-file';
                        }
                        item = new RagentItem(name, vscode.TreeItemCollapsibleState.None, contextValue);
                        item.resourcePath = path.join(dirPath, name);

                        item.command = {
                            command: 'ragents.preview',
                            title: 'Preview',
                            arguments: [item.resourcePath, contextValue === 'public-file']
                        };
                    }
                    return item;
                }
                return null;
            }).filter((item): item is RagentItem => item !== null);
        }
        return [];
    }

    private pathExists(p: string): boolean {
        try {
            fs.accessSync(p);
        } catch (err) {
            return false;
        }
        return true;
    }
}

export class RagentItem extends vscode.TreeItem {
    public resourcePath?: string;

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly contextValue: string
    ) {
        super(label, collapsibleState);
        this.tooltip = this.label;
        if (contextValue === 'file' || contextValue === 'public-file') {
            this.iconPath = new vscode.ThemeIcon('file-code');
        } else if (contextValue.includes('skill-container')) {
            this.iconPath = new vscode.ThemeIcon('package');
        } else {
            this.iconPath = new vscode.ThemeIcon('folder');
        }
    }
}
