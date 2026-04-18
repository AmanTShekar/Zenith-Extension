"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsertManager = void 0;
const constants_1 = require("@onlook/constants");
const models_1 = require("@onlook/models");
const style_1 = require("@onlook/models/style");
const tokens_1 = require("@onlook/ui/tokens");
const utility_1 = require("@onlook/utility");
const utils_1 = require("../overlay/utils");
class InsertManager {
    editorEngine;
    isDrawing = false;
    drawOrigin;
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
    }
    getDefaultProperties(mode) {
        switch (mode) {
            case models_1.InsertMode.INSERT_TEXT:
                return {
                    tagName: 'p',
                    styles: {
                        fontSize: '20px',
                        lineHeight: '24px',
                        color: '#000000',
                    },
                    textContent: null,
                };
            case models_1.InsertMode.INSERT_DIV:
                return {
                    tagName: 'div',
                    styles: {
                        width: '100px',
                        height: '100px',
                        backgroundColor: tokens_1.colors.blue[100],
                    },
                    textContent: null,
                };
            default:
                throw new Error(`No element properties defined for mode: ${mode}`);
        }
    }
    start(e) {
        this.isDrawing = true;
        this.drawOrigin = {
            x: e.clientX,
            y: e.clientY,
        };
        this.updateInsertRect(this.drawOrigin);
    }
    draw(e) {
        if (!this.isDrawing || !this.drawOrigin) {
            return;
        }
        const currentPos = {
            x: e.clientX,
            y: e.clientY,
        };
        this.updateInsertRect(currentPos);
    }
    async end(e, frameView) {
        if (!this.isDrawing || !this.drawOrigin) {
            return null;
        }
        this.isDrawing = false;
        this.editorEngine.overlay.state.updateInsertRect(null);
        if (!frameView) {
            console.error('frameView not found');
            return;
        }
        const currentPos = { x: e.clientX, y: e.clientY };
        const newRect = this.getDrawRect(currentPos);
        const origin = (0, utils_1.getRelativeMousePositionToFrameView)(e, frameView);
        await this.insertElement(frameView, newRect, origin);
        this.drawOrigin = undefined;
        this.editorEngine.state.editorMode = models_1.EditorMode.DESIGN;
    }
    updateInsertRect(pos) {
        const rect = this.getDrawRect(pos);
        const overlayContainer = document.getElementById(constants_1.EditorAttributes.OVERLAY_CONTAINER_ID);
        if (!overlayContainer) {
            console.error('Overlay container not found');
            return;
        }
        const containerRect = overlayContainer.getBoundingClientRect();
        this.editorEngine.overlay.state.updateInsertRect({
            ...rect,
            top: rect.top - containerRect.top,
            left: rect.left - containerRect.left,
        });
    }
    getDrawRect(currentPos) {
        if (!this.drawOrigin) {
            return {
                top: currentPos.y,
                left: currentPos.x,
                width: 0,
                height: 0,
            };
        }
        const { x, y } = currentPos;
        let startX = this.drawOrigin.x;
        let startY = this.drawOrigin.y;
        let width = x - startX;
        let height = y - startY;
        if (width < 0) {
            startX = x;
            width = Math.abs(width);
        }
        if (height < 0) {
            startY = y;
            height = Math.abs(height);
        }
        return {
            top: startY,
            left: startX,
            width,
            height,
        };
    }
    async insertElement(frameView, newRect, origin) {
        const insertAction = await this.createInsertAction(frameView, newRect, origin);
        if (!insertAction) {
            console.error('Failed to create insert action');
            return;
        }
        await this.editorEngine.action.run(insertAction);
    }
    async createInsertAction(frameView, newRect, origin) {
        const location = await frameView.getInsertLocation(origin.x, origin.y);
        if (!location) {
            console.error('Insert position not found');
            return;
        }
        const frameData = this.editorEngine.frames.get(frameView.id);
        if (!frameData) {
            console.error('Frame data not found');
            return;
        }
        const branchId = frameData.frame.branchId;
        const mode = this.editorEngine.state.insertMode;
        const domId = (0, utility_1.createDomId)();
        const oid = (0, utility_1.createOid)();
        const width = Math.max(Math.round(newRect.width), 30);
        const height = Math.max(Math.round(newRect.height), 30);
        const styles = mode === models_1.InsertMode.INSERT_TEXT
            ? {
                width: `${width}px`,
                height: `${height}px`,
            }
            : {
                width: `${width}px`,
                height: `${height}px`,
                backgroundColor: tokens_1.colors.blue[100],
            };
        const actionElement = {
            domId,
            oid,
            branchId,
            tagName: mode === models_1.InsertMode.INSERT_TEXT ? 'p' : 'div',
            attributes: {
                [constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID]: domId,
                [constants_1.EditorAttributes.DATA_ONLOOK_INSERTED]: 'true',
                [constants_1.EditorAttributes.DATA_ONLOOK_ID]: oid,
            },
            children: [],
            textContent: null,
            styles,
        };
        const targets = [
            {
                frameId: frameView.id,
                branchId,
                domId,
                oid: null,
            },
        ];
        return {
            type: 'insert-element',
            targets: targets,
            location: location,
            element: actionElement,
            editText: mode === models_1.InsertMode.INSERT_TEXT,
            pasteParams: null,
            codeBlock: null,
        };
    }
    async insertDroppedImage(frame, dropPosition, imageData, altKey = false) {
        if (!frame.view) {
            console.error('No frame view found');
            return;
        }
        const location = await frame.view.getInsertLocation(dropPosition.x, dropPosition.y);
        if (!location) {
            console.error('Failed to get insert location for drop');
            return;
        }
        const targetElement = await frame.view.getElementAtLoc(dropPosition.x, dropPosition.y, true);
        if (!targetElement) {
            console.error('Failed to get element at drop position');
            return;
        }
        if (targetElement.tagName.toLowerCase() === 'img') {
            await this.updateImageSource(frame, targetElement, imageData);
            return;
        }
        if (altKey && (0, utility_1.canHaveBackgroundImage)(targetElement.tagName)) {
            const actionElement = await frame.view.getActionElement(targetElement.domId);
            if (actionElement) {
                this.updateElementBackgroundAction(frame, actionElement, imageData, targetElement);
                return;
            }
        }
        this.insertImageElement(frame, location, imageData);
    }
    async updateImageSource(frame, targetElement, imageData) {
        if (!frame.view) {
            console.error('No frame view found');
            return;
        }
        const actionElement = await frame.view.getActionElement(targetElement.domId);
        if (!actionElement) {
            console.error('Failed to get action element for target');
            return;
        }
        const url = imageData.originPath.replace(new RegExp(`^${constants_1.DefaultSettings.IMAGE_FOLDER}\/`), '');
        const currentLocation = await frame.view.getActionLocation(targetElement.domId);
        if (!currentLocation) {
            console.error('Failed to get current element location');
            return;
        }
        const removeAction = {
            type: 'remove-element',
            targets: [
                {
                    frameId: frame.frame.id,
                    branchId: frame.frame.branchId,
                    domId: actionElement.domId,
                    oid: actionElement.oid,
                },
            ],
            location: currentLocation,
            element: actionElement,
            editText: false,
            pasteParams: null,
            codeBlock: null,
        };
        // Create new image element with updated src
        const updatedImageElement = {
            ...actionElement,
            attributes: {
                ...actionElement.attributes,
                src: `/${url}`,
                alt: imageData.fileName,
            },
        };
        const insertAction = {
            type: 'insert-element',
            targets: [
                {
                    frameId: frame.frame.id,
                    branchId: frame.frame.branchId,
                    domId: actionElement.domId,
                    oid: actionElement.oid,
                },
            ],
            element: updatedImageElement,
            location: currentLocation,
            editText: false,
            pasteParams: null,
            codeBlock: null,
        };
        await this.editorEngine.action.run(removeAction);
        await this.editorEngine.action.run(insertAction);
    }
    insertImageElement(frame, location, imageData) {
        const url = imageData.originPath.replace(new RegExp(`^${constants_1.DefaultSettings.IMAGE_FOLDER}\/`), '');
        const domId = (0, utility_1.createDomId)();
        const oid = (0, utility_1.createOid)();
        const imageElement = {
            domId,
            oid,
            branchId: frame.frame.branchId,
            tagName: 'img',
            children: [],
            attributes: {
                [constants_1.EditorAttributes.DATA_ONLOOK_ID]: oid,
                [constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID]: domId,
                [constants_1.EditorAttributes.DATA_ONLOOK_INSERTED]: 'true',
                src: `/${url}`,
                alt: imageData.fileName,
            },
            styles: {
                width: constants_1.DefaultSettings.IMAGE_DIMENSION.width,
                height: constants_1.DefaultSettings.IMAGE_DIMENSION.height,
            },
            textContent: null,
        };
        const action = {
            type: 'insert-element',
            targets: [{ frameId: frame.frame.id, branchId: frame.frame.branchId, domId, oid }],
            element: imageElement,
            location,
            editText: false,
            pasteParams: null,
            codeBlock: null,
        };
        this.editorEngine.action.run(action);
    }
    updateElementBackgroundAction(frame, targetElement, imageData, originalElement) {
        const url = imageData.originPath.replace(new RegExp(`^${constants_1.DefaultSettings.IMAGE_FOLDER}\/`), '');
        const originStyles = originalElement.styles?.computed;
        let original = {};
        if (originStyles?.backgroundImage) {
            const backgroundImageValue = originStyles.backgroundImage;
            if (backgroundImageValue) {
                original = {
                    backgroundImage: {
                        value: (0, utility_1.urlToRelativePath)(backgroundImageValue),
                        type: style_1.StyleChangeType.Value,
                    },
                    backgroundSize: {
                        value: originStyles.backgroundSize,
                        type: style_1.StyleChangeType.Value,
                    },
                    backgroundPosition: {
                        value: originStyles.backgroundPosition,
                        type: style_1.StyleChangeType.Value,
                    },
                };
            }
        }
        const action = {
            type: 'update-style',
            targets: [
                {
                    change: {
                        updated: {
                            backgroundImage: {
                                value: `url('/${url}')`,
                                type: style_1.StyleChangeType.Value,
                            },
                            backgroundSize: {
                                value: 'cover',
                                type: style_1.StyleChangeType.Value,
                            },
                            backgroundPosition: {
                                value: 'center',
                                type: style_1.StyleChangeType.Value,
                            },
                        },
                        original,
                    },
                    domId: targetElement.domId,
                    oid: targetElement.oid,
                    frameId: frame.frame.id,
                    branchId: frame.frame.branchId,
                },
            ],
        };
        this.editorEngine.action.run(action);
    }
    async insertDroppedElement(frame, dropPosition, properties) {
        if (!frame.view) {
            console.error('No frame view found');
            return;
        }
        const location = await frame.view.getInsertLocation(dropPosition.x, dropPosition.y);
        if (!location) {
            console.error('Failed to get insert location for drop');
            return;
        }
        const domId = (0, utility_1.createDomId)();
        const oid = (0, utility_1.createOid)();
        const element = {
            domId,
            oid,
            branchId: frame.frame.branchId,
            tagName: properties.tagName,
            styles: properties.styles,
            children: [],
            attributes: {
                [constants_1.EditorAttributes.DATA_ONLOOK_ID]: oid,
                [constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID]: domId,
                [constants_1.EditorAttributes.DATA_ONLOOK_INSERTED]: 'true',
            },
            textContent: properties.textContent || null,
        };
        const action = {
            type: 'insert-element',
            targets: [
                {
                    frameId: frame.frame.id,
                    branchId: frame.frame.branchId,
                    domId,
                    oid: null,
                },
            ],
            element,
            location,
            editText: properties.tagName === 'p',
            pasteParams: null,
            codeBlock: null,
        };
        this.editorEngine.action.run(action);
    }
    clear() {
        // Clear drawing state
        this.isDrawing = false;
    }
}
exports.InsertManager = InsertManager;
//# sourceMappingURL=index.js.map