"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchUploadBar = void 0;
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const tooltip_1 = require("@onlook/ui/tooltip");
const SearchUploadBar = ({ search, setSearch, isUploading, onUpload }) => {
    const handleUploadClick = () => {
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = 'image/*,video/*';
            input.onchange = (e) => {
                const files = e.target.files;
                if (files)
                    onUpload(files);
            };
            input.click();
        }
        catch (error) {
            console.error('Error uploading images and videos', error);
        }
    };
    return (<div className="flex gap-2">
            <div className="relative flex-1">
                <input_1.Input placeholder="Search images and videos..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 text-xs pr-8"/>
                {search && (<button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground-primary">
                        <icons_1.Icons.CrossS className="w-3 h-3"/>
                    </button>)}
            </div>
            <tooltip_1.Tooltip>
                <tooltip_1.TooltipTrigger asChild>
                    <button_1.Button variant="default" size="icon" className="h-8 w-8 text-foreground-primary border-border-primary hover:border-border-onlook bg-background-secondary hover:bg-background-onlook border" onClick={handleUploadClick} disabled={isUploading}>
                        {isUploading ? (<icons_1.Icons.Reload className="w-4 h-4 animate-spin"/>) : (<icons_1.Icons.Plus className="w-4 h-4"/>)}
                    </button_1.Button>
                </tooltip_1.TooltipTrigger>
                <tooltip_1.TooltipPortal>
                    <tooltip_1.TooltipContent>
                        <p>Upload images and videos{isUploading ? '...' : ''}</p>
                    </tooltip_1.TooltipContent>
                </tooltip_1.TooltipPortal>
            </tooltip_1.Tooltip>
        </div>);
};
exports.SearchUploadBar = SearchUploadBar;
//# sourceMappingURL=search-upload-bar.js.map