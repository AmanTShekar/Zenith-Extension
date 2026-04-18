"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Overlay = void 0;
const editor_1 = require("@/components/store/editor");
const constants_1 = require("@onlook/constants");
const models_1 = require("@onlook/models");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const buttons_1 = require("./elements/buttons");
const measurement_1 = require("./elements/measurement");
const click_1 = require("./elements/rect/click");
const hover_1 = require("./elements/rect/hover");
const insert_1 = require("./elements/rect/insert");
const snap_guidelines_1 = require("./elements/snap-guidelines");
const text_1 = require("./elements/text");
exports.Overlay = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const overlayState = editorEngine.overlay.state;
    const isSingleSelection = editorEngine.elements.selected.length === 1;
    const isTextEditing = editorEngine.text.isEditing;
    const clickRectsElements = (0, react_1.useMemo)(() => overlayState.clickRects.map((rectState) => (<click_1.ClickRect key={rectState.id} width={rectState.width} height={rectState.height} top={rectState.top} left={rectState.left} isComponent={rectState.isComponent} styles={rectState.styles} shouldShowResizeHandles={isSingleSelection}/>)), [overlayState.clickRects, isSingleSelection]);
    return (<div id={constants_1.EditorAttributes.OVERLAY_CONTAINER_ID} className={(0, utils_1.cn)('absolute top-0 left-0 h-0 w-0 pointer-events-none', editorEngine.state.shouldHideOverlay ? 'opacity-0' : 'opacity-100 transition-opacity duration-150', editorEngine.state.editorMode === models_1.EditorMode.PREVIEW && 'hidden')}>
            {!isTextEditing && overlayState.hoverRect && (<hover_1.HoverRect rect={overlayState.hoverRect.rect} isComponent={overlayState.hoverRect.isComponent}/>)}
            {overlayState.insertRect && (<insert_1.InsertRect rect={overlayState.insertRect}/>)}
            {!isTextEditing && clickRectsElements}
            {isTextEditing && overlayState.textEditor && (<text_1.TextEditor />)}
            {overlayState.measurement && (<measurement_1.MeasurementOverlay fromRect={overlayState.measurement.fromRect} toRect={overlayState.measurement.toRect}/>)}
            {overlayState.clickRects.length > 0 && (<buttons_1.OverlayButtons />)}
            <snap_guidelines_1.SnapGuidelines />
        </div>);
});
//# sourceMappingURL=index.js.map