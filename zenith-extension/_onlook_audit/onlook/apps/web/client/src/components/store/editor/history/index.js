"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryManager = void 0;
const utility_1 = require("@onlook/utility");
const mobx_1 = require("mobx");
const helpers_1 = require("./helpers");
var TransactionType;
(function (TransactionType) {
    TransactionType["IN_TRANSACTION"] = "in-transaction";
    TransactionType["NOT_IN_TRANSACTION"] = "not-in-transaction";
})(TransactionType || (TransactionType = {}));
class HistoryManager {
    editorEngine;
    undoStack;
    redoStack;
    inTransaction;
    constructor(editorEngine, undoStack = [], redoStack = [], inTransaction = { type: TransactionType.NOT_IN_TRANSACTION }) {
        this.editorEngine = editorEngine;
        this.undoStack = undoStack;
        this.redoStack = redoStack;
        this.inTransaction = inTransaction;
        (0, mobx_1.makeAutoObservable)(this);
    }
    get canUndo() {
        return this.undoStack.length > 0;
    }
    get canRedo() {
        return this.redoStack.length > 0;
    }
    get isInTransaction() {
        return this.inTransaction.type === TransactionType.IN_TRANSACTION;
    }
    get length() {
        return this.undoStack.length;
    }
    startTransaction = () => {
        this.inTransaction = { type: TransactionType.IN_TRANSACTION, actions: [] };
    };
    commitTransaction = async () => {
        if (this.inTransaction.type === TransactionType.NOT_IN_TRANSACTION ||
            this.inTransaction.actions.length === 0) {
            this.inTransaction = { type: TransactionType.NOT_IN_TRANSACTION };
            return;
        }
        const actionsToCommit = this.inTransaction.actions;
        this.inTransaction = { type: TransactionType.NOT_IN_TRANSACTION };
        for (const action of actionsToCommit) {
            await this.push(action);
        }
    };
    push = async (action) => {
        if (this.inTransaction.type === TransactionType.IN_TRANSACTION) {
            this.inTransaction.actions = (0, helpers_1.updateTransactionActions)(this.inTransaction.actions, action);
            return;
        }
        if (this.redoStack.length > 0) {
            this.redoStack = [];
        }
        this.undoStack.push(action);
        await this.editorEngine.code.write(action);
        switch (action.type) {
            case 'update-style':
                this.editorEngine.posthog.capture('style_action', {
                    style: (0, utility_1.jsonClone)(action.targets.length > 0 ? action.targets[0]?.change.updated : {}),
                });
                break;
            case 'insert-element':
                this.editorEngine.posthog.capture('insert_action');
                break;
            case 'move-element':
                this.editorEngine.posthog.capture('move_action');
                break;
            case 'remove-element':
                this.editorEngine.posthog.capture('remove_action');
                break;
            case 'edit-text':
                this.editorEngine.posthog.capture('edit_text_action');
        }
    };
    undo = () => {
        if (this.inTransaction.type === TransactionType.IN_TRANSACTION) {
            this.commitTransaction();
        }
        const top = this.undoStack.pop();
        if (top == null) {
            return null;
        }
        const action = (0, helpers_1.undoAction)(top);
        this.redoStack.push(top);
        return action;
    };
    redo = () => {
        if (this.inTransaction.type === TransactionType.IN_TRANSACTION) {
            this.commitTransaction();
        }
        const top = this.redoStack.pop();
        if (top == null) {
            return null;
        }
        const action = (0, helpers_1.transformRedoAction)(top);
        this.undoStack.push(action);
        return action;
    };
    clear = () => {
        this.undoStack = [];
        this.redoStack = [];
    };
}
exports.HistoryManager = HistoryManager;
//# sourceMappingURL=index.js.map