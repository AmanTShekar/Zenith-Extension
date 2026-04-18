"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalArea = void 0;
const editor_1 = require("@/components/store/editor");
const icons_1 = require("@onlook/ui/icons");
const tabs_1 = require("@onlook/ui/tabs");
const tooltip_1 = require("@onlook/ui/tooltip");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const react_2 = require("react");
const restart_sandbox_button_1 = require("./restart-sandbox-button");
const terminal_1 = require("./terminal");
exports.TerminalArea = (0, mobx_react_lite_1.observer)(({ children }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const branches = editorEngine.branches;
    // Collect terminal sessions from all branches
    const allTerminalSessions = new Map();
    let activeSessionId = null;
    for (const branch of branches.allBranches) {
        try {
            const branchData = branches.getBranchById(branch.id);
            if (!branchData)
                continue;
            // Get the sandbox manager for this branch
            const sandbox = branches.getSandboxById(branch.id);
            if (!sandbox?.session?.terminalSessions)
                continue;
            for (const [sessionId, session] of sandbox.session.terminalSessions) {
                const key = `${branch.id}-${sessionId}`;
                allTerminalSessions.set(key, {
                    name: session.name,
                    branchName: branch.name,
                    branchId: branch.id,
                    sessionId: sessionId,
                    session: session
                });
                // Set active session if this is the currently active branch and session
                if (branch.id === branches.activeBranch.id && sessionId === sandbox.session.activeTerminalSessionId) {
                    activeSessionId = key;
                }
            }
        }
        catch (error) {
            // Skip branches that aren't properly initialized
            continue;
        }
    }
    const [terminalHidden, setTerminalHidden] = (0, react_2.useState)(true);
    return (<>
            {terminalHidden ? (<react_1.motion.div layout className="flex items-center gap-1">
                    {children}
                    <restart_sandbox_button_1.RestartSandboxButton />
                    <tooltip_1.Tooltip>
                        <tooltip_1.TooltipTrigger asChild>
                            <button onClick={() => setTerminalHidden(!terminalHidden)} className="h-9 w-9 flex items-center justify-center hover:text-foreground-hover text-foreground-tertiary hover:bg-accent/50 rounded-md border border-transparent">
                                <icons_1.Icons.Terminal />
                            </button>
                        </tooltip_1.TooltipTrigger>
                        <tooltip_1.TooltipContent sideOffset={5} hideArrow>Toggle Terminal</tooltip_1.TooltipContent>
                    </tooltip_1.Tooltip>
                </react_1.motion.div>) : (<react_1.motion.div layout className="flex items-center justify-between w-full mb-1">
                    <react_1.motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.7 }} className="text-small text-foreground-secondary ml-2 select-none">
                        Terminal
                    </react_1.motion.span>
                    <div className="flex items-center gap-1">
                        <react_1.motion.div layout>{/* <RunButton /> */}</react_1.motion.div>
                        <restart_sandbox_button_1.RestartSandboxButton />
                        <tooltip_1.Tooltip>
                            <tooltip_1.TooltipTrigger asChild>
                                <button onClick={() => setTerminalHidden(!terminalHidden)} className="h-9 w-9 flex items-center justify-center hover:text-foreground-hover text-foreground-tertiary hover:bg-accent/50 rounded-md border border-transparent">
                                    <icons_1.Icons.ChevronDown />
                                </button>
                            </tooltip_1.TooltipTrigger>
                            <tooltip_1.TooltipContent sideOffset={5} hideArrow>Toggle Terminal</tooltip_1.TooltipContent>
                        </tooltip_1.Tooltip>
                    </div>
                </react_1.motion.div>)}
            <div className={(0, utils_1.cn)('bg-background rounded-lg transition-all duration-300 flex flex-col items-center justify-between h-full overflow-auto', terminalHidden ? 'h-0 w-0 invisible' : 'h-[22rem] w-[37rem]')}>
                {allTerminalSessions.size > 0 ? (<tabs_1.Tabs defaultValue={'cli'} value={activeSessionId || ''} onValueChange={(value) => {
                // Extract branch and session from the combined key
                const terminalData = allTerminalSessions.get(value);
                if (terminalData) {
                    // Switch to the branch first
                    editorEngine.branches.switchToBranch(terminalData.branchId);
                    // Then set the active terminal session for that branch
                    const sandbox = branches.getSandboxById(terminalData.branchId);
                    if (sandbox) {
                        sandbox.session.activeTerminalSessionId = terminalData.sessionId;
                    }
                }
            }} className="w-full h-full">
                        <tabs_1.TabsList className="w-full h-8 rounded-none border-b border-border overflow-x-auto justify-start">
                            {Array.from(allTerminalSessions).map(([key, terminalData]) => (<tabs_1.TabsTrigger key={key} value={key} className="flex-1">
                                    <span className="truncate">
                                        {terminalData.name} • {terminalData.branchName}
                                    </span>
                                </tabs_1.TabsTrigger>))}
                        </tabs_1.TabsList>
                        <div className="w-full h-full overflow-auto">
                            {Array.from(allTerminalSessions).map(([key, terminalData]) => (<tabs_1.TabsContent key={key} forceMount value={key} className="h-full" hidden={activeSessionId !== key}>
                                    <terminal_1.Terminal hidden={terminalHidden} terminalSessionId={terminalData.sessionId} branchId={terminalData.branchId}/>
                                </tabs_1.TabsContent>))}
                        </div>
                    </tabs_1.Tabs>) : (<div className="flex items-center justify-center h-full text-muted-foreground">
                        <span className="text-sm">No terminal sessions available</span>
                    </div>)}
            </div>
        </>);
});
//# sourceMappingURL=terminal-area.js.map