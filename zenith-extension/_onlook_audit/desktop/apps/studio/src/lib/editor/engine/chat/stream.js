"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamResolver = void 0;
const constants_1 = require("@onlook/models/constants");
const mobx_1 = require("mobx");
class StreamResolver {
    content = [];
    requestId = null;
    errorMessage = null;
    rateLimited = null;
    id = 'stream';
    constructor() {
        (0, mobx_1.makeAutoObservable)(this);
        this.listen();
    }
    listen() {
        window.api.on(constants_1.MainChannels.CHAT_STREAM_PARTIAL, (args) => {
            const { payload } = args;
            this.resolveContent(payload);
        });
    }
    resolveContent(payload) {
        const resolvedPart = this.resolveToolCallPart(payload);
        if (!resolvedPart) {
            return;
        }
        if (this.content.length === 0) {
            this.content.push(resolvedPart);
            return;
        }
        const lastPart = this.content[this.content.length - 1];
        // If the last part is a text part and the resolved part is also a text part, merge them
        if (lastPart.type === 'text' && resolvedPart.type === 'text') {
            const newLastPart = {
                ...lastPart,
                text: lastPart.text + resolvedPart.text,
            };
            this.content[this.content.length - 1] = newLastPart;
            return;
        }
        this.content.push(resolvedPart);
    }
    resolveToolCallPart(payload) {
        if (payload.type === 'tool-call' || payload.type === 'tool-result') {
            return payload;
        }
        else if (payload.type === 'text-delta') {
            const textPart = {
                type: 'text',
                text: payload.textDelta,
            };
            return textPart;
        }
        return null;
    }
    clearBeforeSend() {
        this.content = [];
        this.requestId = null;
        this.rateLimited = null;
        this.errorMessage = null;
    }
    clearRateLimited() {
        this.rateLimited = null;
    }
    clearErrorMessage() {
        this.errorMessage = null;
    }
    clearAfterSend() {
        this.content = [];
    }
    dispose() {
        this.content = [];
        this.requestId = null;
        this.rateLimited = null;
        this.errorMessage = null;
    }
}
exports.StreamResolver = StreamResolver;
//# sourceMappingURL=stream.js.map