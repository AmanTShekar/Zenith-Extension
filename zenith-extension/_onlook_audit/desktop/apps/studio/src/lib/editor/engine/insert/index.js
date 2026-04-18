"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsertManager = void 0;
const models_1 = require("@/lib/models");
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const style_1 = require("@onlook/models/style");
const tokens_1 = require("@onlook/ui/tokens");
const utils_2 = require("../overlay/utils");
class InsertManager {
    editorEngine;
    isDrawing = false;
    drawOrigin;
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
    }
    getDefaultProperties(mode) {
        switch (mode) {
            case models_1.EditorMode.INSERT_TEXT:
                return {
                    tagName: 'p',
                    styles: {
                        fontSize: '20px',
                        lineHeight: '24px',
                        color: '#000000',
                    },
                    textContent: null,
                };
            case models_1.EditorMode.INSERT_DIV:
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
    end(e, webview) {
        if (!this.isDrawing || !this.drawOrigin) {
            return null;
        }
        this.isDrawing = false;
        this.editorEngine.overlay.state.updateInsertRect(null);
        if (!webview) {
            console.error('Webview not found');
            return;
        }
        const currentPos = { x: e.clientX, y: e.clientY };
        const newRect = this.getDrawRect(currentPos);
        const origin = (0, utils_2.getRelativeMousePositionToWebview)(e, webview);
        this.insertElement(webview, newRect, origin);
        this.drawOrigin = undefined;
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
    async insertElement(webview, newRect, origin) {
        const insertAction = await this.createInsertAction(webview, newRect, origin);
        if (!insertAction) {
            console.error('Failed to create insert action');
            return;
        }
        this.editorEngine.action.run(insertAction);
    }
    async createInsertAction(webview, newRect, origin) {
        const location = await webview.executeJavaScript(`window.api?.getInsertLocation(${origin.x}, ${origin.y})`);
        if (!location) {
            console.error('Insert position not found');
            return;
        }
        const mode = this.editorEngine.mode;
        const domId = (0, utils_1.createDomId)();
        const oid = (0, utils_1.createOid)();
        const width = Math.max(Math.round(newRect.width), 30);
        const height = Math.max(Math.round(newRect.height), 30);
        const styles = mode === models_1.EditorMode.INSERT_TEXT
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
            tagName: mode === models_1.EditorMode.INSERT_TEXT ? 'p' : 'div',
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
                webviewId: webview.id,
                domId,
                oid: null,
            },
        ];
        return {
            type: 'insert-element',
            targets: targets,
            location: location,
            element: actionElement,
            editText: mode === models_1.EditorMode.INSERT_TEXT,
            pasteParams: null,
            codeBlock: null,
        };
    }
    async insertDroppedImage(webview, dropPosition, imageData) {
        const location = await webview.executeJavaScript(`window.api?.getInsertLocation(${dropPosition.x}, ${dropPosition.y})`);
        if (!location) {
            console.error('Failed to get insert location for drop');
            return;
        }
        const targetElement = await webview.executeJavaScript(`window.api?.getElementAtLoc(${dropPosition.x}, ${dropPosition.y})`);
        if (!targetElement) {
            console.error('Failed to get element at drop position');
            return;
        }
        // TODO: Handle if element is already an image, should update source
        // TODO: Handle if element has background image, should update style
        this.insertImageElement(webview, location, imageData);
    }
    insertImageElement(webview, location, imageData) {
        const prefix = constants_1.DefaultSettings.IMAGE_FOLDER.replace(/^public\//, '');
        const domId = (0, utils_1.createDomId)();
        const oid = (0, utils_1.createOid)();
        const imageElement = {
            domId,
            oid,
            tagName: 'img',
            children: [],
            attributes: {
                [constants_1.EditorAttributes.DATA_ONLOOK_ID]: oid,
                [constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID]: domId,
                [constants_1.EditorAttributes.DATA_ONLOOK_INSERTED]: 'true',
                src: `/${prefix}/${imageData.fileName}`,
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
            targets: [{ webviewId: webview.id, domId, oid }],
            element: imageElement,
            location,
            editText: false,
            pasteParams: null,
            codeBlock: null,
        };
        this.editorEngine.action.run(action);
    }
    updateElementBackgroundAction(webview, targetElement, imageData) {
        const prefix = constants_1.DefaultSettings.IMAGE_FOLDER.replace(/^public\//, '');
        const action = {
            type: 'update-style',
            targets: [
                {
                    change: {
                        updated: {
                            backgroundImage: {
                                value: `url('/${prefix}/${imageData.fileName}')`,
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
                        original: {},
                    },
                    domId: targetElement.domId,
                    oid: targetElement.oid,
                    webviewId: webview.id,
                },
            ],
        };
        this.editorEngine.action.run(action);
    }
    async insertDroppedElement(webview, dropPosition, properties) {
        const location = await webview.executeJavaScript(`window.api?.getInsertLocation(${dropPosition.x}, ${dropPosition.y})`);
        if (!location) {
            console.error('Failed to get insert location for drop');
            return;
        }
        const domId = (0, utils_1.createDomId)();
        const oid = (0, utils_1.createOid)();
        const element = {
            domId,
            oid,
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
                    webviewId: webview.id,
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
    dispose() {
        // Clear drawing state
        this.isDrawing = false;
        this.drawOrigin = undefined;
        // Clear references
        this.editorEngine = null;
    }
}
exports.InsertManager = InsertManager;
//# sourceMappingURL=index.js.map