"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MOCK_CHAT_MESSAGES = exports.MOCK_STREAMING_ASSISTANT_MSG = exports.GREETING_MSG = void 0;
const example_1 = require("@onlook/ai/src/prompt/edit/example");
const chat_1 = require("@onlook/models/chat");
const assistant_1 = require("./message/assistant");
const user_1 = require("./message/user");
exports.GREETING_MSG = new assistant_1.AssistantChatMessageImpl('Click on any element to chat with it. Try to be as detailed as possible for the best results!');
const MOCK_USER_MSG = new user_1.UserChatMessageImpl('Test message with some selected files', [
    {
        type: chat_1.MessageContextType.FILE,
        path: '/Users/kietho/workplace/onlook/test/test/app/page.tsx',
        content: 'export const Hello = 0;',
        displayName: 'page.tsx',
    },
    {
        type: chat_1.MessageContextType.HIGHLIGHT,
        path: 'path/to/file',
        content: 'export const Hello = 0;',
        displayName: 'Component',
        start: 1,
        end: 10,
    },
    {
        type: chat_1.MessageContextType.IMAGE,
        content: 'https://example.com/screenshot',
        mimeType: 'image/png',
        displayName: 'screenshot.png',
    },
]);
const MOCK_ASSISTANT_MSG = new assistant_1.AssistantChatMessageImpl(example_1.assistant1);
exports.MOCK_STREAMING_ASSISTANT_MSG = new assistant_1.AssistantChatMessageImpl(example_1.assistant2);
exports.MOCK_CHAT_MESSAGES = [exports.GREETING_MSG, MOCK_USER_MSG, MOCK_ASSISTANT_MSG];
//# sourceMappingURL=mockData.js.map