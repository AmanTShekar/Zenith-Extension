"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchManagement = void 0;
const editor_1 = require("@/components/store/editor");
const client_1 = require("@/trpc/client");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const time_1 = require("@onlook/utility/src/time");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const sonner_1 = require("sonner");
exports.BranchManagement = (0, mobx_react_lite_1.observer)(({ branch }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const [isRenaming, setIsRenaming] = (0, react_1.useState)(false);
    const [newName, setNewName] = (0, react_1.useState)(branch.name);
    const [isForking, setIsForking] = (0, react_1.useState)(false);
    const [isDeleting, setIsDeleting] = (0, react_1.useState)(false);
    const isActiveBranch = editorEngine.branches.activeBranch.id === branch.id;
    const isOnlyBranch = editorEngine.branches.allBranches.length === 1;
    const handleClose = () => {
        editorEngine.state.branchTab = null;
        editorEngine.state.manageBranchId = null;
    };
    const handleRename = async () => {
        if (newName.trim() === branch.name || !newName.trim()) {
            setIsRenaming(false);
            setNewName(branch.name);
            return;
        }
        try {
            await editorEngine.branches.updateBranch(branch.id, {
                name: newName.trim(),
            });
            sonner_1.toast.success(`Branch renamed to "${newName.trim()}"`);
            setIsRenaming(false);
        }
        catch (error) {
            console.error('Failed to rename branch:', error);
            sonner_1.toast.error('Failed to rename branch', {
                description: error instanceof Error ? error.message : 'Please try again.',
            });
            setNewName(branch.name);
            setIsRenaming(false);
        }
    };
    const handleFork = async () => {
        if (isForking)
            return;
        try {
            setIsForking(true);
            await editorEngine.branches.forkBranch(branch.id);
            sonner_1.toast.success('Branch forked successfully');
            handleClose();
        }
        catch (error) {
            console.error('Failed to fork branch:', error);
            sonner_1.toast.error('Failed to fork branch');
        }
        finally {
            setIsForking(false);
        }
    };
    const handleDelete = async () => {
        if (isDeleting)
            return;
        try {
            setIsDeleting(true);
            // If this is the active branch, switch to a different one first
            if (isActiveBranch) {
                const allBranches = editorEngine.branches.allBranches;
                const otherBranches = allBranches.filter(b => b.id !== branch.id);
                if (otherBranches.length === 0) {
                    throw new Error('Cannot delete the last remaining branch');
                }
                // Find the default branch, or use the first available branch
                const targetBranch = otherBranches.find(b => b.isDefault) || otherBranches[0];
                if (!targetBranch) {
                    throw new Error('No target branch available for switching');
                }
                // Switch to the target branch first
                await editorEngine.branches.switchToBranch(targetBranch.id);
            }
            const success = await client_1.api.branch.delete.mutate({
                branchId: branch.id,
            });
            if (success) {
                editorEngine.branches.removeBranch(branch.id);
                sonner_1.toast.success('Branch deleted successfully');
                handleClose();
            }
            else {
                throw new Error('Failed to delete branch');
            }
        }
        catch (error) {
            console.error('Failed to delete branch:', error);
            sonner_1.toast.error(error instanceof Error ? error.message : 'Failed to delete branch');
        }
        finally {
            setIsDeleting(false);
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleRename();
        }
        else if (e.key === 'Escape') {
            setIsRenaming(false);
            setNewName(branch.name);
        }
    };
    return (<div className="flex flex-col h-full text-xs text-active flex-grow w-full p-0">
            <div className="flex items-center justify-start border-b border-border py-3 pr-2.5 pl-3 gap-2">
                <button_1.Button variant="ghost" size="icon" className="hover:bg-background-secondary h-7 w-7 rounded-md" onClick={handleClose}>
                    <icons_1.Icons.ArrowLeft className="h-4 w-4"/>
                </button_1.Button>
                <h2 className="text-foreground text-sm font-normal">Branch Settings</h2>
            </div>

            <div className="p-4 border-b border-border space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm text-foreground">Name</label>
                        {isActiveBranch && (<span className="text-xs bg-teal-800 text-teal-200 px-2 py-1 rounded">
                                Active
                            </span>)}
                    </div>
                    {isRenaming ? (<input_1.Input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={handleKeyDown} onBlur={handleRename} className="h-9 text-sm" autoFocus/>) : (<div className="flex items-start justify-between p-2 bg-background-secondary rounded-md cursor-pointer hover:bg-background-secondary/70 border" onClick={() => setIsRenaming(true)}>
                            <span className="font-medium break-words min-w-0 flex-1 mr-2 leading-tight">{branch.name}</span>
                            <icons_1.Icons.Pencil className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5"/>
                        </div>)}
                </div>
            </div>

            <div className="flex-1 p-4 space-y-3">
                <div className="space-y-2">
                    <h3 className="text-sm text-foreground">Actions</h3>
                    <div className="flex flex-col items-center gap-2 w-full">
                        <button_1.Button variant="outline" className="w-full" onClick={handleFork} disabled={isForking}>
                            {isForking ? (<div className="flex items-center gap-2">
                                    <icons_1.Icons.LoadingSpinner className="w-4 h-4"/>
                                    <span>Forking...</span>
                                </div>) : (<div className="flex items-center gap-2">
                                    <icons_1.Icons.Branch className="w-4 h-4"/>
                                    <span>Fork</span>
                                </div>)}
                        </button_1.Button>

                        <button_1.Button variant="destructive" className="w-full" onClick={handleDelete} disabled={isDeleting || isOnlyBranch} title={isOnlyBranch
            ? "Cannot delete the last remaining branch"
            : "Delete branch"}>
                            {isDeleting ? (<div className="flex items-center gap-2">
                                    <icons_1.Icons.LoadingSpinner className="w-4 h-4"/>
                                    <span>Deleting...</span>
                                </div>) : (<div className="flex items-center gap-2 text-red-400">
                                    <icons_1.Icons.Trash className="w-4 h-4"/>
                                    <span>Delete</span>
                                </div>)}
                        </button_1.Button>
                    </div>
                </div>

                <div className="pt-4 border-t border-border">
                    <div className="space-y-2">
                        <div className="text-xs text-foreground-tertiary/80 space-y-1">
                            <div>Created {(0, time_1.timeAgo)(branch.createdAt)} ago</div>
                            <div>Last modified {(0, time_1.timeAgo)(branch.updatedAt)} ago</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>);
});
//# sourceMappingURL=branch-management.js.map