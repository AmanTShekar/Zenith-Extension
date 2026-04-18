"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeManager = void 0;
const models_1 = require("@/lib/models");
const utils_1 = require("@/lib/utils");
const actions_1 = require("@onlook/models/actions");
const constants_1 = require("@onlook/models/constants");
const ide_1 = require("@onlook/models/ide");
const mobx_1 = require("mobx");
const helpers_1 = require("./helpers");
const insert_1 = require("./insert");
const helpers_2 = require("/common/helpers");
class CodeManager {
    editorEngine;
    projectsManager;
    userManager;
    isExecuting = false;
    writeQueue = [];
    constructor(editorEngine, projectsManager, userManager) {
        this.editorEngine = editorEngine;
        this.projectsManager = projectsManager;
        this.userManager = userManager;
        (0, mobx_1.makeAutoObservable)(this);
    }
    viewSource(oid) {
        if (this.userManager.settings.settings?.editor?.ideType === ide_1.IdeType.ONLOOK) {
            this.editorEngine.editPanelTab = models_1.EditorTabValue.DEV;
        }
        if (!oid) {
            console.error('No oid found.');
            return;
        }
        (0, utils_1.invokeMainChannel)(constants_1.MainChannels.VIEW_SOURCE_CODE, oid);
        (0, utils_1.sendAnalytics)('view source code');
    }
    viewSourceFile(filePath, line) {
        if (this.userManager.settings.settings?.editor?.ideType === ide_1.IdeType.ONLOOK) {
            this.editorEngine.editPanelTab = models_1.EditorTabValue.DEV;
            return;
        }
        if (!filePath) {
            console.error('No file path found.');
            return;
        }
        (0, utils_1.invokeMainChannel)(constants_1.MainChannels.VIEW_SOURCE_FILE, { filePath, line });
        (0, utils_1.sendAnalytics)('view source code');
    }
    async getCodeBlock(oid, stripIds = false) {
        if (!oid) {
            console.error('Failed to get code block. No oid found.');
            return null;
        }
        return (0, utils_1.invokeMainChannel)(constants_1.MainChannels.GET_CODE_BLOCK, {
            oid,
            stripIds,
        });
    }
    async getFileContent(filePath, stripIds) {
        return (0, utils_1.invokeMainChannel)(constants_1.MainChannels.GET_FILE_CONTENT, { filePath, stripIds });
    }
    async write(action) {
        // TODO: These can all be processed at once at the getCodeDiffRequests level
        this.writeQueue.push(action);
        if (!this.isExecuting) {
            await this.processWriteQueue();
        }
    }
    async processWriteQueue() {
        this.isExecuting = true;
        if (this.writeQueue.length > 0) {
            const action = this.writeQueue.shift();
            if (action) {
                await this.executeWrite(action);
            }
        }
        setTimeout(() => {
            this.isExecuting = false;
            if (this.writeQueue.length > 0) {
                this.processWriteQueue();
            }
        }, 300);
    }
    async executeWrite(action) {
        switch (action.type) {
            case 'update-style':
                await this.writeStyle(action);
                break;
            case 'insert-element':
                await this.writeInsert(action);
                break;
            case 'move-element':
                await this.writeMove(action);
                break;
            case 'remove-element':
                await this.writeRemove(action);
                break;
            case 'edit-text':
                await this.writeEditText(action);
                break;
            case 'group-elements':
                this.writeGroup(action);
                break;
            case 'ungroup-elements':
                this.writeUngroup(action);
                break;
            case 'write-code':
                this.writeCode(action);
                break;
            case 'insert-image':
                this.writeInsertImage(action);
                break;
            case 'remove-image':
                this.writeRemoveImage(action);
                break;
            default:
                (0, helpers_2.assertNever)(action);
        }
        (0, utils_1.sendAnalytics)('write code');
    }
    async writeStyle({ targets }) {
        const oidToCodeChange = new Map();
        for (const target of targets) {
            if (!target.oid) {
                console.error('No oid found for style change');
                continue;
            }
            const request = await (0, helpers_1.getOrCreateCodeDiffRequest)(target.oid, oidToCodeChange);
            (0, helpers_1.addTailwindToRequest)(request, target.change.updated);
        }
        await this.getAndWriteCodeDiff(Array.from(oidToCodeChange.values()));
    }
    async writeInsert({ location, element, pasteParams, codeBlock }) {
        const oidToCodeChange = new Map();
        const insertedEl = (0, insert_1.getInsertedElement)(element, location, pasteParams, codeBlock);
        if (!insertedEl.location.targetOid) {
            console.error('No oid found for inserted element');
            return;
        }
        const request = await (0, helpers_1.getOrCreateCodeDiffRequest)(insertedEl.location.targetOid, oidToCodeChange);
        request.structureChanges.push(insertedEl);
        await this.getAndWriteCodeDiff(Array.from(oidToCodeChange.values()));
    }
    async writeRemove({ element, codeBlock }) {
        const oidToCodeChange = new Map();
        const removedEl = {
            oid: element.oid,
            type: actions_1.CodeActionType.REMOVE,
            codeBlock,
        };
        const request = await (0, helpers_1.getOrCreateCodeDiffRequest)(removedEl.oid, oidToCodeChange);
        request.structureChanges.push(removedEl);
        await this.getAndWriteCodeDiff(Array.from(oidToCodeChange.values()));
    }
    async writeEditText({ targets, newContent }) {
        const oidToCodeChange = new Map();
        for (const target of targets) {
            if (!target.oid) {
                console.error('No oid found for text edit');
                continue;
            }
            const request = await (0, helpers_1.getOrCreateCodeDiffRequest)(target.oid, oidToCodeChange);
            request.textContent = newContent;
        }
        await this.getAndWriteCodeDiff(Array.from(oidToCodeChange.values()));
    }
    async writeMove({ targets, location }) {
        const oidToCodeChange = new Map();
        for (const target of targets) {
            if (!target.oid) {
                console.error('No oid found for move');
                continue;
            }
            if (!location.targetOid) {
                console.error('No target oid found for moved element');
                continue;
            }
            const movedEl = {
                oid: target.oid,
                type: actions_1.CodeActionType.MOVE,
                location,
            };
            const request = await (0, helpers_1.getOrCreateCodeDiffRequest)(location.targetOid, oidToCodeChange);
            request.structureChanges.push(movedEl);
        }
        await this.getAndWriteCodeDiff(Array.from(oidToCodeChange.values()));
    }
    async writeGroup(action) {
        if (!action.parent.oid) {
            console.error('No parent oid found for group');
            return;
        }
        const oidToCodeChange = new Map();
        const groupEl = {
            type: actions_1.CodeActionType.GROUP,
            oid: action.parent.oid,
            container: action.container,
            children: action.children,
        };
        const request = await (0, helpers_1.getOrCreateCodeDiffRequest)(groupEl.oid, oidToCodeChange);
        request.structureChanges.push(groupEl);
        await this.getAndWriteCodeDiff(Array.from(oidToCodeChange.values()));
    }
    async writeUngroup(action) {
        if (!action.parent.oid) {
            console.error('No parent oid found for ungroup');
            return;
        }
        const oidToCodeChange = new Map();
        const ungroupEl = {
            type: actions_1.CodeActionType.UNGROUP,
            oid: action.parent.oid,
            container: action.container,
            children: action.children,
        };
        const request = await (0, helpers_1.getOrCreateCodeDiffRequest)(ungroupEl.oid, oidToCodeChange);
        request.structureChanges.push(ungroupEl);
        await this.getAndWriteCodeDiff(Array.from(oidToCodeChange.values()));
    }
    async writeCode(action) {
        const res = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.WRITE_CODE_DIFFS, action.diffs);
        if (!res) {
            console.error('Failed to write code');
            return false;
        }
        return true;
    }
    async writeInsertImage(action) {
        const oidToCodeChange = new Map();
        const projectFolder = this.projectsManager.project?.folderPath;
        if (!projectFolder) {
            console.error('Failed to write image, projectFolder not found');
            return;
        }
        const insertImage = {
            ...action,
            folderPath: projectFolder,
            type: actions_1.CodeActionType.INSERT_IMAGE,
        };
        for (const target of action.targets) {
            if (!target.oid) {
                console.error('No oid found for inserted image');
                continue;
            }
            const request = await (0, helpers_1.getOrCreateCodeDiffRequest)(target.oid, oidToCodeChange);
            request.structureChanges.push(insertImage);
        }
        await this.getAndWriteCodeDiff(Array.from(oidToCodeChange.values()));
    }
    async writeRemoveImage(action) {
        const oidToCodeChange = new Map();
        const removeImage = {
            ...action,
            type: actions_1.CodeActionType.REMOVE_IMAGE,
        };
        for (const target of action.targets) {
            if (!target.oid) {
                console.error('No oid found for removed image');
                continue;
            }
            const request = await (0, helpers_1.getOrCreateCodeDiffRequest)(target.oid, oidToCodeChange);
            request.structureChanges.push(removeImage);
        }
        await this.getAndWriteCodeDiff(Array.from(oidToCodeChange.values()));
    }
    async getAndWriteCodeDiff(requests, useHistory = false) {
        let codeDiffs;
        if (useHistory) {
            codeDiffs = await this.getCodeDiffs(requests);
            this.runCodeDiffs(codeDiffs);
        }
        else {
            // Write code directly
            codeDiffs = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.GET_AND_WRITE_CODE_DIFFS, {
                requests,
                write: true,
            });
        }
        if (codeDiffs.length === 0) {
            console.error('No code diffs found');
            return false;
        }
        this.editorEngine.webviews.getAll().forEach((webview) => {
            (0, utils_1.sendToWebview)(webview, constants_1.WebviewChannels.CLEAN_AFTER_WRITE_TO_CODE);
        });
        return true;
    }
    runCodeDiffs(codeDiffs) {
        const writeCodeAction = {
            type: 'write-code',
            diffs: codeDiffs,
        };
        this.editorEngine.action.run(writeCodeAction);
    }
    async getCodeDiffs(requests) {
        return (0, utils_1.invokeMainChannel)(constants_1.MainChannels.GET_AND_WRITE_CODE_DIFFS, {
            requests,
            write: false,
        });
    }
    dispose() {
        // Clear write queue
        this.writeQueue = [];
        this.isExecuting = false;
        // Clear references
        this.editorEngine = null;
    }
}
exports.CodeManager = CodeManager;
//# sourceMappingURL=index.js.map