"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditGitHub = EditGitHub;
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
function EditGitHub({ filePath }) {
    return (<button_1.Button onClick={() => {
            window.open(`https://github.com/onlook-dev/onlook/blob/main/docs/content/docs/${filePath}`, '_blank');
        }} variant="outline" className="w-fit border rounded-xl p-2 font-medium text-sm text-fd-secondary-foreground bg-fd-secondary-background hover:bg-fd-secondary-background/80 mt-8 inline-flex items-center gap-2">
            <icons_1.Icons.GitHubLogo className="w-4 h-4"/>
            Edit on GitHub
        </button_1.Button>);
}
//# sourceMappingURL=edit-gh.js.map