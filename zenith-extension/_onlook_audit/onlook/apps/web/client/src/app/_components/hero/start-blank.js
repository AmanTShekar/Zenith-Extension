"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartBlank = StartBlank;
const index_1 = require("@onlook/ui/icons/index");
const use_create_blank_project_1 = require("@/hooks/use-create-blank-project");
function StartBlank() {
    const { handleStartBlankProject, isCreatingProject } = (0, use_create_blank_project_1.useCreateBlankProject)();
    return (<button onClick={handleStartBlankProject} disabled={isCreatingProject} className="text-foreground-secondary hover:text-foreground disabled:hover:text-foreground-secondary flex items-center gap-2 text-sm transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50">
            {isCreatingProject ? (<index_1.Icons.LoadingSpinner className="h-4 w-4 animate-spin"/>) : (<index_1.Icons.File className="h-4 w-4"/>)}
            Start a Blank Project
        </button>);
}
//# sourceMappingURL=start-blank.js.map