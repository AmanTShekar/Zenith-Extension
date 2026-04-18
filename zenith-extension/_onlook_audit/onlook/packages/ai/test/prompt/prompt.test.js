"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("@onlook/models");
const bun_test_1 = require("bun:test");
const path_1 = __importDefault(require("path"));
const classes_1 = require("../../src/contexts/classes");
const provider_1 = require("../../src/prompt/provider");
const __dirname = import.meta.dir;
(0, bun_test_1.describe)('Prompt', () => {
    // Set to true to update the data files
    const SHOULD_UPDATE_DATA = true;
    const SHOULD_WRITE_SYSTEM = SHOULD_UPDATE_DATA;
    const SHOULD_WRITE_USER_MESSAGE = SHOULD_UPDATE_DATA;
    const SHOULD_WRITE_FILE_CONTENT = SHOULD_UPDATE_DATA;
    const SHOULD_WRITE_HIGHLIGHTS = SHOULD_UPDATE_DATA;
    const SHOULD_WRITE_SUMMARY = SHOULD_UPDATE_DATA;
    const SHOULD_WRITE_CREATE_PAGE_SYSTEM = SHOULD_UPDATE_DATA;
    (0, bun_test_1.test)('System prompt should be the same', async () => {
        const systemPath = path_1.default.resolve(__dirname, './data/system.txt');
        const prompt = (0, provider_1.getSystemPrompt)();
        if (SHOULD_WRITE_SYSTEM) {
            await Bun.write(systemPath, prompt);
        }
        const existing = await Bun.file(systemPath).text();
        (0, bun_test_1.expect)(prompt).toEqual(existing);
    });
    (0, bun_test_1.test)('User message should be the same', async () => {
        const userMessagePath = path_1.default.resolve(__dirname, './data/user.txt');
        const options = {
            totalMessages: 1,
            currentMessageIndex: 0,
            lastUserMessageIndex: 0,
            lastAssistantMessageIndex: 0,
        };
        const message = (0, provider_1.getHydratedUserMessage)('test', [{ type: 'text', text: 'test' }], [
            {
                path: 'test.txt',
                content: 'test',
                type: models_1.MessageContextType.FILE,
                displayName: 'test.txt',
                branchId: 'test',
            },
            {
                path: 'test.txt',
                start: 1,
                end: 2,
                content: 'test',
                type: models_1.MessageContextType.HIGHLIGHT,
                displayName: 'test.txt',
                branchId: 'test',
            },
            {
                content: 'test',
                type: models_1.MessageContextType.ERROR,
                displayName: 'test',
                branchId: 'test',
            },
            {
                path: 'test-rule.md',
                type: models_1.MessageContextType.AGENT_RULE,
                displayName: 'test',
                content: '',
            },
        ], options);
        const prompt = message.parts[0]?.type === 'text' ? message.parts[0].text : '';
        if (SHOULD_WRITE_USER_MESSAGE) {
            await Bun.write(userMessagePath, prompt);
        }
        const existing = await Bun.file(userMessagePath).text();
        (0, bun_test_1.expect)(prompt).toEqual(existing);
    });
    (0, bun_test_1.test)('User empty message should be the same', async () => {
        const userMessagePath = path_1.default.resolve(__dirname, './data/user-empty.txt');
        const options = {
            totalMessages: 1,
            currentMessageIndex: 0,
            lastUserMessageIndex: 0,
            lastAssistantMessageIndex: 0,
        };
        const message = (0, provider_1.getHydratedUserMessage)('test', [], [], options);
        const prompt = message.parts[0]?.type === 'text' ? message.parts[0].text : '';
        if (SHOULD_WRITE_USER_MESSAGE) {
            await Bun.write(userMessagePath, prompt);
        }
        const existing = await Bun.file(userMessagePath).text();
        (0, bun_test_1.expect)(prompt).toEqual(existing);
    });
    (0, bun_test_1.test)('File content should be the same', async () => {
        const fileContentPath = path_1.default.resolve(__dirname, './data/file.txt');
        const prompt = classes_1.FileContext.getFilesContent([
            {
                path: 'test.txt',
                content: 'test',
                type: models_1.MessageContextType.FILE,
                displayName: 'test.txt',
                branchId: 'test',
            },
            {
                path: 'test2.txt',
                content: 'test2',
                type: models_1.MessageContextType.FILE,
                displayName: 'test2.txt',
                branchId: 'test',
            },
        ], [
            {
                path: 'test.txt',
                start: 1,
                end: 2,
                content: 'test',
                type: models_1.MessageContextType.HIGHLIGHT,
                displayName: 'test.txt',
                branchId: 'test',
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
        const prompt = classes_1.HighlightContext.getHighlightsContent('test.txt', [
            {
                path: 'test.txt',
                start: 1,
                end: 2,
                content: 'test',
                type: models_1.MessageContextType.HIGHLIGHT,
                displayName: 'test.txt',
                branchId: 'test',
            },
            {
                path: 'test.txt',
                start: 3,
                end: 4,
                content: 'test2',
                type: models_1.MessageContextType.HIGHLIGHT,
                displayName: 'test.txt',
                branchId: 'test',
            },
        ], 'test');
        if (SHOULD_WRITE_HIGHLIGHTS) {
            await Bun.write(highlightsPath, prompt);
        }
        const existing = await Bun.file(highlightsPath).text();
        (0, bun_test_1.expect)(prompt).toEqual(existing);
    });
    (0, bun_test_1.test)('Summary prompt should be the same', async () => {
        const summaryPath = path_1.default.resolve(__dirname, './data/summary.txt');
        const prompt = (0, provider_1.getSummaryPrompt)();
        if (SHOULD_WRITE_SUMMARY) {
            await Bun.write(summaryPath, prompt);
        }
        const existing = await Bun.file(summaryPath).text();
        (0, bun_test_1.expect)(prompt).toEqual(existing);
    });
    (0, bun_test_1.test)('Create page system prompt should be the same', async () => {
        const createPageSystemPath = path_1.default.resolve(__dirname, './data/create-page-system.txt');
        const prompt = (0, provider_1.getCreatePageSystemPrompt)();
        if (SHOULD_WRITE_CREATE_PAGE_SYSTEM) {
            await Bun.write(createPageSystemPath, prompt);
        }
        const existing = await Bun.file(createPageSystemPath).text();
        (0, bun_test_1.expect)(prompt).toEqual(existing);
    });
});
//# sourceMappingURL=prompt.test.js.map