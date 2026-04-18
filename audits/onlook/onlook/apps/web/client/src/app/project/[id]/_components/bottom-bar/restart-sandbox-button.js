"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestartSandboxButton = void 0;
const editor_1 = require("@/components/store/editor");
const icons_1 = require("@onlook/ui/icons");
const sonner_1 = require("@onlook/ui/sonner");
const tooltip_1 = require("@onlook/ui/tooltip");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
exports.RestartSandboxButton = (0, mobx_react_lite_1.observer)(({ className, }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const branches = editorEngine.branches;
    const [restarting, setRestarting] = (0, react_1.useState)(false);
    const timeoutIdRef = (0, react_1.useRef)(null);
    const [hasSandboxError, setHasSandboxError] = (0, react_1.useState)(false);
    const mountTimeRef = (0, react_1.useRef)(Date.now());
    const checkInterval = 10000;
    // Extract error checking logic with proper dependencies
    const checkForError = (0, react_1.useCallback)(() => {
        const activeBranch = branches.activeBranch;
        if (!activeBranch) {
            setHasSandboxError(false);
            return false; // Stop checking
        }
        const branchData = branches.getBranchDataById(activeBranch.id);
        const sandbox = branchData?.sandbox;
        if (!sandbox?.session) {
            setHasSandboxError(false);
            return false; // Stop checking if no session
        }
        if (sandbox.session.provider) {
            setHasSandboxError(false);
        }
        else {
            // Only show error after initial grace period
            const timeSinceMount = Date.now() - mountTimeRef.current;
            if (timeSinceMount >= 5000) {
                setHasSandboxError(true);
            }
        }
        return true; // Continue checking
    }, [branches]);
    // TODO: iFrame should also detect 502 errors and set hasSandboxError to true
    (0, react_1.useEffect)(() => {
        // Clear any existing timer first
        if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
            timeoutIdRef.current = null;
        }
        const scheduleNextCheck = () => {
            const shouldContinue = checkForError();
            if (shouldContinue) {
                timeoutIdRef.current = setTimeout(scheduleNextCheck, checkInterval);
            }
        };
        // Initial delay for grace period if needed
        const timeSinceMount = Date.now() - mountTimeRef.current;
        const initialDelay = timeSinceMount < 5000 ? 5000 - timeSinceMount : 0;
        timeoutIdRef.current = setTimeout(scheduleNextCheck, initialDelay);
        return () => {
            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current);
                timeoutIdRef.current = null;
            }
        };
    }, [checkForError, checkInterval]); // Re-run when checker or interval changes
    const handleRestartSandbox = async () => {
        try {
            if (restarting) {
                return;
            }
            const activeBranch = branches.activeBranch;
            if (!activeBranch)
                return;
            if (restarting) {
                return;
            }
            setRestarting(true);
            setHasSandboxError(false);
            // Reset mount time for grace period after restart
            mountTimeRef.current = Date.now();
            const sandbox = branches.getSandboxById(activeBranch.id);
            if (!sandbox?.session) {
                sonner_1.toast.error('Sandbox session not available');
                setRestarting(false);
                return;
            }
            const success = await sandbox.session.restartDevServer();
            if (success) {
                // Wait 5 seconds before refreshing webviews to avoid 502 errors
                setTimeout(() => {
                    const frames = editorEngine.frames.getByBranchId(activeBranch.id);
                    frames.forEach(frame => {
                        try {
                            editorEngine.frames.reloadView(frame.frame.id);
                        }
                        catch (frameError) {
                            console.error('Failed to reload frame:', frame.frame.id, frameError);
                        }
                    });
                    sonner_1.toast.success('Sandbox restarted successfully', {
                        icon: <icons_1.Icons.Cube className="h-4 w-4"/>,
                    });
                    setRestarting(false);
                }, 5000);
            }
            else {
                sonner_1.toast.error('Failed to restart sandbox');
            }
        }
        catch (error) {
            console.error('Error restarting sandbox:', error);
            sonner_1.toast.error('An error occurred while restarting the sandbox');
            setRestarting(false);
        }
    };
    const disabled = !branches.activeBranch || restarting;
    return (<tooltip_1.Tooltip>
            <tooltip_1.TooltipTrigger asChild>
                <button onClick={handleRestartSandbox} disabled={disabled} className={(0, utils_1.cn)("h-9 w-9 flex items-center justify-center rounded-md border border-transparent transition-colors", hasSandboxError
            ? "bg-amber-900 text-amber-200 hover:bg-amber-800 hover:text-amber-100"
            : restarting
                ? "text-foreground-tertiary bg-accent/30"
                : !disabled
                    ? "hover:text-foreground-hover text-foreground-tertiary hover:bg-accent/50"
                    : "text-foreground-disabled cursor-not-allowed opacity-50", className)}>
                    {restarting ? (<icons_1.Icons.LoadingSpinner className="h-4 w-4 animate-spin"/>) : (<icons_1.Icons.RestartSandbox className={(0, utils_1.cn)("h-4 w-4", hasSandboxError && "text-amber-200")}/>)}
                </button>
            </tooltip_1.TooltipTrigger>
            <tooltip_1.TooltipContent sideOffset={5} hideArrow>Restart Sandbox</tooltip_1.TooltipContent>
        </tooltip_1.Tooltip>);
});
//# sourceMappingURL=restart-sandbox-button.js.map