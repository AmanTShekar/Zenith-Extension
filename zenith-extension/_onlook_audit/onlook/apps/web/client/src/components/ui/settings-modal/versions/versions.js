"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Versions = void 0;
const editor_1 = require("@/components/store/editor");
const accordion_1 = require("@onlook/ui/accordion");
const button_1 = require("@onlook/ui/button");
const index_1 = require("@onlook/ui/icons/index");
const select_1 = require("@onlook/ui/select");
const separator_1 = require("@onlook/ui/separator");
const sonner_1 = require("@onlook/ui/sonner");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = __importStar(require("react"));
const version_1 = require("./empty-state/version");
const version_row_1 = require("./version-row");
exports.Versions = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const [commitToRename, setCommitToRename] = (0, react_1.useState)(null);
    const [isCreatingBackup, setIsCreatingBackup] = (0, react_1.useState)(false);
    const selectedBranchId = editorEngine.branches.activeBranch.id;
    const branchData = editorEngine.branches.getBranchDataById(selectedBranchId);
    const gitManager = branchData?.sandbox.gitManager;
    const commits = gitManager?.commits;
    const isLoadingCommits = gitManager?.isLoadingCommits;
    // Group commits by date
    const groupedCommits = commits?.reduce((acc, commit) => {
        const date = new Date(commit.timestamp * 1000);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        let dateKey;
        if (date.toDateString() === today.toDateString()) {
            dateKey = 'Today';
        }
        else if (date.toDateString() === yesterday.toDateString()) {
            dateKey = 'Yesterday';
        }
        else {
            // Format the date in a more human-readable way
            dateKey = date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            });
        }
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey]?.push(commit);
        return acc;
    }, {});
    const handleNewBackup = async () => {
        try {
            setIsCreatingBackup(true);
            if (!gitManager) {
                sonner_1.toast.error('Git not initialized');
                return;
            }
            const result = await gitManager.createCommit();
            if (!result.success) {
                sonner_1.toast.error('Failed to create backup', {
                    description: result.error || 'Unknown error',
                });
                return;
            }
            sonner_1.toast.success('Backup created successfully!');
            editorEngine.posthog.capture('versions_create_commit_success');
            const latestCommit = gitManager.commits?.[0];
            if (!latestCommit) {
                console.error('No latest commit found');
                return;
            }
            setCommitToRename(latestCommit.oid);
        }
        catch (error) {
            sonner_1.toast.error('Failed to create backup', {
                description: error instanceof Error ? error.message : 'Unknown error',
            });
        }
        finally {
            setIsCreatingBackup(false);
        }
    };
    return (<div className="flex flex-col text-sm">
            <div className="flex flex-row justify-center items-center gap-3 px-6 py-6">
                <h2 className="text-lg">Backup Versions</h2>

                {isLoadingCommits && (<index_1.Icons.LoadingSpinner className="h-4 w-4 animate-spin"/>)}

                {/* Branch selector */}
                <select_1.Select value={selectedBranchId} onValueChange={(value) => { editorEngine.branches.switchToBranch(value); }}>
                    <select_1.SelectTrigger className="min-w-38 ml-auto">
                        <select_1.SelectValue placeholder="Select branch"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                        {editorEngine.branches.allBranches.map((branch) => (<select_1.SelectItem key={branch.id} value={branch.id}>
                                {branch.name}
                            </select_1.SelectItem>))}
                    </select_1.SelectContent>
                </select_1.Select>
                {gitManager && (<button_1.Button variant="outline" className="bg-background-secondary rounded text-sm font-normal " onClick={handleNewBackup} disabled={isLoadingCommits || isCreatingBackup}>
                        {isCreatingBackup ? (<index_1.Icons.LoadingSpinner className="h-4 w-4 animate-spin mr-2"/>) : (<index_1.Icons.Plus className="mr-2 h-4 w-4"/>)}
                        New backup
                    </button_1.Button>)}
            </div>
            <separator_1.Separator />

            {commits && commits.length > 0 ? (<div className="flex flex-col gap-2">
                    <accordion_1.Accordion type="multiple" defaultValue={Object.keys(groupedCommits || {})}>
                        {groupedCommits &&
                Object.entries(groupedCommits).map(([date, dateCommits]) => (<accordion_1.AccordionItem key={date} value={date}>
                                    <accordion_1.AccordionTrigger className="text-muted-foreground px-6 py-4 text-base font-normal">
                                        {date}
                                    </accordion_1.AccordionTrigger>
                                    <accordion_1.AccordionContent>
                                        <div className="flex flex-col">
                                            {dateCommits.map((commit, index) => (<react_1.default.Fragment key={commit.oid}>
                                                    <version_row_1.VersionRow commit={commit} type={date === 'Today'
                            ? version_row_1.VersionRowType.TODAY
                            : version_row_1.VersionRowType.PREVIOUS_DAYS} autoRename={commit.oid === commitToRename} onRename={() => setCommitToRename(null)}/>
                                                    {index < dateCommits.length - 1 && (<separator_1.Separator className="bg-border mx-6 w-[calc(100%-theme(spacing.12))]"/>)}
                                                </react_1.default.Fragment>))}
                                        </div>
                                    </accordion_1.AccordionContent>
                                </accordion_1.AccordionItem>))}
                    </accordion_1.Accordion>
                </div>) : (<version_1.NoVersions />)}
        </div>);
});
//# sourceMappingURL=versions.js.map