"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayersTab = void 0;
const editor_1 = require("@/components/store/editor");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const react_arborist_1 = require("react-arborist");
const use_resize_observer_1 = __importDefault(require("use-resize-observer"));
const right_click_menu_1 = require("../../../right-click-menu");
const tree_node_1 = require("./tree/tree-node");
const tree_row_1 = require("./tree/tree-row");
exports.LayersTab = (0, mobx_react_lite_1.observer)(() => {
    const treeRef = (0, react_1.useRef)(null);
    const editorEngine = (0, editor_1.useEditorEngine)();
    const [treeHovered, setTreeHovered] = (0, react_1.useState)(false);
    const { ref, width, height } = (0, use_resize_observer_1.default)();
    (0, react_1.useEffect)(handleSelectChange, [
        editorEngine.elements.selected,
        editorEngine.ast.mappings.filteredLayers,
    ]);
    const handleMouseLeaveTree = (0, react_1.useCallback)(() => {
        setTreeHovered(false);
        editorEngine.overlay.state.updateHoverRect(null);
    }, [editorEngine.overlay.state]);
    function handleSelectChange() {
        if (editorEngine.elements.selected.length > 0 && editorEngine.elements.selected[0]) {
            treeRef.current?.scrollTo(editorEngine.elements.selected[0].domId);
        }
    }
    const handleDragEnd = (0, react_1.useCallback)(async ({ dragNodes, parentNode, index, }) => {
        if (!parentNode) {
            console.error('No parent found');
            return;
        }
        if (dragNodes.length !== 1) {
            console.error('Only one element can be dragged at a time');
            return;
        }
        const dragNode = dragNodes[0];
        if (!dragNode) {
            console.error('No drag node found');
            return;
        }
        const frameData = editorEngine.frames.get(dragNode.data.frameId);
        if (!frameData) {
            console.error('No frame data found');
            return;
        }
        const { view } = frameData;
        if (!view) {
            console.error('No frame view found');
            return;
        }
        const originalIndex = await view.getElementIndex(dragNode.data.domId);
        if (originalIndex === undefined) {
            console.error('No original index found');
            return;
        }
        const childEl = await view.getElementByDomId(dragNode.data.domId, false);
        if (!childEl) {
            console.error('Failed to get element');
            return;
        }
        const parentEl = await view.getElementByDomId(parentNode.data.domId, false);
        if (!parentEl) {
            console.error('Failed to get parent element');
            return;
        }
        const newIndex = index > originalIndex ? index - 1 : index;
        if (newIndex === originalIndex) {
            console.log('No index change');
            return;
        }
        const moveAction = editorEngine.move.createMoveAction(view.id, childEl, parentEl, newIndex, originalIndex);
        editorEngine.action.run(moveAction);
    }, []);
    const disableDrop = (0, react_1.useCallback)(({ parentNode, dragNodes, }) => {
        return !dragNodes.every((node) => node?.parent?.id === parentNode?.id);
    }, []);
    const childrenAccessor = (0, react_1.useCallback)((node) => {
        const children = node.children
            ?.map((child) => editorEngine.ast.mappings.getLayerNode(node.frameId, child))
            .filter((child) => child !== undefined);
        return children?.length ? children : null;
    }, [editorEngine.ast.mappings]);
    return (<div ref={ref} className="flex h-full w-full overflow-hidden text-xs text-active p-3" onMouseOver={() => setTreeHovered(true)} onMouseLeave={handleMouseLeaveTree}>
            <right_click_menu_1.RightClickMenu>
                <react_arborist_1.Tree idAccessor={(node) => node.domId} childrenAccessor={childrenAccessor} ref={treeRef} data={editorEngine.ast.mappings.filteredLayers} openByDefault={true} overscanCount={0} indent={8} padding={0} rowHeight={24} height={height ?? 300} width={width ?? 365} renderRow={(props) => <tree_row_1.TreeRow {...props}/>} onMove={handleDragEnd} disableDrop={disableDrop} className="overflow-auto">
                    {(props) => <tree_node_1.TreeNode {...props} treeHovered={treeHovered}/>}
                </react_arborist_1.Tree>
            </right_click_menu_1.RightClickMenu>
        </div>);
});
//# sourceMappingURL=index.js.map