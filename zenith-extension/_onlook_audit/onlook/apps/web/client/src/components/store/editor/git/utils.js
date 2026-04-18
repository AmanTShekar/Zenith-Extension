"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BACKUP_COMMIT_MESSAGE = void 0;
exports.restoreCheckpoint = restoreCheckpoint;
const sonner_1 = require("@onlook/ui/sonner");
exports.BACKUP_COMMIT_MESSAGE = 'Save before restoring backup';
/**
 * Restore a branch to a specific checkpoint
 * - Creates a backup commit before restoring
 * - Restores the branch to the checkpoint's commit
 * - Shows appropriate toast notifications
 * - Falls back to active branch for legacy checkpoints without branchId
 */
async function restoreCheckpoint(checkpoint, editorEngine) {
    try {
        // Fall back to active branch for legacy checkpoints
        const targetBranchId = checkpoint.branchId ?? editorEngine.branches.activeBranch.id;
        const branchData = editorEngine.branches.getBranchDataById(targetBranchId);
        if (!branchData) {
            sonner_1.toast.error('Branch not found');
            return { success: false, error: 'Branch not found' };
        }
        // Save current state before restoring
        const saveResult = await branchData.sandbox.gitManager.createCommit(exports.BACKUP_COMMIT_MESSAGE);
        if (!saveResult.success) {
            sonner_1.toast.warning('Failed to save before restoring backup');
        }
        // Restore to the specified commit
        const restoreResult = await branchData.sandbox.gitManager.restoreToCommit(checkpoint.oid);
        if (!restoreResult.success) {
            throw new Error(restoreResult.error || 'Failed to restore commit');
        }
        await branchData.sandbox.gitManager.listCommits();
        const branchName = editorEngine.branches.getBranchById(targetBranchId)?.name || targetBranchId;
        sonner_1.toast.success('Restored to backup!', {
            description: `Branch "${branchName}" has been restored`,
        });
        return { success: true };
    }
    catch (error) {
        console.error('Failed to restore checkpoint:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        sonner_1.toast.error('Failed to restore checkpoint', {
            description: errorMessage,
        });
        return { success: false, error: errorMessage };
    }
}
//# sourceMappingURL=utils.js.map