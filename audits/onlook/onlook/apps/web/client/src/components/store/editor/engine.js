"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorEngine = void 0;
const mobx_1 = require("mobx");
const action_1 = require("./action");
const api_1 = require("./api");
const ast_1 = require("./ast");
const branch_1 = require("./branch");
const canvas_1 = require("./canvas");
const chat_1 = require("./chat");
const code_1 = require("./code");
const copy_1 = require("./copy");
const element_1 = require("./element");
const font_1 = require("./font");
const frame_events_1 = require("./frame-events");
const frames_1 = require("./frames");
const group_1 = require("./group");
const ide_1 = require("./ide");
const image_1 = require("./image");
const insert_1 = require("./insert");
const move_1 = require("./move");
const overlay_1 = require("./overlay");
const pages_1 = require("./pages");
const screenshot_1 = require("./screenshot");
const snap_1 = require("./snap");
const state_1 = require("./state");
const style_1 = require("./style");
const text_1 = require("./text");
const theme_1 = require("./theme");
class EditorEngine {
    projectId;
    posthog;
    branches = new branch_1.BranchManager(this);
    get activeSandbox() {
        return this.branches.activeSandbox;
    }
    get history() {
        return this.branches.activeHistory;
    }
    get fileSystem() {
        return this.branches.activeCodeEditor;
    }
    state = new state_1.StateManager();
    canvas = new canvas_1.CanvasManager(this);
    text = new text_1.TextEditingManager(this);
    elements = new element_1.ElementsManager(this);
    overlay = new overlay_1.OverlayManager(this);
    insert = new insert_1.InsertManager(this);
    move = new move_1.MoveManager(this);
    copy = new copy_1.CopyManager(this);
    group = new group_1.GroupManager(this);
    ast = new ast_1.AstManager(this);
    action = new action_1.ActionManager(this);
    style = new style_1.StyleManager(this);
    code = new code_1.CodeManager(this);
    chat = new chat_1.ChatManager(this);
    image = new image_1.ImageManager(this);
    theme = new theme_1.ThemeManager(this);
    font = new font_1.FontManager(this);
    pages = new pages_1.PagesManager(this);
    frames = new frames_1.FramesManager(this);
    frameEvent = new frame_events_1.FrameEventManager(this);
    screenshot = new screenshot_1.ScreenshotManager(this);
    snap = new snap_1.SnapManager(this);
    api = new api_1.ApiManager(this);
    ide = new ide_1.IdeManager(this);
    constructor(projectId, posthog) {
        this.projectId = projectId;
        this.posthog = posthog;
        (0, mobx_1.makeAutoObservable)(this);
    }
    async init() {
        this.overlay.init();
        this.image.init();
        this.frameEvent.init();
        this.chat.init();
        this.style.init();
    }
    async initBranches(branches) {
        await this.branches.initBranches(branches);
        await this.branches.init();
    }
    clear() {
        this.elements.clear();
        this.frames.clear();
        this.action.clear();
        this.overlay.clear();
        this.ast.clear();
        this.text.clean();
        this.insert.clear();
        this.move.clear();
        this.style.clear();
        this.copy.clear();
        this.group.clear();
        this.canvas.clear();
        this.image.clear();
        this.theme.clear();
        this.font.clear();
        this.pages.clear();
        this.chat.clear();
        this.code.clear();
        this.branches.clear();
        this.frameEvent.clear();
        this.screenshot.clear();
        this.snap.hideSnapLines();
    }
    clearUI() {
        this.overlay.clearUI();
        this.elements.clear();
        this.frames.deselectAll();
        this.snap.hideSnapLines();
    }
    async refreshLayers() {
        for (const frame of this.frames.getAll()) {
            if (!frame.view) {
                console.error('No frame view found');
                continue;
            }
            await frame.view.processDom();
        }
    }
}
exports.EditorEngine = EditorEngine;
//# sourceMappingURL=engine.js.map