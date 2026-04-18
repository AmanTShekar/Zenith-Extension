"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectEditor = ProjectEditor;
const Canvas_1 = require("./Canvas");
const EditPanel_1 = require("./EditPanel");
const HotkeysModal_1 = require("./HotkeysModal");
const LayersPanel_1 = require("./LayersPanel");
const Toolbar_1 = require("./Toolbar");
const TopBar_1 = require("./TopBar");
const WebviewArea_1 = require("./WebviewArea");
function ProjectEditor() {
    return (<>
            <div className="relative flex flex-row h-[calc(100vh-2.60rem)] select-none">
                <Canvas_1.Canvas>
                    <WebviewArea_1.WebviewArea />
                </Canvas_1.Canvas>

                <div className="fixed top-20 left-0 h-[calc(100%-5rem)] animate-layer-panel-in">
                    <LayersPanel_1.LayersPanel />
                </div>

                <div className="fixed top-20 right-0 h-[calc(100%-5rem)] animate-edit-panel-in">
                    <EditPanel_1.EditPanel />
                </div>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-toolbar-up">
                    <Toolbar_1.Toolbar />
                </div>

                <div className="absolute top-0 w-full">
                    <TopBar_1.EditorTopBar />
                </div>
            </div>
            <HotkeysModal_1.HotkeysModal />
        </>);
}
//# sourceMappingURL=index.js.map