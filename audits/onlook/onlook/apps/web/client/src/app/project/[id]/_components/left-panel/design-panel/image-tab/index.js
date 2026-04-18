"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagesTab = void 0;
const mobx_react_lite_1 = require("mobx-react-lite");
const chat_1 = require("@onlook/models/chat");
const icons_1 = require("@onlook/ui/icons");
const sonner_1 = require("@onlook/ui/sonner");
const utility_1 = require("@onlook/utility");
const editor_1 = require("@/components/store/editor");
const breadcrumb_navigation_1 = require("./breadcrumb-navigation");
const folder_list_1 = require("./folder-list");
const use_image_operations_1 = require("./hooks/use-image-operations");
const use_navigation_1 = require("./hooks/use-navigation");
const image_grid_1 = require("./image-grid");
const search_upload_bar_1 = require("./search-upload-bar");
exports.ImagesTab = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const projectId = editorEngine.projectId;
    const branchId = editorEngine.branches.activeBranch.id;
    // Navigation state and handlers
    const { activeFolder, search, setSearch, breadcrumbSegments, navigateToFolder, handleFolderClick, filterImages, } = (0, use_navigation_1.useNavigation)();
    // Get the CodeEditorApi for the active branch
    const branchData = editorEngine.branches.getBranchDataById(editorEngine.branches.activeBranch.id);
    // Image operations and data
    const { folders, images: allImages, loading, error, isUploading, handleUpload, handleRename, handleDelete, } = (0, use_image_operations_1.useImageOperations)(projectId, branchId, activeFolder, branchData?.codeEditor, editorEngine);
    // Filter images based on search
    const images = filterImages(allImages);
    // Handler functions with error handling and feedback
    const handleRenameWithFeedback = async (oldPath, newName) => {
        try {
            await handleRename(oldPath, newName);
            sonner_1.toast.success('Image renamed successfully');
        }
        catch (error) {
            console.error('Failed to rename image:', error);
            sonner_1.toast.error(`Failed to rename image: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    };
    const handleDeleteWithFeedback = async (filePath) => {
        try {
            await handleDelete(filePath);
            sonner_1.toast.success('Image deleted successfully');
        }
        catch (error) {
            console.error('Failed to delete image:', error);
            sonner_1.toast.error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    };
    const handleAddToChat = async (imagePath) => {
        try {
            const fileName = imagePath.split('/').pop() || imagePath;
            const mimeType = (0, utility_1.getMimeType)(fileName);
            // Load the actual image file content
            const fileContent = await branchData?.codeEditor.readFile(imagePath);
            if (!fileContent) {
                throw new Error('Failed to load image file');
            }
            const base64Content = (0, utility_1.convertToBase64DataUrl)(fileContent, mimeType);
            const imageContext = {
                type: chat_1.MessageContextType.IMAGE,
                source: 'local',
                path: imagePath,
                branchId: branchId,
                content: base64Content,
                displayName: fileName,
                mimeType: mimeType,
            };
            editorEngine.chat.context.addContexts([imageContext]);
            sonner_1.toast.success('Image added to chat');
        }
        catch (error) {
            console.error('Failed to add image to chat:', error);
            sonner_1.toast.error('Failed to add image to chat');
        }
    };
    if (loading) {
        return (<div className="flex h-full w-full items-center justify-center gap-2">
                <icons_1.Icons.LoadingSpinner className="h-4 w-4 animate-spin"/>
                Loading images...
            </div>);
    }
    if (error) {
        return (<div className="flex h-full w-full items-center justify-center text-sm text-red-500">
                Error: {error.message}
            </div>);
    }
    return (<div className="flex h-full w-full flex-col gap-3 p-3">
            <search_upload_bar_1.SearchUploadBar search={search} setSearch={setSearch} isUploading={isUploading} onUpload={handleUpload}/>

            <breadcrumb_navigation_1.BreadcrumbNavigation breadcrumbSegments={breadcrumbSegments} onNavigate={navigateToFolder}/>

            <folder_list_1.FolderList folders={folders} onFolderClick={handleFolderClick}/>

            <image_grid_1.ImageGrid images={images} projectId={projectId} branchId={branchId} search={search} onUpload={handleUpload} onRename={handleRenameWithFeedback} onDelete={handleDeleteWithFeedback} onAddToChat={handleAddToChat}/>
        </div>);
});
//# sourceMappingURL=index.js.map