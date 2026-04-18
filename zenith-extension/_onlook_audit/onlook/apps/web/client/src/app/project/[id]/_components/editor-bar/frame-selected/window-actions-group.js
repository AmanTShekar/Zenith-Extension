"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowActionsGroup = WindowActionsGroup;
const editor_1 = require("@/components/store/editor");
const icons_1 = require("@onlook/ui/icons");
const react_1 = require("react");
const hover_tooltip_1 = require("../hover-tooltip");
const toolbar_button_1 = require("../toolbar-button");
function WindowActionsGroup({ frameData }) {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const [isDeleting, setIsDeleting] = (0, react_1.useState)(false);
    const [isDuplicating, setIsDuplicating] = (0, react_1.useState)(false);
    const duplicateWindow = async () => {
        setIsDuplicating(true);
        try {
            if (frameData?.frame.id) {
                await editorEngine.frames.duplicate(frameData.frame.id);
            }
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setIsDuplicating(false);
        }
    };
    const deleteWindow = async () => {
        setIsDeleting(true);
        try {
            if (frameData?.frame.id) {
                await editorEngine.frames.delete(frameData.frame.id);
            }
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setIsDeleting(false);
        }
    };
    return (<>
            <hover_tooltip_1.HoverOnlyTooltip content="Duplicate Frame" side="bottom" sideOffset={10}>
                <toolbar_button_1.ToolbarButton className="flex items-center w-9" onClick={duplicateWindow} disabled={isDuplicating}>
                    {isDuplicating ? (<icons_1.Icons.LoadingSpinner className="size-4 min-size-4 animate-spin"/>) : (<icons_1.Icons.Copy className="size-4 min-size-4"/>)}
                </toolbar_button_1.ToolbarButton>
            </hover_tooltip_1.HoverOnlyTooltip>
            {editorEngine.frames.canDelete() && (<hover_tooltip_1.HoverOnlyTooltip content="Delete Frame" side="bottom" sideOffset={10}>
                    <toolbar_button_1.ToolbarButton className="flex items-center w-9" disabled={!editorEngine.frames.canDelete() || isDeleting} onClick={deleteWindow}>
                        {isDeleting ? (<icons_1.Icons.LoadingSpinner className="size-4 min-size-4 animate-spin"/>) : (<icons_1.Icons.Trash className="size-4 min-size-4"/>)}
                    </toolbar_button_1.ToolbarButton>
                </hover_tooltip_1.HoverOnlyTooltip>)}
        </>);
}
//# sourceMappingURL=window-actions-group.js.map