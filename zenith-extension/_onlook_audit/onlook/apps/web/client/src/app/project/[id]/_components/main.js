"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Main = void 0;
const editor_1 = require("@/components/store/editor");
const pricing_modal_1 = require("@/components/ui/pricing-modal");
const with_project_1 = require("@/components/ui/settings-modal/with-project");
const constants_1 = require("@onlook/constants");
const models_1 = require("@onlook/models");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const tooltip_1 = require("@onlook/ui/tooltip");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const navigation_1 = require("next/navigation");
const react_1 = require("react");
const use_panel_measure_1 = require("../_hooks/use-panel-measure");
const use_start_project_1 = require("../_hooks/use-start-project");
const bottom_bar_1 = require("./bottom-bar");
const canvas_1 = require("./canvas");
const editor_bar_1 = require("./editor-bar");
const left_panel_1 = require("./left-panel");
const right_panel_1 = require("./right-panel");
const top_bar_1 = require("./top-bar");
exports.Main = (0, mobx_react_lite_1.observer)(() => {
    const router = (0, navigation_1.useRouter)();
    const editorEngine = (0, editor_1.useEditorEngine)();
    const { isProjectReady, error } = (0, use_start_project_1.useStartProject)();
    const leftPanelRef = (0, react_1.useRef)(null);
    const rightPanelRef = (0, react_1.useRef)(null);
    const { toolbarLeft, toolbarRight, editorBarAvailableWidth } = (0, use_panel_measure_1.usePanelMeasurements)(leftPanelRef, rightPanelRef);
    (0, react_1.useEffect)(() => {
        function handleGlobalWheel(event) {
            if (!(event.ctrlKey || event.metaKey)) {
                return;
            }
            const canvasContainer = document.getElementById(constants_1.EditorAttributes.CANVAS_CONTAINER_ID);
            if (canvasContainer?.contains(event.target)) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
        }
        window.addEventListener('wheel', handleGlobalWheel, { passive: false });
        return () => {
            window.removeEventListener('wheel', handleGlobalWheel);
        };
    }, []);
    if (error) {
        return (<div className="h-screen w-screen flex items-center justify-center gap-2 flex-col">
                <div className="flex flex-row items-center justify-center gap-2">
                    <icons_1.Icons.ExclamationTriangle className="h-6 w-6 text-foreground-primary"/>
                    <div className="text-xl">Error starting project: {error}</div>
                </div>
                <button_1.Button onClick={() => {
                router.push('/');
            }}>
                    Go to home
                </button_1.Button>
            </div>);
    }
    if (!isProjectReady) {
        return (<div className="h-screen w-screen flex items-center justify-center gap-2">
                <icons_1.Icons.LoadingSpinner className="h-6 w-6 animate-spin text-foreground-primary"/>
                <div className="text-xl">Loading project...</div>
            </div>);
    }
    return (<tooltip_1.TooltipProvider>
            <div className="h-screen w-screen flex flex-row select-none relative overflow-hidden">
                <canvas_1.Canvas />

                <div className="absolute top-0 w-full">
                    <top_bar_1.TopBar />
                </div>

                {/* Left Panel */}
                <div ref={leftPanelRef} className="absolute top-10 left-0 h-[calc(100%-40px)] z-50">
                    <left_panel_1.LeftPanel />
                </div>
                {/* EditorBar anchored between panels */}
                <div className="absolute top-10 z-49" style={{
            left: toolbarLeft,
            right: toolbarRight,
            overflow: 'hidden',
            pointerEvents: 'none',
            maxWidth: editorBarAvailableWidth,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
        }}>
                    <div style={{ pointerEvents: 'auto' }}>
                        <editor_bar_1.EditorBar availableWidth={editorBarAvailableWidth}/>
                    </div>
                </div>

                {/* Right Panel */}
                <div ref={rightPanelRef} className={(0, utils_1.cn)("absolute top-10 right-0 h-[calc(100%-40px)] z-50", editorEngine.state.editorMode === models_1.EditorMode.PREVIEW && 'hidden')}>
                    <right_panel_1.RightPanel />
                </div>

                <bottom_bar_1.BottomBar />
            </div>
            <with_project_1.SettingsModalWithProjects />
            <pricing_modal_1.SubscriptionModal />
        </tooltip_1.TooltipProvider>);
});
//# sourceMappingURL=main.js.map