"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSandboxTimeout = useSandboxTimeout;
const editor_1 = require("@/components/store/editor");
const sonner_1 = require("@onlook/ui/sonner");
const react_1 = require("react");
const SANDBOX_TIMEOUT_MS = 30000;
function useSandboxTimeout(frame, onTimeout) {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const [hasTimedOut, setHasTimedOut] = (0, react_1.useState)(false);
    const branchData = editorEngine.branches.getBranchDataById(frame.branchId);
    const isConnecting = branchData?.sandbox?.session?.isConnecting ?? false;
    (0, react_1.useEffect)(() => {
        if (!isConnecting) {
            setHasTimedOut(false);
            return;
        }
        const timeoutId = setTimeout(() => {
            const currentBranchData = editorEngine.branches.getBranchDataById(frame.branchId);
            const stillConnecting = currentBranchData?.sandbox?.session?.isConnecting ?? false;
            if (stillConnecting) {
                console.log(`[Frame ${frame.id}] Sandbox connection timeout after ${SANDBOX_TIMEOUT_MS}ms`);
                sonner_1.toast.info('Connection slow, retrying...', {
                    description: `Reconnecting to ${currentBranchData?.branch?.name}...`,
                });
                setHasTimedOut(true);
                onTimeout();
            }
        }, SANDBOX_TIMEOUT_MS);
        return () => clearTimeout(timeoutId);
    }, [isConnecting, frame.branchId, frame.id, onTimeout, editorEngine]);
    return { hasTimedOut, isConnecting };
}
//# sourceMappingURL=use-sandbox-timeout.js.map