"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasManager = void 0;
const sizePresets_1 = require("@/lib/sizePresets");
const constants_1 = require("@onlook/models/constants");
const lodash_1 = require("lodash");
const mobx_1 = require("mobx");
const non_secure_1 = require("nanoid/non-secure");
class CanvasManager {
    projects;
    zoomScale = constants_1.DefaultSettings.SCALE;
    panPosition = constants_1.DefaultSettings.PAN_POSITION;
    webFrames = [];
    settingsObservers = new Map();
    constructor(projects) {
        this.projects = projects;
        (0, mobx_1.makeAutoObservable)(this);
        this.listenToProjectChange();
        this.panPosition = this.getDefaultPanPosition();
    }
    getDefaultPanPosition() {
        if (!window) {
            return constants_1.DefaultSettings.PAN_POSITION;
        }
        let x = 200;
        let y = 100;
        const center = false;
        if (center) {
            x =
                window.innerWidth / 2 -
                    (constants_1.DefaultSettings.FRAME_DIMENSION.width * this.zoomScale) / 2;
            y =
                window.innerHeight / 2 -
                    (constants_1.DefaultSettings.FRAME_DIMENSION.height * this.zoomScale) / 2;
        }
        return { x, y };
    }
    listenToProjectChange() {
        (0, mobx_1.reaction)(() => this.projects.project, (project) => {
            if (project) {
                this.applySettings(project);
            }
        });
    }
    get scale() {
        return this.zoomScale;
    }
    set scale(value) {
        this.zoomScale = value;
        this.saveSettings();
    }
    get position() {
        return this.panPosition;
    }
    set position(value) {
        this.panPosition = value;
        this.saveSettings();
    }
    get frames() {
        return this.webFrames;
    }
    set frames(frames) {
        this.webFrames = frames;
        this.saveSettings();
    }
    getFrame(id) {
        return this.webFrames.find((f) => f.id === id);
    }
    saveFrame(id, newSettings) {
        let frame = this.webFrames.find((f) => f.id === id);
        if (!frame) {
            return;
        }
        frame = { ...frame, ...newSettings };
        this.webFrames = this.webFrames.map((f) => (f.id === id ? frame : f));
        this.saveSettings();
        this.notifySettingsObservers(id);
    }
    saveFrames(frames) {
        this.webFrames = frames;
        this.saveSettings();
    }
    async applySettings(project) {
        this.zoomScale = project.settings?.scale || constants_1.DefaultSettings.SCALE;
        this.panPosition = project.settings?.position || this.getDefaultPanPosition();
        if (project.settings?.frames && project.settings.frames.length) {
            this.webFrames = project.settings.frames;
        }
        else {
            // Find desktop and mobile presets
            const desktopPreset = sizePresets_1.SIZE_PRESETS.find((preset) => preset.name === 'Desktop');
            const mobilePreset = sizePresets_1.SIZE_PRESETS.find((preset) => preset.name === 'Mobile');
            // Create desktop frame
            const desktopFrame = this.getDefaultFrame({
                url: project.url,
                dimension: desktopPreset
                    ? { width: desktopPreset.width, height: desktopPreset.height }
                    : constants_1.DefaultSettings.FRAME_DIMENSION,
                device: 'Desktop',
            });
            // Create mobile frame with position offset to avoid overlap
            const mobileFrame = this.getDefaultFrame({
                url: project.url,
                dimension: mobilePreset
                    ? { width: mobilePreset.width, height: mobilePreset.height }
                    : { width: 320, height: 568 },
                position: { x: desktopFrame.dimension.width + 100, y: 0 },
                device: 'Mobile',
            });
            this.webFrames = [desktopFrame, mobileFrame];
        }
    }
    clear() {
        this.webFrames = [];
        this.zoomScale = constants_1.DefaultSettings.SCALE;
        this.panPosition = constants_1.DefaultSettings.PAN_POSITION;
    }
    getFrameMap(frames) {
        const map = new Map();
        frames.forEach((frame) => {
            map.set(frame.id, frame);
        });
        return map;
    }
    getDefaultFrame(defaults) {
        return {
            id: defaults.id || (0, non_secure_1.nanoid)(),
            url: defaults.url || constants_1.DefaultSettings.URL,
            position: defaults.position || constants_1.DefaultSettings.FRAME_POSITION,
            dimension: defaults.dimension || constants_1.DefaultSettings.FRAME_DIMENSION,
            aspectRatioLocked: defaults.aspectRatioLocked || constants_1.DefaultSettings.ASPECT_RATIO_LOCKED,
            device: defaults.device || constants_1.DefaultSettings.DEVICE,
            theme: defaults.theme || constants_1.DefaultSettings.THEME,
            orientation: defaults.orientation || constants_1.DefaultSettings.ORIENTATION,
        };
    }
    saveSettings = (0, lodash_1.debounce)(this.undebouncedSaveSettings, 1000);
    observeSettings(id, observer) {
        if (!this.settingsObservers.has(id)) {
            this.settingsObservers.set(id, new Set());
        }
        this.settingsObservers.get(id).add(observer);
    }
    unobserveSettings(id, observer) {
        this.settingsObservers.get(id)?.delete(observer);
        if (this.settingsObservers.get(id)?.size === 0) {
            this.settingsObservers.delete(id);
        }
    }
    notifySettingsObservers(id) {
        const settings = this.frames.find((f) => f.id === id);
        if (!settings) {
            return;
        }
        this.settingsObservers.get(id)?.forEach((observer) => {
            observer(settings);
        });
    }
    undebouncedSaveSettings() {
        const settings = {
            scale: this.zoomScale,
            position: this.panPosition,
            frames: Array.from(this.frames.values()),
        };
        if (this.projects.project) {
            this.projects.project.settings = settings;
            this.projects.updateProject(this.projects.project);
        }
    }
}
exports.CanvasManager = CanvasManager;
//# sourceMappingURL=index.js.map