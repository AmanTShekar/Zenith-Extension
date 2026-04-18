"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontFamilySelector = void 0;
const editor_1 = require("@/components/store/editor");
const models_1 = require("@onlook/models");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const utility_1 = require("@onlook/utility");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const use_dropdown_manager_1 = require("../../hooks/use-dropdown-manager");
const use_text_control_1 = require("../../hooks/use-text-control");
const hover_tooltip_1 = require("../../hover-tooltip");
const toolbar_button_1 = require("../../toolbar-button");
const font_family_1 = require("./font-family");
exports.FontFamilySelector = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const { handleFontFamilyChange, textState } = (0, use_text_control_1.useTextControl)();
    const { isOpen, onOpenChange } = (0, use_dropdown_manager_1.useDropdownControl)({
        id: 'font-family-dropdown',
    });
    // TODO: use file system like code tab
    (0, react_1.useEffect)(() => {
        if (!editorEngine.activeSandbox.session.provider) {
            return;
        }
        editorEngine.font.init();
    }, [editorEngine.activeSandbox.session.provider]);
    const handleClose = () => {
        onOpenChange(false);
        editorEngine.state.brandTab = null;
        if (editorEngine.state.leftPanelTab === models_1.LeftPanelTabValue.BRAND) {
            editorEngine.state.leftPanelTab = null;
        }
    };
    return (<dropdown_menu_1.DropdownMenu open={isOpen} modal={false} onOpenChange={(v) => {
            onOpenChange(v);
            if (!v)
                editorEngine.state.brandTab = null;
        }}>
            <hover_tooltip_1.HoverOnlyTooltip content="Font Family" side="bottom" className="mt-1" hideArrow disabled={isOpen}>
                <dropdown_menu_1.DropdownMenuTrigger asChild>
                    <toolbar_button_1.ToolbarButton isOpen={isOpen} className="flex items-center gap-2 px-3" aria-label="Font Family Selector">
                        <span className="truncate text-sm">
                            {(0, utility_1.toNormalCase)(textState.fontFamily) || 'Sans Serif'}
                        </span>
                    </toolbar_button_1.ToolbarButton>
                </dropdown_menu_1.DropdownMenuTrigger>
            </hover_tooltip_1.HoverOnlyTooltip>
            <dropdown_menu_1.DropdownMenuContent side="bottom" align="center" className="mt-1 min-w-[240px] max-h-[400px] overflow-y-auto rounded-xl p-0 bg-background shadow-lg border border-border flex flex-col">
                <div className="flex-1 overflow-y-auto px-2 pb-2 pt-2 divide-y divide-border">
                    {editorEngine.font.fonts.length === 0 ? (<div className="flex justify-center items-center flex-col h-20 text-center">
                            <icons_1.Icons.Brand className="h-5 w-5 text-muted-foreground mb-1"/>
                            <span className="text-sm text-muted-foreground">No fonts found <br /> Add fonts from the Brand Tab</span>
                        </div>) : (editorEngine.font.fonts.map((font) => (<div key={font.id} className="py-1">
                                <font_family_1.FontFamily name={font.family} onSetFont={() => handleFontFamilyChange(font)} isActive={textState.fontFamily.toLowerCase() === font.id.toLowerCase()}/>
                            </div>)))}
                </div>
                <div className="p-4 border-t border-border bg-background sticky bottom-0">
                    <button_1.Button variant="secondary" size="lg" className="w-full rounded-md text-sm font-medium" aria-label="Manage Brand fonts" tabIndex={0} onClick={() => {
            editorEngine.state.brandTab = models_1.BrandTabValue.FONTS;
            editorEngine.state.leftPanelTab = models_1.LeftPanelTabValue.BRAND;
            onOpenChange(false);
        }}>
                        Browse more fonts
                    </button_1.Button>
                </div>
            </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
});
//# sourceMappingURL=font-family-selector.js.map