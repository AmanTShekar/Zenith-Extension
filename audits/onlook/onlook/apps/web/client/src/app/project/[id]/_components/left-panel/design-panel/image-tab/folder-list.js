"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderList = void 0;
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const FolderList = ({ folders, onFolderClick }) => {
    if (folders.length === 0) {
        return null;
    }
    return (<div className="flex flex-col gap-2">
            <div className="text-xs font-medium text-foreground-secondary">
                Folders
            </div>
            <div className="flex flex-wrap gap-1">
                {folders.map((folder) => (<button_1.Button key={folder.path} variant="outline" size="sm" className="h-7 text-xs" onClick={() => onFolderClick(folder)}>
                        <icons_1.Icons.File className="w-3 h-3 mr-1"/>
                        {folder.name}
                    </button_1.Button>))}
            </div>
        </div>);
};
exports.FolderList = FolderList;
//# sourceMappingURL=folder-list.js.map