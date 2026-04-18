"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiBranchRevertModal = void 0;
const react_1 = require("react");
const button_1 = require("@onlook/ui/button");
const dialog_1 = require("@onlook/ui/dialog");
const icons_1 = require("@onlook/ui/icons");
const sonner_1 = require("@onlook/ui/sonner");
const utils_1 = require("@onlook/ui/utils");
const editor_1 = require("@/components/store/editor");
const git_1 = require("@/components/store/editor/git");
const MultiBranchRevertModal = ({ open, onOpenChange, checkpoints, }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const [selectedBranchIds, setSelectedBranchIds] = (0, react_1.useState)([]);
    const [isRestoring, setIsRestoring] = (0, react_1.useState)(false);
    const allAreSelected = selectedBranchIds.length === checkpoints.length;
    const toggleBranch = (branchId) => {
        setSelectedBranchIds((prev) => prev.includes(branchId) ? prev.filter((id) => id !== branchId) : [...prev, branchId]);
    };
    const selectAll = () => {
        setSelectedBranchIds(checkpoints.map((cp) => cp.branchId).filter((id) => !!id));
    };
    const selectNone = () => {
        setSelectedBranchIds([]);
    };
    const handleRevert = async () => {
        try {
            if (selectedBranchIds.length === 0) {
                sonner_1.toast.error('Please select at least one branch to revert');
                return;
            }
            setIsRestoring(true);
            const restorePromises = selectedBranchIds.map(async (branchId) => {
                const checkpoint = checkpoints.find((cp) => cp.branchId === branchId);
                if (!checkpoint) {
                    return { success: false };
                }
                return (0, git_1.restoreCheckpoint)(checkpoint, editorEngine);
            });
            const results = await Promise.all(restorePromises);
            const successCount = results.filter((r) => r.success).length;
            const failCount = results.length - successCount;
            if (failCount > 0) {
                sonner_1.toast.error('Failed to restore all selected branches');
            }
        }
        catch (error) {
            sonner_1.toast.error('Failed to restore branches', {
                description: error instanceof Error ? error.message : 'Unknown error',
            });
        }
        finally {
            setIsRestoring(false);
            onOpenChange(false);
            setSelectedBranchIds([]);
        }
    };
    return (<dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
            <dialog_1.DialogContent className="max-w-md">
                <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle>Restore Multiple Branches</dialog_1.DialogTitle>
                    <dialog_1.DialogDescription className="pt-2">
                        Select the branches you want to restore to their previous state.
                    </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>
                <div className="flex flex-col gap-2 py-4">
                    <div className="mb-1 flex justify-end gap-1">
                        {allAreSelected ? (<button_1.Button variant="outline" size="sm" onClick={selectNone} disabled={isRestoring}>
                                Select None
                            </button_1.Button>) : (<button_1.Button variant="outline" size="sm" onClick={selectAll} disabled={isRestoring}>
                                Select All
                            </button_1.Button>)}
                    </div>
                    <div className="flex flex-col gap-2">
                        {checkpoints.map((checkpoint) => {
            // Skip legacy checkpoints without branchId (shouldn't happen in multi-branch modal)
            if (!checkpoint.branchId)
                return null;
            const isSelected = selectedBranchIds.includes(checkpoint.branchId);
            return (<button key={checkpoint.branchId} onClick={() => toggleBranch(checkpoint.branchId)} disabled={isRestoring} className={(0, utils_1.cn)('flex items-center justify-between rounded-md border px-3 py-2.5 text-left transition-all', 'hover:bg-background-secondary/50', isSelected
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-border/50', isRestoring && 'cursor-not-allowed opacity-50')}>
                                    <span className="text-sm">
                                        {editorEngine.branches.getBranchById(checkpoint.branchId)
                    ?.name ?? checkpoint.branchId}
                                    </span>
                                    {isSelected && <icons_1.Icons.Check className="text-primary h-4 w-4"/>}
                                </button>);
        })}
                    </div>
                </div>
                <dialog_1.DialogFooter className="flex-col gap-3 sm:flex-row sm:gap-2">
                    <button_1.Button variant="outline" onClick={() => {
            onOpenChange(false);
            setSelectedBranchIds([]);
        }} disabled={isRestoring} className="order-2 sm:order-1">
                        Cancel
                    </button_1.Button>
                    <button_1.Button variant="outline" onClick={handleRevert} disabled={isRestoring || selectedBranchIds.length === 0} className="order-1 sm:order-2">
                        {isRestoring ? 'Restoring...' : 'Restore Selected'}
                    </button_1.Button>
                </dialog_1.DialogFooter>
            </dialog_1.DialogContent>
        </dialog_1.Dialog>);
};
exports.MultiBranchRevertModal = MultiBranchRevertModal;
//# sourceMappingURL=multi-branch-revert-modal.js.map