"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdeManager = void 0;
const models_1 = require("@onlook/models");
const mobx_1 = require("mobx");
class IdeManager {
    editorEngine;
    _codeNavigationOverride = null;
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
        (0, mobx_1.makeAutoObservable)(this);
    }
    get codeNavigationOverride() {
        return this._codeNavigationOverride;
    }
    async openCodeBlock(oid) {
        try {
            // Get the current branch data
            const activeBranchId = this.editorEngine.branches.activeBranch?.id;
            if (!activeBranchId) {
                console.warn('[IdeManager] No active branch found');
                return;
            }
            const branchData = this.editorEngine.branches.getBranchDataById(activeBranchId);
            if (!branchData) {
                console.warn(`[IdeManager] No branch data found for branchId: ${activeBranchId}`);
                return;
            }
            // Get element metadata
            const metadata = await branchData.codeEditor.getJsxElementMetadata(oid);
            if (!metadata) {
                console.warn(`[IdeManager] No metadata found for OID: ${oid}`);
                return;
            }
            // Create navigation target
            const startLine = metadata.startTag.start.line;
            const startColumn = metadata.startTag.start.column;
            const endTag = metadata.endTag || metadata.startTag;
            const endLine = endTag.end.line;
            const endColumn = endTag.end.column;
            const target = {
                filePath: metadata.path,
                range: {
                    start: { line: startLine, column: startColumn },
                    end: { line: endLine, column: endColumn }
                }
            };
            // Set the override to trigger navigation
            this._codeNavigationOverride = target;
            // Switch to code tab
            this.editorEngine.state.editorMode = models_1.EditorMode.CODE;
        }
        catch (error) {
            console.error('[IdeManager] Error opening code block:', error);
        }
    }
    clearCodeNavigationOverride() {
        this._codeNavigationOverride = null;
    }
    hasCodeNavigationOverride() {
        return this._codeNavigationOverride !== null;
    }
}
exports.IdeManager = IdeManager;
//# sourceMappingURL=index.js.map