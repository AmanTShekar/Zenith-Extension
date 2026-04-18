"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionRow = exports.VersionRowType = void 0;
const Context_1 = require("@/components/Context");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const tooltip_1 = require("@onlook/ui/tooltip");
const use_toast_1 = require("@onlook/ui/use-toast");
const utils_1 = require("@onlook/ui/utils");
const utility_1 = require("@onlook/utility");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
var VersionRowType;
(function (VersionRowType) {
    VersionRowType["SAVED"] = "saved";
    VersionRowType["TODAY"] = "today";
    VersionRowType["PREVIOUS_DAYS"] = "previous";
})(VersionRowType || (exports.VersionRowType = VersionRowType = {}));
exports.VersionRow = (0, mobx_react_lite_1.observer)(({ commit, type, autoRename = false, onRename, }) => {
    const projectsManager = (0, Context_1.useProjectsManager)();
    const editorEngine = (0, Context_1.useEditorEngine)();
    const inputRef = (0, react_1.useRef)(null);
    const [isRenaming, setIsRenaming] = (0, react_1.useState)(autoRename);
    const [commitDisplayName, setCommitDisplayName] = (0, react_1.useState)(commit.displayName || commit.message || 'Backup');
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
            return `${(0, utility_1.timeAgo)(new Date(commit.timestamp * 1000).toISOString())} ago`;
        }
        return (0, utility_1.formatCommitDate)(commit.timestamp, {
            includeDate: type === VersionRowType.SAVED,
        });
    };
    const updateCommitDisplayName = (name) => {
        projectsManager.versions?.renameCommit(commit.oid, name);
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
        setIsCheckingOut(true);
        const success = await projectsManager.versions?.checkoutCommit(commit);
        setIsCheckingOut(false);
        setIsCheckoutSuccess(success ?? false);
        if (!success) {
            console.error('Failed to checkout commit', commit.displayName || commit.message);
            (0, use_toast_1.toast)({
                title: 'Failed to restore',
                description: 'Please try again',
            });
            return;
        }
        setTimeout(() => {
            editorEngine.isSettingsOpen = false;
        }, 1000);
    };
    return (<div key={commit.oid} className="py-4 px-6 grid grid-cols-6 items-center justify-between hover:bg-background-secondary/80 transition-colors group">
                <span className="col-span-4 flex flex-col gap-0.5">
                    {isRenaming ? (<input_1.Input ref={inputRef} value={commitDisplayName} onChange={(e) => setCommitDisplayName(e.target.value)} onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                    e.currentTarget.blur();
                }
            }} onBlur={finishRenaming} className="p-0 pl-2 h-8 border border-transparent hover:border-border/50 focus-visible:border-primary/10 focus-visible:ring-0 focus-visible:outline-none focus-visible:bg-transparent bg-transparent hover:bg-transparent transition-all duration-100"/>) : (<span>{commit.displayName || commit.message || 'Backup'}</span>)}
                    <span className="text-muted-foreground font-light">
                        {commit.author.name}{' '}
                        <span className="text-xs mx-0.45 inline-block scale-75">•</span>{' '}
                        {renderDate()}
                    </span>
                </span>
                <span className="col-span-1 text-muted-foreground"></span>
                <div className={(0, utils_1.cn)('col-span-1 gap-2 flex justify-end group-hover:opacity-100 opacity-0 transition-opacity', (isCheckoutSuccess || isCheckingOut || isRenaming) && 'opacity-100')}>
                    {type === VersionRowType.SAVED ? (<button_1.Button variant="outline" size="sm" className="gap-2 bg-background-secondary" onClick={() => projectsManager.versions?.removeSavedCommit(commit)}>
                            <icons_1.Icons.BookmarkFilled />
                            <span className="text-muted-foreground">Remove</span>
                        </button_1.Button>) : (<button_1.Button variant="outline" size="sm" className="gap-2 bg-background-secondary hidden" onClick={() => projectsManager.versions?.saveCommit(commit)}>
                            <icons_1.Icons.Bookmark />
                            <span className="text-muted-foreground">Save</span>
                        </button_1.Button>)}
                    {isCheckoutSuccess ? (<button_1.Button variant="outline" size="sm" className="gap-2 bg-background-secondary">
                            <icons_1.Icons.Check className="h-4 w-4 text-green-500"/>
                            <span className="text-muted-foreground">Restored</span>
                        </button_1.Button>) : (<div className="flex flex-row gap-2">
                            <tooltip_1.Tooltip>
                                <tooltip_1.TooltipTrigger asChild>
                                    <button_1.Button variant="ghost" size="sm" className="bg-background-tertiary/70 hover:bg-background-tertiary" onClick={startRenaming} disabled={isRenaming || isCheckingOut}>
                                        <icons_1.Icons.Pencil className="h-4 w-4 mr-2"/>
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
                                        <icons_1.Icons.CounterClockwiseClock className="h-4 w-4 mr-2"/>
                                        {isCheckingOut ? 'Restoring...' : 'Restore'}
                                    </button_1.Button>
                                </tooltip_1.TooltipTrigger>
                                <tooltip_1.TooltipContent>Restore project to this version</tooltip_1.TooltipContent>
                            </tooltip_1.Tooltip>
                        </div>)}
                </div>
            </div>);
});
//# sourceMappingURL=VersionRow.js.map