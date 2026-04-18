"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeManager = void 0;
const sonner_1 = require("@onlook/ui/sonner");
const utility_1 = require("@onlook/utility");
const mobx_1 = require("mobx");
const requests_1 = require("./requests");
class CodeManager {
    editorEngine;
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
        (0, mobx_1.makeAutoObservable)(this);
    }
    async write(action) {
        try {
            // TODO: This is a hack to write code, we should refactor this
            if (action.type === 'write-code' && action.diffs[0]) {
                // Write-code actions don't have branch context, use active editor
                await this.editorEngine.fileSystem.writeFile(action.diffs[0].path, action.diffs[0].generated);
            }
            else {
                const requests = await this.collectRequests(action);
                await this.writeRequest(requests);
            }
        }
        catch (error) {
            console.error('Error writing requests:', error);
            sonner_1.toast.error('Error writing requests', {
                description: error instanceof Error ? error.message : 'Unknown error',
            });
            this.editorEngine.branches.activeError.addCodeApplicationError(error instanceof Error ? error.message : 'Unknown error', action);
        }
    }
    async writeRequest(requests) {
        const groupedRequests = await this.groupRequestByFile(requests);
        const codeDiffs = await (0, requests_1.processGroupedRequests)(groupedRequests);
        for (const diff of codeDiffs) {
            const fileGroup = groupedRequests.get(diff.path);
            if (!fileGroup) {
                throw new Error(`No request group found for file: ${diff.path}`);
            }
            const firstRequest = Array.from(fileGroup.oidToRequest.values())[0];
            if (!firstRequest) {
                throw new Error(`No requests found in group for file: ${diff.path}`);
            }
            const branchData = this.editorEngine.branches.getBranchDataById(firstRequest.branchId);
            if (!branchData) {
                throw new Error(`Branch not found for ID: ${firstRequest.branchId}`);
            }
            await branchData.codeEditor.writeFile(diff.path, diff.generated);
        }
    }
    async collectRequests(action) {
        switch (action.type) {
            case 'update-style':
                return await (0, requests_1.getStyleRequests)(action);
            case 'insert-element':
                return await (0, requests_1.getInsertRequests)(action);
            case 'move-element':
                return await (0, requests_1.getMoveRequests)(action);
            case 'remove-element':
                return await (0, requests_1.getRemoveRequests)(action);
            case 'edit-text':
                return await (0, requests_1.getEditTextRequests)(action);
            case 'group-elements':
                return await (0, requests_1.getGroupRequests)(action);
            case 'ungroup-elements':
                return await (0, requests_1.getUngroupRequests)(action);
            case 'insert-image':
                return (0, requests_1.getInsertImageRequests)(action);
            case 'remove-image':
                return (0, requests_1.getRemoveImageRequests)(action);
            case 'write-code':
                return await (0, requests_1.getWriteCodeRequests)(action);
            default:
                (0, utility_1.assertNever)(action);
        }
    }
    async groupRequestByFile(requests) {
        const requestByFile = new Map();
        for (const request of requests) {
            const branchData = this.editorEngine.branches.getBranchDataById(request.branchId);
            const codeEditor = branchData?.codeEditor || this.editorEngine.fileSystem;
            const metadata = await codeEditor.getJsxElementMetadata(request.oid);
            if (!metadata) {
                throw new Error(`Metadata not found for oid: ${request.oid}`);
            }
            const fileContent = await codeEditor.readFile(metadata.path);
            if (fileContent instanceof Uint8Array) {
                throw new Error(`File is binary: ${metadata.path}`);
            }
            const path = metadata.path;
            let groupedRequest = requestByFile.get(path);
            if (!groupedRequest) {
                groupedRequest = { oidToRequest: new Map(), content: fileContent };
            }
            groupedRequest.oidToRequest.set(request.oid, request);
            requestByFile.set(path, groupedRequest);
        }
        return requestByFile;
    }
    clear() { }
}
exports.CodeManager = CodeManager;
//# sourceMappingURL=index.js.map