"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RagentItem = exports.RagentsProvider = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
class RagentsProvider {
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!this.workspaceRoot) {
            return Promise.resolve([]);
        }
        const resourcesPath = path.join(this.workspaceRoot, 'resources');
        if (element) {
            // Level 2: Inside Category (e.g., Agents), list Sub-Categories (Public/Custom)
            if (element.contextValue === 'category') {
                return Promise.resolve(this.getItemsInDir(path.join(resourcesPath, element.label), vscode.TreeItemCollapsibleState.Collapsed, 'subcategory'));
            }
            // Level 3: Inside Sub-Category (e.g., Public), list Files
            if (element.contextValue === 'subcategory') {
                // element.resourcePath points to .../Category/SubCategory
                return Promise.resolve(this.getItemsInDir(element.resourcePath, vscode.TreeItemCollapsibleState.None, 'file'));
            }
            return Promise.resolve([]);
        }
        else {
            // Level 1: List Categories (Agents, Instructions, Prompts, Skills)
            return Promise.resolve(this.getItemsInDir(resourcesPath, vscode.TreeItemCollapsibleState.Collapsed, 'category'));
        }
    }
    getItemsInDir(dirPath, collapsibleState, type) {
        if (this.pathExists(dirPath)) {
            const dirents = fs.readdirSync(dirPath, { withFileTypes: true });
            return dirents.map(dirent => {
                const name = dirent.name;
                const isDir = dirent.isDirectory();
                if (name.startsWith('.') || name === 'icon.svg')
                    return null;
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
                    let item;
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
                    }
                    else {
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
            }).filter((item) => item !== null);
        }
        return [];
    }
    pathExists(p) {
        try {
            fs.accessSync(p);
        }
        catch (err) {
            return false;
        }
        return true;
    }
}
exports.RagentsProvider = RagentsProvider;
class RagentItem extends vscode.TreeItem {
    constructor(label, collapsibleState, contextValue) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.contextValue = contextValue;
        this.tooltip = this.label;
        if (contextValue === 'file' || contextValue === 'public-file') {
            this.iconPath = new vscode.ThemeIcon('file-code');
        }
        else if (contextValue.includes('skill-container')) {
            this.iconPath = new vscode.ThemeIcon('package');
        }
        else {
            this.iconPath = new vscode.ThemeIcon('folder');
        }
    }
}
exports.RagentItem = RagentItem;
//# sourceMappingURL=ragentsProvider.js.map