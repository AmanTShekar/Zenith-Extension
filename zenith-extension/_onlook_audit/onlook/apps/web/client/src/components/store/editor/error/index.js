"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorManager = void 0;
const utility_1 = require("@onlook/utility");
const mobx_1 = require("mobx");
class ErrorManager {
    branch;
    _errors = [];
    buffer;
    constructor(branch) {
        this.branch = branch;
        this.buffer = new utility_1.TerminalBuffer(20);
        this.buffer.onError((lines) => {
            // Add all error lines to error state
            lines.forEach((line) => {
                if (!(0, utility_1.shouldIgnoreMessage)(line) && (0, utility_1.isErrorMessage)(line)) {
                    this.addError(line);
                }
            });
        });
        this.buffer.onSuccess(() => {
            this.handleSuccess('Success detected in buffer');
        });
        (0, mobx_1.makeAutoObservable)(this);
    }
    get errors() {
        return this._errors;
    }
    processMessage(message) {
        // Always add to buffer, which will handle error/success detection
        this.buffer.addLine(message);
    }
    addError(message) {
        const error = {
            sourceId: 'Dev Server Error (CLI)',
            type: 'terminal',
            content: message,
            branchId: this.branch.id,
            branchName: this.branch.name,
        };
        const existingErrors = this._errors || [];
        if (!existingErrors.some((e) => (0, utility_1.compareErrors)(e, error))) {
            this._errors = [...existingErrors, error];
        }
    }
    addCodeApplicationError(message, metadata) {
        const sourceId = 'Write Code Error';
        const content = `Failed to apply code block with error: ${message}. The intended action metadata was: ${JSON.stringify(metadata)}`;
        const error = {
            sourceId,
            type: 'apply-code',
            content,
            branchId: this.branch.id,
            branchName: this.branch.name,
        };
        const existingErrors = this._errors || [];
        const isDuplicate = existingErrors.some((e) => (0, utility_1.compareErrors)(e, error));
        if (!isDuplicate) {
            this._errors = [...existingErrors, error];
        }
    }
    handleSuccess(message) {
        this.clear();
    }
    clear() {
        this._errors = [];
    }
}
exports.ErrorManager = ErrorManager;
//# sourceMappingURL=index.js.map