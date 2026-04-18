"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImgFit = void 0;
const editor_1 = require("@/components/store/editor");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const react_1 = require("react");
const use_dropdown_manager_1 = require("../hooks/use-dropdown-manager");
const toolbar_button_1 = require("../toolbar-button");
const ImgFit = () => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const { isOpen, onOpenChange } = (0, use_dropdown_manager_1.useDropdownControl)({
        id: 'img-fit-dropdown'
    });
    const [objectFit, setObjectFit] = (0, react_1.useState)(editorEngine.style.selectedStyle?.styles.computed.objectFit ?? 'fill');
    (0, react_1.useEffect)(() => {
        setObjectFit(editorEngine.style.selectedStyle?.styles.computed.objectFit ??
            'fill');
    }, [editorEngine.style.selectedStyle?.styles.computed.objectFit]);
    const handleFitChange = (newFit) => {
        setObjectFit(newFit);
        editorEngine.style.update('objectFit', newFit);
    };
    return (<dropdown_menu_1.DropdownMenu modal={false}>
            <dropdown_menu_1.DropdownMenuTrigger asChild>
                <toolbar_button_1.ToolbarButton isOpen={isOpen} className="flex items-center gap-2 px-3">
                        <icons_1.Icons.Image className="h-4 w-4 min-h-4 min-w-4"/>
                        <span className="text-sm">
                            {objectFit === 'cover'
            ? 'Cover'
            : objectFit === 'contain'
                ? 'Contain'
                : 'Fill'}
                        </span>
                </toolbar_button_1.ToolbarButton>
            </dropdown_menu_1.DropdownMenuTrigger>
            <dropdown_menu_1.DropdownMenuContent align="start" className="min-w-[120px] mt-2 p-1 rounded-lg">
                <div className="p-2 space-y-2">
                    <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Type</span>
                        <div className="flex gap-1">
                            <button onClick={() => handleFitChange('cover')} className={`flex-1 text-sm px-3 py-1 rounded-md ${objectFit === 'cover'
            ? 'bg-background-tertiary/20 text-white'
            : 'text-muted-foreground hover:bg-background-tertiary/10'}`}>
                                Cover
                            </button>
                            <button onClick={() => handleFitChange('contain')} className={`flex-1 text-sm px-3 py-1 rounded-md ${objectFit === 'contain'
            ? 'bg-background-tertiary/20 text-white'
            : 'text-muted-foreground hover:bg-background-tertiary/10'}`}>
                                Contain
                            </button>
                            <button onClick={() => handleFitChange('fill')} className={`flex-1 text-sm px-3 py-1 rounded-md ${objectFit === 'fill'
            ? 'bg-background-tertiary/20 text-white'
            : 'text-muted-foreground hover:bg-background-tertiary/10'}`}>
                                Fill
                            </button>
                        </div>
                    </div>
                </div>
            </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
};
exports.ImgFit = ImgFit;
//# sourceMappingURL=img-fit.js.map