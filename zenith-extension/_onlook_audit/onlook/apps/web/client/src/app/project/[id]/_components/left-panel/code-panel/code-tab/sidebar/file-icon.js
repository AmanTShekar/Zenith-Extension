"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileIcon = void 0;
const icons_1 = require("@onlook/ui/icons");
const FileIcon = ({ path, isDirectory }) => {
    if (isDirectory) {
        return <icons_1.Icons.Directory className="w-4 h-4 mr-2"/>;
    }
    const fileName = path.split('/').pop() || path;
    const lastDotIndex = fileName.lastIndexOf('.');
    const extension = lastDotIndex > 0 ? fileName.slice(lastDotIndex + 1).toLowerCase() : '';
    switch (extension) {
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
            return <icons_1.Icons.Code className="w-4 h-4 mr-2"/>;
        case 'css':
        case 'scss':
        case 'sass':
            return <icons_1.Icons.Box className="w-4 h-4 mr-2"/>;
        case 'html':
            return <icons_1.Icons.Frame className="w-4 h-4 mr-2"/>;
        case 'json':
            return <icons_1.Icons.Code className="w-4 h-4 mr-2"/>;
        case 'md':
        case 'mdx':
            return <icons_1.Icons.Text className="w-4 h-4 mr-2"/>;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'svg':
            return <icons_1.Icons.Image className="w-4 h-4 mr-2"/>;
        default:
            return <icons_1.Icons.File className="w-4 h-4 mr-2"/>;
    }
};
exports.FileIcon = FileIcon;
//# sourceMappingURL=file-icon.js.map