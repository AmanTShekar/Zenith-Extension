"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverlayButtons = void 0;
const editor_1 = require("@/components/store/editor");
const react_1 = require("@/trpc/react");
const models_1 = require("@onlook/models");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_2 = require("react");
const chat_1 = require("./chat");
const code_1 = require("./code");
const helpers_1 = require("./helpers");
exports.OverlayButtons = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const { data: settings } = react_1.api.user.settings.get.useQuery();
    const [inputState, setInputState] = (0, react_2.useState)(helpers_1.DEFAULT_INPUT_STATE);
    const prevChatPositionRef = (0, react_2.useRef)(null);
    const selectedRect = editorEngine.overlay.state.clickRects[0] ?? null;
    const domId = editorEngine.elements.selected[0]?.domId;
    const isPreviewMode = editorEngine.state.editorMode === models_1.EditorMode.PREVIEW;
    const shouldHideButton = !selectedRect ||
        isPreviewMode ||
        editorEngine.chat.isStreaming ||
        !settings?.chat?.showMiniChat;
    (0, react_2.useEffect)(() => {
        setInputState(helpers_1.DEFAULT_INPUT_STATE);
    }, [domId]);
    const chatPosition = {
        x: domId
            ? (document.getElementById(domId)?.getBoundingClientRect().left ?? 0)
            : 0,
        y: domId
            ? (document.getElementById(domId)?.getBoundingClientRect().bottom ?? 0)
            : 0,
    };
    (0, react_2.useEffect)(() => {
        prevChatPositionRef.current = chatPosition;
    }, [chatPosition.x, chatPosition.y]);
    const animationClass = 'origin-center opacity-0 -translate-y-2 transition-all duration-200';
    (0, react_2.useEffect)(() => {
        if (domId) {
            requestAnimationFrame(() => {
                const element = document.querySelector(`[data-element-id="${domId}"]`);
                if (element) {
                    element.classList.remove('scale-[0.2]', 'opacity-0', '-translate-y-2');
                    element.classList.add('scale-100', 'opacity-100', 'translate-y-0');
                }
            });
        }
    }, [domId]);
    if (shouldHideButton) {
        return null;
    }
    const EDITOR_HEADER_HEIGHT = 86;
    const MARGIN = 8;
    const CHAT_BUTTON_HEIGHT = 42;
    const containerStyle = {
        position: 'fixed',
        top: Math.max(EDITOR_HEADER_HEIGHT + MARGIN, selectedRect.top - (CHAT_BUTTON_HEIGHT + MARGIN)),
        left: selectedRect.left + selectedRect.width / 2,
        transform: 'translate(-50%, 0)',
        transformOrigin: 'center center',
        pointerEvents: 'auto',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };
    return (<div style={containerStyle} onClick={(e) => e.stopPropagation()} className={animationClass} data-element-id={domId}>
            <div className="flex flex-row items-center gap-2">
                <chat_1.OverlayChatInput inputState={inputState} setInputState={setInputState}/>
                <code_1.OverlayOpenCode isInputting={inputState.isInputting}/>
            </div>
        </div>);
});
//# sourceMappingURL=index.js.map