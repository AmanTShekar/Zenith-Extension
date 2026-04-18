"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROMPT_TOO_LONG_ERROR = void 0;
exports.isPromptTooLongError = isPromptTooLongError;
exports.PROMPT_TOO_LONG_ERROR = `Our conversation memory is full. Please start a new chat to continue.`;
function isPromptTooLongError(content) {
    return (content.includes('invalid_request_error') &&
        (content.includes('prompt is too long') || content.includes('exceed context limit')));
}
//# sourceMappingURL=helpers.js.map