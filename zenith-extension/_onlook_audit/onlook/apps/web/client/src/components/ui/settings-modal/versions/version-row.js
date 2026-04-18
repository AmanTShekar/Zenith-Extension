"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionRow = exports.VersionRowType = void 0;
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const models_1 = require("@onlook/models");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const sonner_1 = require("@onlook/ui/sonner");
const tooltip_1 = require("@onlook/ui/tooltip");
const utils_1 = require("@onlook/ui/utils");
const utility_1 = require("@onlook/utility");
const editor_1 = require("@/components/store/editor");
const git_1 = require("@/components/store/editor/git");
const state_1 = require("@/components/store/state");
var VersionRowType;
(function (VersionRowType) {
    VersionRowType["SAVED"] = "saved";
    VersionRowType["TODAY"] = "today";
    VersionRowType["PREVIOUS_DAYS"] = "previous";
})(VersionRowType || (exports.VersionRowType = VersionRowType = {}));
exports.VersionRow = (0, mobx_react_lite_1.observer)(({ commit, type, autoRename = false, onRename, }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const stateManager = (0, state_1.useStateManager)();
    const inputRef = (0, react_1.useRef)(null);
    const [isRenaming, setIsRenaming] = (0, react_1.useState)(autoRename);
    const [commitDisplayName, setCommitDisplayName] = (0, react_1.useState)(commit.displayName ?? commit.message ?? 'Backup');
    const [isCheckingOut, setIsCheckingOut] = (0, react_1.useState)(false);
    const [isCheckoutSuccess, setIsCheckoutSuccess] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (autoRename) {
            startRenaming();
        }
    }, [autoRename]);
    (0, react_1.useEffect)(() => {
        if (isCheckoutSuccess) {
            setTimeout(() => {
                setIsCheckoutSuccess(false);
            }, 1000);
        }
    }, [isCheckoutSuccess]);
    const renderDate = () => {
        if (type === VersionRowType.TODAY) {
            return `${(0, utility_1.timeAgo)(new Date(commit.timestamp * 1000))} ago`;
        }
        return (0, utility_1.formatCommitDate)(commit.timestamp, {
            includeDate: type === VersionRowType.SAVED,
        });
    };
    const updateCommitDisplayName = async (name) => {
        const branchData = editorEngine.branches.activeBranchData;
        if (!branchData) {
            sonner_1.toast.error('No active branch');
            return;
        }
        const result = await branchData.sandbox.gitManager.addCommitNote(commit.oid, name);
        if (!result.success) {
            sonner_1.toast.error('Failed to rename backup');
            editorEngine.posthog.capture('versions_rename_commit_failed', {
                commit: commit.oid,
                newName: name,
                error: result.error,
            });
            return;
        }
        sonner_1.toast.success('Backup renamed successfully!', {
            description: `Renamed to: "${name}"`,
        });
        editorEngine.posthog.capture('versions_rename_commit_success', {
            commit: commit.oid,
            newName: name,
        });
    };
    const startRenaming = () => {
        setIsRenaming(true);
        setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        }, 100);
    };
    const finishRenaming = () => {
        updateCommitDisplayName(commitDisplayName);
        setIsRenaming(false);
        onRename?.();
    };
    const handleCheckout = async () => {
        try {
            setIsCheckingOut(true);
            editorEngine.posthog.capture('versions_checkout_commit', {
                commit: commit.displayName ?? commit.message,
            });
            const checkpoint = {
                type: models_1.MessageCheckpointType.GIT,
                oid: commit.oid,
                branchId: editorEngine.branches.activeBranch.id,
                createdAt: new Date(),
            };
            const result = await (0, git_1.restoreCheckpoint)(checkpoint, editorEngine);
            setIsCheckingOut(false);
            if (!result.success) {
                editorEngine.posthog.capture('versions_checkout_commit_failed', {
                    commit: commit.displayName || commit.message,
                    error: result.error,
                });
                setIsCheckoutSuccess(false);
                return;
            }
            editorEngine.posthog.capture('versions_checkout_commit_success', {
                commit: commit.displayName || commit.message,
            });
            setIsCheckoutSuccess(true);
            setTimeout(() => {
                stateManager.isSettingsModalOpen = false;
            }, 1000);
        }
        catch (error) {
            sonner_1.toast.error('Failed to restore backup', {
                description: error instanceof Error ? error.message : 'Unknown error',
            });
        }
        finally {
            setIsCheckingOut(false);
        }
    };
    return (<div key={commit.oid} className="hover:bg-background-secondary/80 group grid grid-cols-6 items-center justify-between px-6 py-4 transition-colors">
                <span className="col-span-4 flex flex-col gap-0.5">
                    <div className="flex h-8 items-center">
                        {isRenaming ? (<input_1.Input ref={inputRef} value={commitDisplayName} onChange={(e) => setCommitDisplayName(e.target.value)} onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                    e.currentTarget.blur();
                }
            }} onBlur={finishRenaming} className="hover:border-border/50 focus-visible:border-primary/10 -mt-0.5 -ml-[10px] h-8 w-full border border-transparent bg-transparent p-0 pl-2 transition-all duration-100 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:outline-none"/>) : (<span>{commit.displayName ?? commit.message ?? 'Backup'}</span>)}
                    </div>
                    <span className="text-muted-foreground font-light">
                        {commit.author.name}{' '}
                        <span className="mx-0.45 inline-block scale-75 text-xs">•</span>{' '}
                        {renderDate()}
                    </span>
                </span>
                <span className="text-muted-foreground col-span-1"></span>
                <div className={(0, utils_1.cn)('col-span-1 flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100', (isCheckoutSuccess || isCheckingOut || isRenaming) && 'opacity-100')}>
                    {isCheckoutSuccess ? (<button_1.Button variant="outline" size="sm" className="bg-background-secondary gap-2">
                            <icons_1.Icons.Check className="h-4 w-4 text-green-500"/>
                            <span className="text-muted-foreground">Restored</span>
                        </button_1.Button>) : (<div className="flex flex-row gap-2">
                            <tooltip_1.Tooltip>
                                <tooltip_1.TooltipTrigger asChild>
                                    <button_1.Button variant="ghost" size="sm" className="bg-background-tertiary/70 hover:bg-background-tertiary" onClick={startRenaming} disabled={isRenaming || isCheckingOut}>
                                        <icons_1.Icons.Pencil className="mr-2 h-4 w-4"/>
                                        Rename
                                    </button_1.Button>
                                </tooltip_1.TooltipTrigger>
                                <tooltip_1.TooltipContent>
                                    Rename backup for easier identification
                                </tooltip_1.TooltipContent>
                            </tooltip_1.Tooltip>
                            <tooltip_1.Tooltip>
                                <tooltip_1.TooltipTrigger asChild>
                                    <button_1.Button variant="ghost" size="sm" className="bg-background-tertiary/70 hover:bg-background-tertiary" onClick={handleCheckout} disabled={isCheckingOut}>
                                        <icons_1.Icons.CounterClockwiseClock className="mr-2 h-4 w-4"/>
                                        {isCheckingOut ? 'Restoring...' : 'Restore'}
                                    </button_1.Button>
                                </tooltip_1.TooltipTrigger>
                                <tooltip_1.TooltipContent>Restore project to this version</tooltip_1.TooltipContent>
                            </tooltip_1.Tooltip>
                        </div>)}
                </div>
            </div>);
});
//# sourceMappingURL=version-row.js.map