"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorEngine = void 0;
const models_1 = require("@/lib/models");
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const mobx_1 = require("mobx");
const non_secure_1 = require("nanoid/non-secure");
const action_1 = require("./action");
const ast_1 = require("./ast");
const canvas_1 = require("./canvas");
const chat_1 = require("./chat");
const code_1 = require("./code");
const copy_1 = require("./copy");
const element_1 = require("./element");
const error_1 = require("./error");
const files_1 = require("./files");
const font_1 = require("./font");
const group_1 = require("./group");
const history_1 = require("./history");
const image_1 = require("./image");
const insert_1 = require("./insert");
const move_1 = require("./move");
const overlay_1 = require("./overlay");
const pages_1 = require("./pages");
const projectinfo_1 = require("./projectinfo");
const style_1 = require("./style");
const text_1 = require("./text");
const theme_1 = require("./theme");
const webview_1 = require("./webview");
class EditorEngine {
    projectsManager;
    userManager;
    _plansOpen = false;
    _settingsOpen = false;
    _hotkeysOpen = false;
    _publishOpen = false;
    _isLayersPanelLocked = false;
    _isAnnouncementOpen = false;
    _editorMode = models_1.EditorMode.DESIGN;
    _editorPanelTab = models_1.EditorTabValue.CHAT;
    _settingsTab = models_1.SettingsTabValue.PREFERENCES;
    _layersPanelTab = null;
    _brandTab = null;
    canvasManager;
    chatManager;
    webviewManager;
    overlayManager;
    codeManager;
    pagesManager;
    filesManager;
    errorManager;
    imageManager;
    themeManager;
    fontManager;
    astManager = new ast_1.AstManager(this);
    historyManager = new history_1.HistoryManager(this);
    projectInfoManager = new projectinfo_1.ProjectInfoManager();
    elementManager = new element_1.ElementManager(this);
    textEditingManager = new text_1.TextEditingManager(this);
    actionManager = new action_1.ActionManager(this);
    insertManager = new insert_1.InsertManager(this);
    moveManager = new move_1.MoveManager(this);
    styleManager = new style_1.StyleManager(this);
    copyManager = new copy_1.CopyManager(this);
    groupManager = new group_1.GroupManager(this);
    constructor(projectsManager, userManager) {
        this.projectsManager = projectsManager;
        this.userManager = userManager;
        (0, mobx_1.makeAutoObservable)(this);
        this.canvasManager = new canvas_1.CanvasManager(this.projectsManager);
        this.chatManager = new chat_1.ChatManager(this, this.projectsManager, this.userManager);
        this.webviewManager = new webview_1.WebviewManager(this, this.projectsManager);
        this.overlayManager = new overlay_1.OverlayManager(this);
        this.codeManager = new code_1.CodeManager(this, this.projectsManager, this.userManager);
        this.pagesManager = new pages_1.PagesManager(this, this.projectsManager);
        this.filesManager = new files_1.FilesManager(this, this.projectsManager);
        this.errorManager = new error_1.ErrorManager(this, this.projectsManager);
        this.imageManager = new image_1.ImageManager(this, this.projectsManager);
        this.themeManager = new theme_1.ThemeManager(this, this.projectsManager);
        this.fontManager = new font_1.FontManager(this, this.projectsManager);
    }
    get elements() {
        return this.elementManager;
    }
    get overlay() {
        return this.overlayManager;
    }
    get webviews() {
        return this.webviewManager;
    }
    get code() {
        return this.codeManager;
    }
    get history() {
        return this.historyManager;
    }
    get ast() {
        return this.astManager;
    }
    get action() {
        return this.actionManager;
    }
    get mode() {
        return this._editorMode;
    }
    get insert() {
        return this.insertManager;
    }
    get move() {
        return this.moveManager;
    }
    get projectInfo() {
        return this.projectInfoManager;
    }
    get style() {
        return this.styleManager;
    }
    get canvas() {
        return this.canvasManager;
    }
    get text() {
        return this.textEditingManager;
    }
    get copy() {
        return this.copyManager;
    }
    get group() {
        return this.groupManager;
    }
    get chat() {
        return this.chatManager;
    }
    get image() {
        return this.imageManager;
    }
    get theme() {
        return this.themeManager;
    }
    get font() {
        return this.fontManager;
    }
    get editPanelTab() {
        return this._editorPanelTab;
    }
    get settingsTab() {
        return this._settingsTab;
    }
    get layersPanelTab() {
        return this._layersPanelTab;
    }
    get isPlansOpen() {
        return this._plansOpen;
    }
    get isSettingsOpen() {
        return this._settingsOpen;
    }
    get isPublishOpen() {
        return this._publishOpen;
    }
    get isHotkeysOpen() {
        return this._hotkeysOpen;
    }
    get brandTab() {
        return this._brandTab;
    }
    get errors() {
        return this.errorManager;
    }
    get isWindowSelected() {
        return this.webviews.selected.length > 0 && this.elements.selected.length === 0;
    }
    get pages() {
        return this.pagesManager;
    }
    get files() {
        return this.filesManager;
    }
    get isLayersPanelLocked() {
        return this._isLayersPanelLocked;
    }
    get isAnnouncementOpen() {
        return this._isAnnouncementOpen;
    }
    set isLayersPanelLocked(value) {
        this._isLayersPanelLocked = value;
    }
    set mode(mode) {
        this._editorMode = mode;
    }
    set editPanelTab(tab) {
        this._editorPanelTab = tab;
    }
    set settingsTab(tab) {
        this._settingsTab = tab;
    }
    set layersPanelTab(tab) {
        this._layersPanelTab = tab;
    }
    set isPlansOpen(open) {
        this._plansOpen = open;
        if (open) {
            (0, utils_1.sendAnalytics)('open pro checkout');
        }
    }
    set isSettingsOpen(open) {
        this._settingsOpen = open;
    }
    set isHotkeysOpen(value) {
        this._hotkeysOpen = value;
    }
    set isPublishOpen(open) {
        this._publishOpen = open;
    }
    set brandTab(tab) {
        this._brandTab = tab;
    }
    set isAnnouncementOpen(open) {
        this._isAnnouncementOpen = open;
    }
    dispose() {
        this.overlay.clear();
        this.elements.clear();
        this.webviews.deregisterAll();
        this.errors.clear();
        this.chatManager?.dispose();
        this.filesManager?.dispose();
        this.historyManager?.clear();
        this.elementManager?.clear();
        this.actionManager?.dispose();
        this.overlayManager?.clear();
        this.astManager?.clear();
        this.textEditingManager?.clean();
        this.codeManager?.dispose();
        this.insertManager?.dispose();
        this.moveManager?.dispose();
        this.styleManager?.dispose();
        this.copyManager?.dispose();
        this.groupManager?.dispose();
        this.canvasManager?.clear();
        this.imageManager?.dispose();
        this.themeManager?.dispose();
        this.fontManager?.dispose();
        this._settingsOpen = false;
        this._plansOpen = false;
    }
    clearUI() {
        this.overlay.clear();
        this.elements.clear();
        this.webviews.deselectAll();
    }
    inspect() {
        const selected = this.elements.selected;
        if (selected.length === 0) {
            return;
        }
        const selectedEl = selected[0];
        const webviewId = selectedEl.webviewId;
        const webview = this.webviews.getWebview(webviewId);
        if (!webview) {
            return;
        }
        webview.openDevTools();
    }
    async refreshLayers() {
        const webviews = this.webviews.webviews;
        if (webviews.size === 0) {
            return;
        }
        const webview = Array.from(webviews.values())[0].webview;
        webview.executeJavaScript('window.api?.processDom()');
    }
    async takeActiveWebviewScreenshot(name, options) {
        if (this.webviews.webviews.size === 0) {
            console.error('Failed to take screenshot, no webviews found');
            return null;
        }
        const webviewId = Array.from(this.webviews.webviews.values())[0].webview.id;
        return this.takeWebviewScreenshot(name, webviewId, options);
    }
    async takeWebviewScreenshot(name, webviewId, options) {
        const webview = this.webviews.getWebview(webviewId);
        if (!webview) {
            console.error('No webview found');
            return null;
        }
        const hasContent = await webview.executeJavaScript(`document.body.innerText.trim().length > 0 || document.body.children.length > 0 `);
        if (!hasContent) {
            console.error('No content found in webview');
            return null;
        }
        const image = await webview.capturePage();
        if (options?.save) {
            const imageName = `${name}-preview.png`;
            const path = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.SAVE_IMAGE, {
                img: image.toDataURL(),
                name: imageName,
            });
            return {
                name: imageName,
            };
        }
        return {
            image: image.resize({ quality: 'good', height: 100 }).toDataURL({
                scaleFactor: 0.1,
            }),
        };
    }
    canDeleteWindow() {
        return this.canvas.frames.length > 1;
    }
    deleteWindow(id) {
        if (this.canvas.frames.length === 1) {
            console.error('Cannot delete the last window');
            return;
        }
        let settings = null;
        if (id) {
            settings = this.canvas.getFrame(id) || null;
            if (!settings) {
                console.error('Window not found');
                return;
            }
        }
        else if (this.webviews.selected.length === 0) {
            console.error('No window selected');
            return;
        }
        else {
            settings = this.canvas.getFrame(this.webviews.selected[0].id) || null;
        }
        if (!settings) {
            console.error('Window not found');
            return;
        }
        this.ast.mappings.remove(settings.id);
        this.canvas.frames = this.canvas.frames.filter((frame) => frame.id !== settings.id);
        const webview = this.webviews.getWebview(settings.id);
        if (webview) {
            this.webviews.deregister(webview);
        }
        (0, utils_1.sendAnalytics)('window delete');
    }
    duplicateWindow(id) {
        let settings = null;
        if (id) {
            settings = this.canvas.getFrame(id) || null;
        }
        else if (this.webviews.selected.length === 0) {
            console.error('No window selected');
            return;
        }
        else {
            settings = this.canvas.getFrame(this.webviews.selected[0].id) || null;
        }
        if (!settings) {
            console.error('Window not found');
            return;
        }
        const currentFrame = settings;
        const newFrame = {
            id: (0, non_secure_1.nanoid)(),
            url: currentFrame.url,
            dimension: {
                width: currentFrame.dimension.width,
                height: currentFrame.dimension.height,
            },
            position: {
                x: currentFrame.position.x + currentFrame.dimension.width + 100,
                y: currentFrame.position.y,
            },
            aspectRatioLocked: currentFrame.aspectRatioLocked,
            orientation: currentFrame.orientation,
            device: currentFrame.device,
            theme: currentFrame.theme,
        };
        this.canvas.frames = [...this.canvas.frames, newFrame];
        (0, utils_1.sendAnalytics)('window duplicate');
    }
}
exports.EditorEngine = EditorEngine;
//# sourceMappingURL=index.js.map