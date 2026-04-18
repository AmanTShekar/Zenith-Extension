"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectProviders = void 0;
const editor_1 = require("@/components/store/editor");
const hosting_1 = require("@/components/store/hosting");
const react_dnd_1 = require("react-dnd");
const react_dnd_html5_backend_1 = require("react-dnd-html5-backend");
const ProjectProviders = ({ children, project, branches }) => {
    return (<react_dnd_1.DndProvider backend={react_dnd_html5_backend_1.HTML5Backend}>
            <editor_1.EditorEngineProvider project={project} branches={branches}>
                <hosting_1.HostingProvider>
                    {children}
                </hosting_1.HostingProvider>
            </editor_1.EditorEngineProvider>
        </react_dnd_1.DndProvider>);
};
exports.ProjectProviders = ProjectProviders;
//# sourceMappingURL=providers.js.map