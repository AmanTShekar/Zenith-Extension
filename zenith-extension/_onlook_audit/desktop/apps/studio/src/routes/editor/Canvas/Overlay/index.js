"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Overlay = void 0;
const Context_1 = require("@/components/Context");
const models_1 = require("@/lib/models");
const constants_1 = require("@onlook/models/constants");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const Chat_1 = require("./Chat");
const ClickRect_1 = require("./ClickRect");
const HoverRect_1 = require("./HoverRect");
const InsertRect_1 = require("./InsertRect");
const MeasurementOverlay_1 = require("./MeasurementOverlay");
const TextEditor_1 = require("./TextEditor");
// Memoize child components
const MemoizedInsertRect = (0, react_1.memo)(InsertRect_1.InsertRect);
const MemoizedClickRect = (0, react_1.memo)(ClickRect_1.ClickRect);
const MemoizedTextEditor = (0, react_1.memo)(TextEditor_1.TextEditor);
const MemoizedChat = (0, react_1.memo)(Chat_1.OverlayChat);
const MemoizedMeasurementOverlay = (0, react_1.memo)(MeasurementOverlay_1.MeasurementOverlay);
exports.Overlay = (0, mobx_react_lite_1.observer)(({ children }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    // Memoize overlay state values
    const overlayState = editorEngine.overlay.state;
    const isPreviewMode = editorEngine.mode === models_1.EditorMode.PREVIEW;
    const isSingleSelection = editorEngine.elements.selected.length === 1;
    // Memoize the container style object
    const containerStyle = (0, react_1.useMemo)(() => ({
        position: 'absolute',
        height: 0,
        width: 0,
        top: 0,
        left: 0,
        pointerEvents: 'none',
        visibility: isPreviewMode ? 'hidden' : 'visible',
    }), [isPreviewMode]);
    // Memoize the clickRects rendering
    const clickRectsElements = (0, react_1.useMemo)(() => overlayState.clickRects.map((rectState) => (<MemoizedClickRect key={rectState.id} width={rectState.width} height={rectState.height} top={rectState.top} left={rectState.left} isComponent={rectState.isComponent} styles={rectState.styles} shouldShowResizeHandles={isSingleSelection}/>)), [overlayState.clickRects, isSingleSelection]);
    return (<>
            {children}
            <div style={containerStyle} id={constants_1.EditorAttributes.OVERLAY_CONTAINER_ID}>
                {overlayState.hoverRect && (<HoverRect_1.HoverRect rect={overlayState.hoverRect.rect} isComponent={overlayState.hoverRect.isComponent}/>)}
                {overlayState.insertRect && <MemoizedInsertRect rect={overlayState.insertRect}/>}
                {clickRectsElements}
                {overlayState.textEditor && (<MemoizedTextEditor rect={overlayState.textEditor.rect} content={overlayState.textEditor.content} styles={overlayState.textEditor.styles} onChange={overlayState.textEditor.onChange} onStop={overlayState.textEditor.onStop} isComponent={overlayState.textEditor.isComponent}/>)}
                {overlayState.measurement && (<MemoizedMeasurementOverlay fromRect={overlayState.measurement.fromRect} toRect={overlayState.measurement.toRect}/>)}
                {<MemoizedChat elementId={editorEngine.elements.selected[0]?.domId} selectedEl={overlayState.clickRects[0]}/>}
            </div>
        </>);
});
//# sourceMappingURL=index.js.map