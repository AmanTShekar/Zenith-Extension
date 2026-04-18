"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatCodeManager = void 0;
const utils_1 = require("@/lib/utils");
const ai_1 = require("@onlook/ai");
const chat_1 = require("@onlook/models/chat");
const constants_1 = require("@onlook/models/constants");
const use_toast_1 = require("@onlook/ui/use-toast");
const sdk_1 = require("@trainloop/sdk");
const mobx_1 = require("mobx");
class ChatCodeManager {
    chat;
    editorEngine;
    projectsManager;
    processor;
    constructor(chat, editorEngine, projectsManager) {
        this.chat = chat;
        this.editorEngine = editorEngine;
        this.projectsManager = projectsManager;
        (0, mobx_1.makeAutoObservable)(this);
        this.processor = new ai_1.CodeBlockProcessor();
    }
    async applyCode(messageId) {
        const message = this.chat.conversation.current?.getMessageById(messageId);
        if (!message) {
            console.error('No message found with id', messageId);
            return;
        }
        if (message.role !== chat_1.ChatMessageRole.ASSISTANT) {
            console.error('Can only apply code to assistant messages');
            return;
        }
        const fileToCodeBlocks = this.getFileToCodeBlocks(message);
        let applySuccess = true;
        for (const [file, codeBlocks] of fileToCodeBlocks) {
            // If file doesn't exist, we'll assume it's a new file and create it
            const originalContent = (await this.editorEngine.code.getFileContent(file, false)) || '';
            if (originalContent == null) {
                console.error('Failed to get file content', file);
                continue;
            }
            let content = originalContent;
            for (const block of codeBlocks) {
                const result = await this.processor.applyDiff(content, block.content);
                if (!result.success) {
                    applySuccess = false;
                    console.error('Failed to apply code block', block);
                    (0, use_toast_1.toast)({
                        title: 'Failed to apply code block',
                        variant: 'destructive',
                        description: 'Please try again or prompt the AI to fix it.',
                    });
                }
                content = result.text;
            }
            const success = await this.writeFileContent(file, content, originalContent);
            if (!success) {
                console.error('Failed to write file content');
                continue;
            }
            message.applied = true;
            message.snapshots[file] = {
                path: file,
                original: originalContent,
                generated: content,
            };
            this.chat.conversation.current?.updateMessage(message);
            this.chat.conversation.saveConversationToStorage();
        }
        const selectedWebviews = this.editorEngine.webviews.selected;
        for (const webview of selectedWebviews) {
            await this.editorEngine.ast.refreshAstDoc(webview);
        }
        this.chat.suggestions.shouldHide = false;
        this.saveApplyResult(message, applySuccess ? sdk_1.SampleFeedbackType.GOOD : sdk_1.SampleFeedbackType.BAD);
        setTimeout(() => {
            this.editorEngine.webviews.reloadWebviews();
            this.editorEngine.errors.clear();
        }, 500);
        (0, utils_1.sendAnalytics)('apply code change');
    }
    saveApplyResult(message, type) {
        (0, utils_1.invokeMainChannel)(constants_1.MainChannels.SAVE_APPLY_RESULT, { type, messages: [message] });
    }
    async revertCode(messageId) {
        const message = this.chat.conversation.current?.getMessageById(messageId);
        if (!message) {
            console.error('No message found with id', messageId);
            return;
        }
        if (message.role !== chat_1.ChatMessageRole.ASSISTANT) {
            console.error('Can only revert code to assistant messages');
            return;
        }
        if (!message.applied) {
            console.error('Code is not applied');
            return;
        }
        for (const [file, snapshot] of Object.entries(message.snapshots)) {
            const success = await this.writeFileContent(file, snapshot.original, snapshot.generated);
            if (!success) {
                console.error('Failed to revert code change');
                return;
            }
        }
        message.applied = false;
        this.chat.conversation.current?.updateMessage(message);
        this.chat.conversation.saveConversationToStorage();
        setTimeout(() => {
            this.editorEngine.webviews.reloadWebviews();
        }, 500);
        (0, utils_1.sendAnalytics)('revert code change');
    }
    async writeFileContent(path, content, originalContent) {
        const codeDiff = [
            {
                path: path,
                original: originalContent,
                generated: content,
            },
        ];
        this.editorEngine.code.runCodeDiffs(codeDiff);
        return true;
    }
    getFileToCodeBlocks(message) {
        // TODO: Need to handle failure cases
        const content = message.content;
        const contentString = typeof content === 'string'
            ? content
            : content.map((part) => (part.type === 'text' ? part.text : '')).join('');
        const codeBlocks = this.processor.extractCodeBlocks(contentString);
        const fileToCode = new Map();
        for (const codeBlock of codeBlocks) {
            if (!codeBlock.fileName) {
                continue;
            }
            fileToCode.set(codeBlock.fileName, [
                ...(fileToCode.get(codeBlock.fileName) ?? []),
                codeBlock,
            ]);
        }
        return fileToCode;
    }
    dispose() {
        // Clean up processor
        this.processor = null;
        // Clear references
        this.chat = null;
        this.editorEngine = null;
    }
}
exports.ChatCodeManager = ChatCodeManager;
//# sourceMappingURL=code.js.map