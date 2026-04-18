"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeControls = void 0;
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const tooltip_1 = require("@onlook/ui/tooltip");
const utils_1 = require("@onlook/ui/utils");
const react_1 = require("react");
const file_modal_1 = require("./modals/file-modal");
const folder_modal_1 = require("./modals/folder-modal");
const upload_modal_1 = require("./modals/upload-modal");
const CodeControls = ({ isDirty, currentPath, onSave, onRefresh, onCreateFile, onCreateFolder, isSidebarOpen, setIsSidebarOpen }) => {
    const [showFileModal, setShowFileModal] = (0, react_1.useState)(false);
    const [showUploadModal, setShowUploadModal] = (0, react_1.useState)(false);
    const [showFolderModal, setShowFolderModal] = (0, react_1.useState)(false);
    const [isSaving, setIsSaving] = (0, react_1.useState)(false);
    const handleSave = async () => {
        if (!isDirty || isSaving)
            return;
        try {
            setIsSaving(true);
            await onSave();
        }
        catch (error) {
            console.error('Failed to save file:', error);
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleModalSuccess = () => {
        onRefresh();
    };
    return (<div className="flex flex-row items-center justify-between p-1 border-b border-border w-full h-10">
            <button_1.Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-foreground-secondary hover:text-foreground-primary py-1 px-2 w-fit h-fit bg-transparent hover:!bg-transparent cursor-pointer">
                {isSidebarOpen ? <icons_1.Icons.SidebarLeftCollapse className="h-4 w-4"/> : <icons_1.Icons.MoveToFolder className="h-4 w-4"/>}
                <span className="text-small ml-0.5">
                    {isSidebarOpen ? '' : 'View Files'}
                </span>
            </button_1.Button>
            <div className="flex flex-row items-center transition-opacity duration-200 ml-auto">

                <tooltip_1.Tooltip>
                    <dropdown_menu_1.DropdownMenu>
                        <tooltip_1.TooltipTrigger asChild>
                            <dropdown_menu_1.DropdownMenuTrigger asChild>
                                <button_1.Button variant="ghost" size="icon" className="py-1 px-2 w-fit h-fit bg-transparent hover:!bg-transparent cursor-pointer text-foreground-secondary hover:text-foreground-primary">
                                    <icons_1.Icons.FilePlus className="h-4 w-4"/>
                                </button_1.Button>
                            </dropdown_menu_1.DropdownMenuTrigger>
                        </tooltip_1.TooltipTrigger>
                        <dropdown_menu_1.DropdownMenuContent align="start">
                            <dropdown_menu_1.DropdownMenuItem className="cursor-pointer" onClick={() => setShowFileModal(true)}>
                                <icons_1.Icons.FilePlus className="h-4 w-4 mr-2"/>
                                Create new file
                            </dropdown_menu_1.DropdownMenuItem>
                            <dropdown_menu_1.DropdownMenuItem className="cursor-pointer" onClick={() => setShowUploadModal(true)}>
                                <icons_1.Icons.Upload className="h-4 w-4 mr-2"/>
                                Upload file
                            </dropdown_menu_1.DropdownMenuItem>
                        </dropdown_menu_1.DropdownMenuContent>
                    </dropdown_menu_1.DropdownMenu>
                    <tooltip_1.TooltipContent side="bottom" hideArrow>
                        <p>Create or Upload File</p>
                    </tooltip_1.TooltipContent>
                </tooltip_1.Tooltip>
                <tooltip_1.Tooltip>
                    <tooltip_1.TooltipTrigger asChild>
                        <button_1.Button variant="ghost" size="icon" onClick={() => setShowFolderModal(true)} className="py-1 px-2 w-fit h-fit bg-transparent hover:!bg-transparent cursor-pointer text-foreground-secondary hover:text-foreground-primary">
                            <icons_1.Icons.DirectoryPlus className="h-4 w-4"/>
                        </button_1.Button>
                    </tooltip_1.TooltipTrigger>
                    <tooltip_1.TooltipContent side="bottom" hideArrow>
                        <p>New Folder</p>
                    </tooltip_1.TooltipContent>
                </tooltip_1.Tooltip>
                <tooltip_1.Tooltip>
                    <tooltip_1.TooltipTrigger asChild>
                        <button_1.Button variant="secondary" size="icon" onClick={handleSave} disabled={!isDirty || isSaving} className={(0, utils_1.cn)("px-2 py-1 w-fit h-fit cursor-pointer mr-0.5 ml-1", isDirty
            ? "text-background-primary hover:text-teal-100 hover:bg-teal-500 bg-foreground-primary"
            : "hover:bg-background-onlook hover:text-teal-200")}>
                            {isSaving ? (<icons_1.Icons.LoadingSpinner className="h-4 w-4 animate-spin"/>) : (<icons_1.Icons.Save className={(0, utils_1.cn)("h-4 w-4", isDirty && "text-teal-200 group-hover:text-teal-100")}/>)}
                            <span className="text-small">{isSaving ? 'Saving...' : 'Save'}</span>
                        </button_1.Button>
                    </tooltip_1.TooltipTrigger>
                    <tooltip_1.TooltipContent side="bottom" hideArrow>
                        <p>{isSaving ? 'Saving changes...' : 'Save changes'}</p>
                    </tooltip_1.TooltipContent>
                </tooltip_1.Tooltip>
            </div>
            <file_modal_1.FileModal basePath={currentPath} show={showFileModal} setShow={setShowFileModal} onSuccess={handleModalSuccess} onCreateFile={onCreateFile}/>
            <folder_modal_1.FolderModal basePath={currentPath} show={showFolderModal} setShow={setShowFolderModal} onSuccess={handleModalSuccess} onCreateFolder={onCreateFolder}/>
            <upload_modal_1.UploadModal basePath={currentPath} show={showUploadModal} setShow={setShowUploadModal} onSuccess={handleModalSuccess} onCreateFile={onCreateFile}/>
        </div>);
};
exports.CodeControls = CodeControls;
//# sourceMappingURL=header-controls.js.map