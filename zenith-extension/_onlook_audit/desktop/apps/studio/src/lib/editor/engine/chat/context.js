"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatContext = void 0;
const chat_1 = require("@onlook/models/chat");
const mobx_1 = require("mobx");
class ChatContext {
    editorEngine;
    projectsManager;
    context = [];
    constructor(editorEngine, projectsManager) {
        this.editorEngine = editorEngine;
        this.projectsManager = projectsManager;
        (0, mobx_1.makeAutoObservable)(this);
        (0, mobx_1.reaction)(() => this.editorEngine.elements.selected, () => this.getChatContext().then((context) => (this.context = context)));
        (0, mobx_1.reaction)(() => this.projectsManager.project?.folderPath, (folderPath) => {
            if (folderPath) {
                this.getChatContext().then((context) => (this.context = context));
            }
        });
    }
    async getChatContext() {
        const selected = this.editorEngine.elements.selected;
        const fileNames = new Set();
        let highlightedContext = [];
        if (selected.length) {
            highlightedContext = await this.getHighlightedContext(selected, fileNames);
        }
        const fileContext = await this.getFileContext(fileNames);
        const imageContext = await this.getImageContext();
        const projectContext = await this.getProjectContext();
        const context = [...fileContext, ...highlightedContext, ...imageContext, ...projectContext];
        return context;
    }
    async getImageContext() {
        const imageContext = this.context.filter((context) => context.type === chat_1.MessageContextType.IMAGE);
        return imageContext;
    }
    async getFileContext(fileNames) {
        const fileContext = [];
        for (const fileName of fileNames) {
            const fileContent = await this.editorEngine.code.getFileContent(fileName, false);
            if (fileContent === null) {
                continue;
            }
            fileContext.push({
                type: chat_1.MessageContextType.FILE,
                displayName: fileName,
                path: fileName,
                content: fileContent,
            });
        }
        return fileContext;
    }
    async getHighlightedContext(selected, fileNames) {
        const highlightedContext = [];
        for (const node of selected) {
            const oid = node.oid;
            if (!oid) {
                continue;
            }
            const codeBlock = await this.editorEngine.code.getCodeBlock(oid, true);
            if (codeBlock === null) {
                continue;
            }
            const templateNode = await this.editorEngine.ast.getTemplateNodeById(oid);
            if (!templateNode) {
                continue;
            }
            highlightedContext.push({
                type: chat_1.MessageContextType.HIGHLIGHT,
                displayName: node.tagName.toLowerCase(),
                path: templateNode.path,
                content: codeBlock,
                start: templateNode.startTag.start.line,
                end: templateNode.endTag?.end.line || templateNode.startTag.start.line,
            });
            fileNames.add(templateNode.path);
        }
        return highlightedContext;
    }
    clear() {
        this.context = [];
    }
    async addScreenshotContext() {
        const screenshot = await this.getScreenshotContext();
        if (screenshot) {
            this.context.push(screenshot);
        }
    }
    async getScreenshotContext() {
        if (this.editorEngine.elements.selected.length === 0) {
            return null;
        }
        const webviewId = this.editorEngine.elements.selected[0].webviewId;
        if (!webviewId) {
            return null;
        }
        const timestamp = Date.now();
        const screenshotName = `chat-screenshot-${timestamp}`;
        try {
            const result = await this.editorEngine.takeWebviewScreenshot(screenshotName, webviewId);
            if (!result || !result.image) {
                console.error('Failed to capture screenshot');
                return null;
            }
            const { image } = result;
            return {
                type: chat_1.MessageContextType.IMAGE,
                content: image,
                mimeType: 'image/png',
                displayName: 'screen',
            };
        }
        catch (error) {
            console.error('Failed to capture screenshot:', error);
            return null;
        }
    }
    getProjectContext() {
        const folderPath = this.projectsManager.project?.folderPath;
        if (!folderPath) {
            return [];
        }
        return [
            {
                type: chat_1.MessageContextType.PROJECT,
                content: '',
                displayName: 'Project',
                path: folderPath,
            },
        ];
    }
    getMessageContext(errors) {
        const content = errors
            .map((e) => `Source: ${e.sourceId}\nContent: ${e.content}\n`)
            .join('\n');
        return [
            {
                type: chat_1.MessageContextType.ERROR,
                content,
                displayName: 'Error',
            },
        ];
    }
    async clearAttachments() {
        this.context = this.context.filter((context) => context.type !== chat_1.MessageContextType.IMAGE);
    }
    dispose() {
        // Clear context
        this.clear();
        // Clear references
        this.editorEngine = null;
    }
}
exports.ChatContext = ChatContext;
//# sourceMappingURL=context.js.map