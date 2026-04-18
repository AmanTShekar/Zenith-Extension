"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebviewArea = void 0;
const Context_1 = require("@/components/Context");
const messageBridge_1 = require("@/lib/editor/messageBridge");
const mobx_react_lite_1 = require("mobx-react-lite");
const Frame_1 = __importDefault(require("./Frame"));
exports.WebviewArea = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const messageBridge = new messageBridge_1.WebviewMessageBridge(editorEngine);
    return (<div className="grid grid-flow-col gap-72">
            {editorEngine.canvas.frames.map((settings, index) => (<Frame_1.default key={index} settings={settings} messageBridge={messageBridge}/>))}
        </div>);
});
//# sourceMappingURL=index.js.map