"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageItem = void 0;
const hooks_1 = require("@onlook/file-system/hooks");
const alert_dialog_1 = require("@onlook/ui/alert-dialog");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const utility_1 = require("@onlook/utility");
const react_1 = require("react");
const sonner_1 = require("sonner");
const ImageItem = ({ image, projectId, branchId, onImageDragStart, onImageDragEnd, onImageMouseDown, onImageMouseUp, onRename, onDelete, onAddToChat }) => {
    const { content, loading } = (0, hooks_1.useFile)(projectId, branchId, image.path);
    const [imageUrl, setImageUrl] = (0, react_1.useState)(null);
    const [isDisabled, setIsDisabled] = (0, react_1.useState)(false);
    const [isRenaming, setIsRenaming] = (0, react_1.useState)(false);
    const [newName, setNewName] = (0, react_1.useState)(image.name);
    const [showDeleteDialog, setShowDeleteDialog] = (0, react_1.useState)(false);
    const [dropdownOpen, setDropdownOpen] = (0, react_1.useState)(false);
    // Check if the file is a video
    const isVideo = (0, utility_1.isVideoFile)(image.name);
    // Convert content to data URL for display
    (0, react_1.useEffect)(() => {
        if (!content) {
            setImageUrl(null);
            return;
        }
        // Handle SVG files (text content)
        if (typeof content === 'string' && image.name.toLowerCase().endsWith('.svg')) {
            // Create data URL for SVG
            const svgDataUrl = `data:image/svg+xml;base64,${btoa(content)}`;
            setImageUrl(svgDataUrl);
            return;
        }
        // Handle other text files (shouldn't happen for images, but just in case)
        if (typeof content === 'string') {
            setImageUrl(null);
            return;
        }
        // Handle binary content (PNG, JPG, videos, etc.)
        const blob = new Blob([content], { type: image.mimeType || 'image/*' });
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        // Clean up function to revoke object URL (only for blob URLs)
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [content, image.mimeType, image.name]);
    // Close dropdown when entering rename mode or showing delete dialog
    (0, react_1.useEffect)(() => {
        if (isRenaming || showDeleteDialog) {
            setDropdownOpen(false);
        }
    }, [isRenaming, showDeleteDialog]);
    if (loading) {
        return (<div className="aspect-square bg-background-secondary rounded-md border border-border-primary flex items-center justify-center">
                <icons_1.Icons.Reload className="w-4 h-4 animate-spin text-foreground-secondary"/>
            </div>);
    }
    if (!imageUrl) {
        return (<div className="aspect-square bg-background-secondary rounded-md border border-border-primary flex items-center justify-center">
                <icons_1.Icons.Image className="w-4 h-4 text-foreground-secondary"/>
            </div>);
    }
    const handleDragStart = (e) => {
        if (isDisabled) {
            e.preventDefault();
            return;
        }
        const imageContentData = {
            fileName: image.name,
            content: content,
            mimeType: (0, utility_1.getMimeType)(image.name),
            originPath: image.path,
        };
        onImageDragStart(e, imageContentData);
    };
    const handleRename = async () => {
        if (newName.trim() && newName !== image.name) {
            try {
                await onRename(image.path, newName.trim());
                setIsRenaming(false);
            }
            catch (error) {
                sonner_1.toast.error('Failed to rename file', {
                    description: error instanceof Error ? error.message : 'Unknown error',
                });
                console.error('Failed to rename file:', error);
                setNewName(image.name); // Reset on error
            }
        }
        else {
            setIsRenaming(false);
        }
    };
    const handleDelete = async () => {
        try {
            await onDelete(image.path);
            setShowDeleteDialog(false);
        }
        catch (error) {
            sonner_1.toast.error('Failed to delete file', {
                description: error instanceof Error ? error.message : 'Unknown error',
            });
            console.error('Failed to delete file:', error);
        }
    };
    const handleAddToChat = () => {
        onAddToChat(image.path);
        setDropdownOpen(false);
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            void handleRename();
        }
        else if (e.key === 'Escape') {
            setNewName(image.name);
            setIsRenaming(false);
        }
    };
    return (<div className="group">
            <div className="aspect-square bg-background-secondary rounded-md border border-border-primary overflow-hidden cursor-pointer hover:border-border-onlook transition-colors relative" onDragStart={handleDragStart} onDragEnd={onImageDragEnd} onDragOver={(e) => {
            // Allow external file drops by preventing default but not stopping propagation
            const isExternalDrag = e.dataTransfer.types.includes('Files') && !e.dataTransfer.types.includes('application/json');
            if (isExternalDrag) {
                e.preventDefault();
            }
        }} onMouseDown={onImageMouseDown} onMouseUp={onImageMouseUp}>
                {isVideo ? (<video src={imageUrl} className="w-full h-full object-cover" muted loop playsInline preload="metadata" onMouseEnter={(e) => e.currentTarget.play()} onMouseLeave={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
            }}/>) : (<img src={imageUrl} alt={image.name} className="w-full h-full object-cover" loading="lazy"/>)}

                {/* Action menu */}
                {!isRenaming && (<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <dropdown_menu_1.DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                            <dropdown_menu_1.DropdownMenuTrigger asChild>
                                <button_1.Button size="icon" variant="secondary" className="h-6 w-6 bg-background-secondary/90 hover:bg-background-onlook" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}>
                                    <icons_1.Icons.DotsHorizontal className="h-3 w-3"/>
                                </button_1.Button>
                            </dropdown_menu_1.DropdownMenuTrigger>
                            <dropdown_menu_1.DropdownMenuContent align="end" className="w-40">
                                <dropdown_menu_1.DropdownMenuItem onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToChat();
            }} className="flex items-center gap-2">
                                    <icons_1.Icons.Plus className="h-3 w-3"/>
                                    Add to Chat
                                </dropdown_menu_1.DropdownMenuItem>
                                <dropdown_menu_1.DropdownMenuItem onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsRenaming(true);
            }} className="flex items-center gap-2">
                                    <icons_1.Icons.Edit className="h-3 w-3"/>
                                    Rename
                                </dropdown_menu_1.DropdownMenuItem>
                                <dropdown_menu_1.DropdownMenuItem onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDeleteDialog(true);
            }} className="flex items-center gap-2 text-red-500 hover:text-red-600 focus:text-red-600">
                                    <icons_1.Icons.Trash className="h-3 w-3"/>
                                    Delete
                                </dropdown_menu_1.DropdownMenuItem>
                            </dropdown_menu_1.DropdownMenuContent>
                        </dropdown_menu_1.DropdownMenu>
                    </div>)}
            </div>

            {/* Name section with rename functionality */}
            <div className="mt-1 px-1">
                {isRenaming ? (<input_1.Input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={handleKeyDown} onBlur={() => void handleRename()} className="h-6 text-xs p-1 border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-ring" autoFocus onClick={(e) => e.stopPropagation()}/>) : (<div className="text-xs text-foreground-primary truncate" title={image.name}>
                        {image.name}
                    </div>)}
            </div>

            {/* Delete confirmation dialog */}
            <alert_dialog_1.AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <alert_dialog_1.AlertDialogContent>
                    <alert_dialog_1.AlertDialogHeader>
                        <alert_dialog_1.AlertDialogTitle>Delete {isVideo ? 'Video' : 'Image'}</alert_dialog_1.AlertDialogTitle>
                        <alert_dialog_1.AlertDialogDescription>
                            Are you sure you want to delete {image.name}? This action cannot be undone.
                        </alert_dialog_1.AlertDialogDescription>
                    </alert_dialog_1.AlertDialogHeader>
                    <alert_dialog_1.AlertDialogFooter>
                        <alert_dialog_1.AlertDialogCancel>Cancel</alert_dialog_1.AlertDialogCancel>
                        <alert_dialog_1.AlertDialogAction onClick={() => void handleDelete()} className="bg-destructive text-white hover:bg-destructive/90">
                            Delete
                        </alert_dialog_1.AlertDialogAction>
                    </alert_dialog_1.AlertDialogFooter>
                </alert_dialog_1.AlertDialogContent>
            </alert_dialog_1.AlertDialog>
        </div>);
};
exports.ImageItem = ImageItem;
//# sourceMappingURL=image-item.js.map