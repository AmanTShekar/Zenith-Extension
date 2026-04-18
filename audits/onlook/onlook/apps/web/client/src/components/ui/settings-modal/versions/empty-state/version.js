"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoVersions = void 0;
const editor_1 = require("@/components/store/editor");
const button_1 = require("@onlook/ui/button");
const index_1 = require("@onlook/ui/icons/index");
const sonner_1 = require("@onlook/ui/sonner");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
exports.NoVersions = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const [isCreating, setIsCreating] = (0, react_1.useState)(false);
    const handleCreateBackup = async () => {
        try {
            setIsCreating(true);
            const branchData = editorEngine.branches.activeBranchData;
            if (!branchData) {
                throw new Error('No active branch available to create backup');
            }
            const result = await branchData.sandbox.gitManager.createCommit('Initial commit');
            if (!result.success) {
                throw new Error(result.error || 'Failed to create backup');
            }
            sonner_1.toast.success('Backup created successfully!');
            editorEngine.posthog.capture('versions_create_first_commit');
        }
        catch (error) {
            sonner_1.toast.error('Failed to create backup', {
                description: error instanceof Error ? error.message : 'Unknown error',
            });
        }
        finally {
            setIsCreating(false);
        }
    };
    return (<div className="flex flex-col items-center gap-2 border border-dashed rounded p-12 mt-4">
            <div className="">No backups</div>
            <div className="text-muted-foreground text-center">
                Create your first backup with the <br /> current version
            </div>
            <button_1.Button variant="outline" size="sm" onClick={handleCreateBackup} disabled={isCreating}>
                {isCreating ? (<index_1.Icons.Shadow className="h-4 w-4 mr-2 animate-spin"/>) : (<index_1.Icons.Plus className="h-4 w-4 mr-2"/>)}
                {isCreating ? 'Saving...' : 'Create backup'}
            </button_1.Button>
        </div>);
});
//# sourceMappingURL=version.js.map