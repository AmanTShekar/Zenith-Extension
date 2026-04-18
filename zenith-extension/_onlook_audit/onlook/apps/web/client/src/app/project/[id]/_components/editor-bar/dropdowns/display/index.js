"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Display = exports.layoutTypeOptions = void 0;
const editor_1 = require("@/components/store/editor");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const react_1 = require("react");
const use_dropdown_manager_1 = require("../../hooks/use-dropdown-manager");
const hover_tooltip_1 = require("../../hover-tooltip");
const toolbar_button_1 = require("../../toolbar-button");
const vertical_align_1 = require("./vertical-align");
const direction_1 = require("./direction");
const gap_1 = require("./gap");
const type_1 = require("./type");
const mobx_react_lite_1 = require("mobx-react-lite");
const horizontal_align_1 = require("./horizontal-align");
exports.layoutTypeOptions = {
    block: { value: "block", label: "Block", icon: <icons_1.Icons.CrossL className="h-3.5 w-3.5"/> },
    flex: { value: "flex", label: "Flex" },
    grid: { value: "grid", label: "Grid" },
};
exports.Display = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const [layoutType, setLayoutType] = (0, react_1.useState)(editorEngine.style.selectedStyle?.styles.computed.display ?? 'block');
    const { isOpen, onOpenChange } = (0, use_dropdown_manager_1.useDropdownControl)({
        id: 'display-dropdown'
    });
    (0, react_1.useEffect)(() => {
        setLayoutType(editorEngine.style.selectedStyle?.styles.computed.display ?? 'block');
    }, [editorEngine.style.selectedStyle?.styles.computed.display]);
    return (<dropdown_menu_1.DropdownMenu open={isOpen} onOpenChange={onOpenChange} modal={false}>
            <hover_tooltip_1.HoverOnlyTooltip content="Display" side="bottom" className="mt-1" hideArrow disabled={isOpen}>
                <dropdown_menu_1.DropdownMenuTrigger asChild>
                    <toolbar_button_1.ToolbarButton isOpen={isOpen} className="flex items-center gap-1 min-w-9">
                        <icons_1.Icons.Layout className="h-4 w-4 min-h-4 min-w-4"/>
                        {(layoutType === 'flex' || layoutType === 'grid') && (<span className="text-small">{exports.layoutTypeOptions[layoutType]?.label ?? layoutType}</span>)}
                    </toolbar_button_1.ToolbarButton>
                </dropdown_menu_1.DropdownMenuTrigger>
            </hover_tooltip_1.HoverOnlyTooltip>
            <dropdown_menu_1.DropdownMenuContent align="start" className="min-w-[250px] mt-2 p-1.5 rounded-lg">
                <div className="p-1 space-y-2">
                    <type_1.TypeInput />
                    <direction_1.DirectionInput />
                    <vertical_align_1.VerticalAlignInput />
                    <horizontal_align_1.HorizontalAlignInput />
                    <gap_1.GapInput />
                </div>
            </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
});
//# sourceMappingURL=index.js.map