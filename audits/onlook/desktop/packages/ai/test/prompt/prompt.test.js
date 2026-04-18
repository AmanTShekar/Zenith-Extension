"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chat_1 = require("@onlook/models/chat");
const bun_test_1 = require("bun:test");
const path_1 = __importDefault(require("path"));
const edit_1 = require("src/prompt/edit");
const provider_1 = require("../../src/prompt/provider");
const __dirname = import.meta.dir;
(0, bun_test_1.describe)('Prompt', () => {
    const SHOULD_WRITE_SYSTEM = false;
    const SHOULD_WRITE_EXAMPLES = false;
    const SHOULD_WRITE_USER_MESSAGE = false;
    const SHOULD_WRITE_FILE_CONTENT = false;
    const SHOULD_WRITE_HIGHLIGHTS = false;
    const SHOULD_WRITE_SUMMARY = false;
    const SHOULD_WRITE_CREATE_PAGE_SYSTEM = false;
    (0, bun_test_1.test)('System prompt should be the same', async () => {
        const systemPath = path_1.default.resolve(__dirname, './data/system.txt');
        const prompt = new provider_1.PromptProvider().getSystemPrompt('darwin');
        if (SHOULD_WRITE_SYSTEM) {
            await Bun.write(systemPath, prompt);
        }
        const existing = await Bun.file(systemPath).text();
        (0, bun_test_1.expect)(prompt).toEqual(existing);
    });
    (0, bun_test_1.test)('Examples should be the same', async () => {
        const examplesPath = path_1.default.resolve(__dirname, './data/examples.txt');
        const prompt = new provider_1.PromptProvider().getExampleConversation(edit_1.SEARCH_REPLACE_EXAMPLE_CONVERSATION);
        if (SHOULD_WRITE_EXAMPLES) {
            await Bun.write(examplesPath, prompt);
        }
        const existing = await Bun.file(examplesPath).text();
        (0, bun_test_1.expect)(prompt).toEqual(existing);
    });
    (0, bun_test_1.test)('User message should be the same', async () => {
        const userMessagePath = path_1.default.resolve(__dirname, './data/user.txt');
        const message = new provider_1.PromptProvider().getHydratedUserMessage('test', [
            {
                path: 'test.txt',
                content: 'test',
                type: chat_1.MessageContextType.FILE,
                displayName: 'test.txt',
            },
            {
                path: 'test.txt',
                start: 1,
                end: 2,
                content: 'test',
                type: chat_1.MessageContextType.HIGHLIGHT,
                displayName: 'test.txt',
            },
            {
                content: 'test',
                type: chat_1.MessageContextType.ERROR,
                displayName: 'test',
            },
            {
                path: 'test',
                type: chat_1.MessageContextType.PROJECT,
                displayName: 'test',
                content: '',
            },
        ]);
        const prompt = typeof message.content === 'string'
            ? message.content
            : message.content.map((c) => (c.type === 'text' ? c.text : '')).join('');
        if (SHOULD_WRITE_USER_MESSAGE) {
            await Bun.write(userMessagePath, prompt);
        }
        const existing = await Bun.file(userMessagePath).text();
        (0, bun_test_1.expect)(prompt).toEqual(existing);
    });
    (0, bun_test_1.test)('User empty message should be the same', async () => {
        const userMessagePath = path_1.default.resolve(__dirname, './data/user-empty.txt');
        const message = new provider_1.PromptProvider().getHydratedUserMessage('test', []);
        const prompt = typeof message.content === 'string'
            ? message.content
            : message.content.map((c) => (c.type === 'text' ? c.text : '')).join('');
        if (SHOULD_WRITE_USER_MESSAGE) {
            await Bun.write(userMessagePath, prompt);
        }
        const existing = await Bun.file(userMessagePath).text();
        (0, bun_test_1.expect)(prompt).toEqual(existing);
    });
    (0, bun_test_1.test)('File content should be the same', async () => {
        const fileContentPath = path_1.default.resolve(__dirname, './data/file.txt');
        const prompt = new provider_1.PromptProvider().getFilesContent([
            {
                path: 'test.txt',
                content: 'test',
                type: chat_1.MessageContextType.FILE,
                displayName: 'test.txt',
            },
            {
                path: 'test2.txt',
                content: 'test2',
                type: chat_1.MessageContextType.FILE,
                displayName: 'test2.txt',
            },
        ], [
            {
                path: 'test.txt',
                start: 1,
                end: 2,
                content: 'test',
                type: chat_1.MessageContextType.HIGHLIGHT,
                displayName: 'test.txt',
            },
        ]);
        if (SHOULD_WRITE_FILE_CONTENT) {
            await Bun.write(fileContentPath, prompt);
        }
        const existing = await Bun.file(fileContentPath).text();
        (0, bun_test_1.expect)(prompt).toEqual(existing);
    });
    (0, bun_test_1.test)('Highlights should be the same', async () => {
        const highlightsPath = path_1.default.resolve(__dirname, './data/highlights.txt');
        const prompt = new provider_1.PromptProvider().getHighlightsContent('test.txt', [
            {
                path: 'test.txt',
                start: 1,
                end: 2,
                content: 'test',
                type: chat_1.MessageContextType.HIGHLIGHT,
                displayName: 'test.txt',
            },
            {
                path: 'test.txt',
                start: 3,
                end: 4,
                content: 'test2',
                type: chat_1.MessageContextType.HIGHLIGHT,
                displayName: 'test.txt',
            },
        ]);
        if (SHOULD_WRITE_HIGHLIGHTS) {
            await Bun.write(highlightsPath, prompt);
        }
        const existing = await Bun.file(highlightsPath).text();
        (0, bun_test_1.expect)(prompt).toEqual(existing);
    });
    (0, bun_test_1.test)('Summary prompt should be the same', async () => {
        const summaryPath = path_1.default.resolve(__dirname, './data/summary.txt');
        const prompt = new provider_1.PromptProvider().getSummaryPrompt();
        if (SHOULD_WRITE_SUMMARY) {
            await Bun.write(summaryPath, prompt);
        }
        const existing = await Bun.file(summaryPath).text();
        (0, bun_test_1.expect)(prompt).toEqual(existing);
    });
    (0, bun_test_1.test)('Create page system prompt should be the same', async () => {
        const createPageSystemPath = path_1.default.resolve(__dirname, './data/create-page-system.txt');
        const prompt = new provider_1.PromptProvider().getCreatePageSystemPrompt();
        if (SHOULD_WRITE_CREATE_PAGE_SYSTEM) {
            await Bun.write(createPageSystemPath, prompt);
        }
        const existing = await Bun.file(createPageSystemPath).text();
        (0, bun_test_1.expect)(prompt).toEqual(existing);
    });
});
//# sourceMappingURL=prompt.test.js.map