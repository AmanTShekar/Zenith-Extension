"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchControls = BranchControls;
const editor_1 = require("@/components/store/editor");
const models_1 = require("@onlook/models");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const react_1 = require("react");
function BranchControls({ branch, onClose, onForkBranch, onCreateBlankSandbox, onManageBranches }) {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const [isForking, setIsForking] = (0, react_1.useState)(false);
    const [isCreatingBlank, setIsCreatingBlank] = (0, react_1.useState)(false);
    const handleForkBranch = async () => {
        if (isForking)
            return;
        try {
            setIsForking(true);
            await editorEngine.branches.forkBranch(branch.id);
            onForkBranch?.();
            onClose?.();
        }
        catch (error) {
            console.error("Failed to fork branch:", error);
        }
        finally {
            setIsForking(false);
        }
    };
    const handleCreateBlankSandbox = async () => {
        if (isCreatingBlank)
            return;
        try {
            setIsCreatingBlank(true);
            await editorEngine.branches.createBlankSandbox();
            onCreateBlankSandbox?.();
            onClose?.();
        }
        catch (error) {
            console.error("Failed to create blank sandbox:", error);
        }
        finally {
            setIsCreatingBlank(false);
        }
    };
    const handleManageBranches = () => {
        // Open the branches tab in the left panel
        editorEngine.state.leftPanelTab = models_1.LeftPanelTabValue.BRANCHES;
        editorEngine.state.leftPanelLocked = true;
        editorEngine.state.branchTab = models_1.BranchTabValue.MANAGE;
        editorEngine.state.manageBranchId = branch.id;
        onManageBranches?.();
        onClose?.();
    };
    return (<div className="p-1">
            <dropdown_menu_1.DropdownMenuItem className="flex items-center gap-2 p-2" onSelect={handleForkBranch} disabled={isForking}>
                {isForking ? (<icons_1.Icons.LoadingSpinner className="h-4 w-4"/>) : (<icons_1.Icons.Branch className="h-4 w-4"/>)}
                <span>{isForking ? "Forking..." : "Fork into a new Branch"}</span>
            </dropdown_menu_1.DropdownMenuItem>
            <dropdown_menu_1.DropdownMenuItem className="flex items-center gap-2 p-2" onSelect={handleManageBranches}>
                <icons_1.Icons.Gear className="h-4 w-4"/>
                <span>Manage Branch</span>
            </dropdown_menu_1.DropdownMenuItem>
        </div>);
}
//# sourceMappingURL=branch-controls.js.map