"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenForEvents = listenForEvents;
const constants_1 = require("@onlook/models/constants");
const electron_1 = require("electron");
const dom_1 = require("../dom");
const group_1 = require("../elements/dom/group");
const image_1 = require("../elements/dom/image");
const insert_1 = require("../elements/dom/insert");
const move_1 = require("../elements/move");
const text_1 = require("../elements/text");
const style_1 = __importDefault(require("../style"));
const dom_2 = require("./dom");
const publish_1 = require("./publish");
function listenForEvents() {
    listenForWindowEvents();
    (0, dom_2.listenForDomMutation)();
    listenForEditEvents();
}
function listenForWindowEvents() {
    window.addEventListener('resize', () => {
        electron_1.ipcRenderer.sendToHost(constants_1.WebviewChannels.WINDOW_RESIZED);
    });
}
function listenForEditEvents() {
    electron_1.ipcRenderer.on(constants_1.WebviewChannels.UPDATE_STYLE, (_, data) => {
        const { domId, change } = data;
        style_1.default.updateStyle(domId, change.updated);
        (0, publish_1.publishStyleUpdate)(domId);
    });
    electron_1.ipcRenderer.on(constants_1.WebviewChannels.INSERT_ELEMENT, (_, data) => {
        const { element, location, editText } = data;
        const domEl = (0, insert_1.insertElement)(element, location);
        if (domEl) {
            (0, publish_1.publishInsertElement)(location, domEl, editText);
        }
    });
    electron_1.ipcRenderer.on(constants_1.WebviewChannels.REMOVE_ELEMENT, (_, data) => {
        const { location } = data;
        (0, insert_1.removeElement)(location);
        (0, publish_1.publishRemoveElement)(location);
    });
    electron_1.ipcRenderer.on(constants_1.WebviewChannels.MOVE_ELEMENT, (_, data) => {
        const { domId, newIndex } = data;
        const domEl = (0, move_1.moveElement)(domId, newIndex);
        if (domEl) {
            (0, publish_1.publishMoveElement)(domEl);
        }
    });
    electron_1.ipcRenderer.on(constants_1.WebviewChannels.EDIT_ELEMENT_TEXT, (_, data) => {
        const { domId, content } = data;
        const domEl = (0, text_1.editTextByDomId)(domId, content);
        if (domEl) {
            (0, publish_1.publishEditText)(domEl);
        }
    });
    electron_1.ipcRenderer.on(constants_1.WebviewChannels.GROUP_ELEMENTS, (_, data) => {
        const { parent, container, children } = data;
        const domEl = (0, group_1.groupElements)(parent, container, children);
        if (domEl) {
            (0, publish_1.publishGroupElement)(domEl);
        }
    });
    electron_1.ipcRenderer.on(constants_1.WebviewChannels.UNGROUP_ELEMENTS, (_, data) => {
        const { parent, container, children } = data;
        const parentDomEl = (0, group_1.ungroupElements)(parent, container, children);
        if (parentDomEl) {
            (0, publish_1.publishUngroupElement)(parentDomEl);
        }
    });
    electron_1.ipcRenderer.on(constants_1.WebviewChannels.INSERT_IMAGE, (_, data) => {
        const { domId, image } = data;
        (0, image_1.insertImage)(domId, image.content);
        (0, publish_1.publishStyleUpdate)(domId);
    });
    electron_1.ipcRenderer.on(constants_1.WebviewChannels.REMOVE_IMAGE, (_, data) => {
        const { domId } = data;
        (0, image_1.removeImage)(domId);
        (0, publish_1.publishStyleUpdate)(domId);
    });
    electron_1.ipcRenderer.on(constants_1.WebviewChannels.CLEAN_AFTER_WRITE_TO_CODE, () => {
        (0, dom_1.processDom)();
    });
}
//# sourceMappingURL=index.js.map