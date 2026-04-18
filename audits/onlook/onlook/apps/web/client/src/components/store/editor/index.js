"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorEngineProvider = exports.useEditorEngine = void 0;
const react_1 = require("posthog-js/react");
const react_2 = require("react");
const engine_1 = require("./engine");
const EditorEngineContext = (0, react_2.createContext)(null);
const useEditorEngine = () => {
    const ctx = (0, react_2.useContext)(EditorEngineContext);
    if (!ctx)
        throw new Error('useEditorEngine must be inside EditorEngineProvider');
    return ctx;
};
exports.useEditorEngine = useEditorEngine;
const EditorEngineProvider = ({ children, project, branches }) => {
    const posthog = (0, react_1.usePostHog)();
    const currentProjectId = (0, react_2.useRef)(project.id);
    const engineRef = (0, react_2.useRef)(null);
    const [editorEngine, setEditorEngine] = (0, react_2.useState)(() => {
        const engine = new engine_1.EditorEngine(project.id, posthog);
        engine.initBranches(branches);
        engine.init();
        engine.screenshot.lastScreenshotAt = project.metadata?.previewImg?.updatedAt ?? null;
        engineRef.current = engine;
        return engine;
    });
    // Initialize editor engine when project ID changes
    (0, react_2.useEffect)(() => {
        const initializeEngine = async () => {
            if (currentProjectId.current !== project.id) {
                // Clean up old engine with delay to avoid race conditions
                if (engineRef.current) {
                    setTimeout(() => engineRef.current?.clear(), 0);
                }
                // Create new engine for new project
                const newEngine = new engine_1.EditorEngine(project.id, posthog);
                await newEngine.initBranches(branches);
                await newEngine.init();
                newEngine.screenshot.lastScreenshotAt = project.metadata?.previewImg?.updatedAt ?? null;
                engineRef.current = newEngine;
                setEditorEngine(newEngine);
                currentProjectId.current = project.id;
            }
        };
        initializeEngine();
    }, [project.id]);
    // Cleanup on unmount
    (0, react_2.useEffect)(() => {
        return () => {
            setTimeout(() => engineRef.current?.clear(), 0);
        };
    }, []);
    return (<EditorEngineContext.Provider value={editorEngine}>
            {children}
        </EditorEngineContext.Provider>);
};
exports.EditorEngineProvider = EditorEngineProvider;
//# sourceMappingURL=index.js.map