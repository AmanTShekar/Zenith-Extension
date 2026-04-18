"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageGrid = void 0;
const icons_1 = require("@onlook/ui/icons");
const utils_1 = require("@onlook/ui/utils");
const use_image_drag_drop_1 = require("./hooks/use-image-drag-drop");
const image_item_1 = require("./image-item");
const ImageGrid = ({ images, projectId, branchId, search, onUpload, onRename, onDelete, onAddToChat }) => {
    const { handleDragEnter, handleDragLeave, handleDragOver, handleDrop, isDragging, onImageDragStart, onImageDragEnd, onImageMouseDown, onImageMouseUp } = (0, use_image_drag_drop_1.useImageDragDrop)(onUpload);
    return (<div className={(0, utils_1.cn)("flex-1 overflow-auto", isDragging && 'cursor-copy bg-teal-500/40', 'h-full')} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>
            <div className="grid grid-cols-2 gap-2">
                {images.map((image) => (<image_item_1.ImageItem key={image.path} image={image} projectId={projectId} branchId={branchId} onImageDragStart={onImageDragStart} onImageDragEnd={onImageDragEnd} onImageMouseDown={onImageMouseDown} onImageMouseUp={onImageMouseUp} onRename={onRename} onDelete={onDelete} onAddToChat={onAddToChat}/>))}
            </div>
            {images.length === 0 && (<div className="flex flex-col items-center justify-center py-8 text-foreground-secondary">
                    <icons_1.Icons.Image className="w-8 h-8 mb-2"/>
                    <div className="text-sm">
                        {search ? 'No images or videos match your search' : 'No images or videos in this folder'}
                    </div>
                </div>)}
        </div>);
};
exports.ImageGrid = ImageGrid;
//# sourceMappingURL=image-grid.js.map