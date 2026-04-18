"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileTabs = void 0;
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const utility_1 = require("@onlook/utility");
const react_1 = require("react");
const file_tab_1 = require("./file-tab");
const FileTabs = ({ openedFiles, activeFile, onFileSelect, onCloseFile, onCloseAllFiles, }) => {
    const ref = (0, react_1.useRef)(null);
    // Scroll to active tab when it changes
    (0, react_1.useEffect)(() => {
        const container = ref.current;
        if (!container || !activeFile?.path)
            return;
        // Wait for the file tabs to be rendered
        setTimeout(() => {
            const activeTab = container.querySelector('[data-active="true"]');
            if (activeTab) {
                const containerRect = container.getBoundingClientRect();
                const tabRect = activeTab.getBoundingClientRect();
                // Calculate if the tab is outside the visible area
                if (tabRect.left < containerRect.left) {
                    // Tab is to the left of the visible area
                    container.scrollLeft += tabRect.left - containerRect.left;
                }
                else if (tabRect.right > containerRect.right) {
                    // Tab is to the right of the visible area
                    container.scrollLeft += tabRect.right - containerRect.right;
                }
            }
        }, 100);
    }, [activeFile?.path]);
    return (<div className="flex items-center justify-between h-10 pl-0 border-b-[0.5px] flex-shrink-0 relative">
            <div className="flex items-center h-full overflow-x-auto w-full" ref={ref}>
                {openedFiles.map((file) => (<file_tab_1.FileTab key={file.path} file={file} isActive={(0, utility_1.pathsEqual)(activeFile?.path, file.path)} onClick={() => onFileSelect(file)} onClose={() => onCloseFile(file.path)} dataActive={(0, utility_1.pathsEqual)(activeFile?.path, file.path)}/>))}
            </div>
            <div className="flex items-center h-full border-l-[0.5px] p-1 bg-background w-11">
                <dropdown_menu_1.DropdownMenu>
                    <dropdown_menu_1.DropdownMenuTrigger className="text-muted-foreground hover:text-foreground hover:bg-foreground/5 p-1 rounded h-full w-full flex items-center justify-center px-2.5">
                        <icons_1.Icons.DotsHorizontal className="h-4 w-4"/>
                    </dropdown_menu_1.DropdownMenuTrigger>
                    <dropdown_menu_1.DropdownMenuContent align="end" className="-mt-1">
                        <dropdown_menu_1.DropdownMenuItem onClick={() => activeFile && onCloseFile(activeFile.path)} disabled={!activeFile} className="cursor-pointer">
                            Close file
                        </dropdown_menu_1.DropdownMenuItem>
                        <dropdown_menu_1.DropdownMenuItem onClick={onCloseAllFiles} disabled={openedFiles.length === 0} className="cursor-pointer">
                            Close all
                        </dropdown_menu_1.DropdownMenuItem>
                    </dropdown_menu_1.DropdownMenuContent>
                </dropdown_menu_1.DropdownMenu>
            </div>
        </div>);
};
exports.FileTabs = FileTabs;
//# sourceMappingURL=index.js.map