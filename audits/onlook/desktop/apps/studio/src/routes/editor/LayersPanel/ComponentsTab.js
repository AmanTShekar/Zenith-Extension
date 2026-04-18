"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const constants_1 = require("@onlook/models/constants");
const button_1 = require("@onlook/ui/button");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const utils_1 = require("@/lib/utils");
function ScanComponentsButton() {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const onClick = (0, react_1.useCallback)(async () => {
        const path = (await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.PICK_COMPONENTS_DIRECTORY));
        if (path == null) {
            return;
        }
        const components = (await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.GET_COMPONENTS, path));
        editorEngine.projectInfo.components = components;
    }, [editorEngine]);
    return (<button_1.Button variant="outline" size="sm" className="" onClick={onClick}>
            Connect to Project
        </button_1.Button>);
}
const ComponentsTab = (0, mobx_react_lite_1.observer)(({ components }) => {
    return (<div className="w-full">
            {components.length === 0 ? (<div className="w-full h-full flex items-center justify-center">
                    <ScanComponentsButton />
                </div>) : (components.map((component) => (<div className="flex-col pb-2 pl-2 cursor-pointer" key={`${component.name}-${component.sourceFilePath}`}>
                        <div className="font-bold">{component.name}</div>
                        <div className="opacity-50 text-sm">{component.sourceFilePath}</div>
                    </div>)))}
        </div>);
});
exports.default = ComponentsTab;
//# sourceMappingURL=ComponentsTab.js.map