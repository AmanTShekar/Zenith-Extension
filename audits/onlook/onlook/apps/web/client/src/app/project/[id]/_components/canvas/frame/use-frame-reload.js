"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFrameReload = useFrameReload;
const lodash_1 = require("lodash");
const react_1 = require("react");
// Reload timing constants
const RELOAD_BASE_DELAY_MS = 2000;
const RELOAD_INCREMENT_MS = 1000;
const PENPAL_BASE_TIMEOUT_MS = 5000;
const PENPAL_TIMEOUT_INCREMENT_MS = 2000;
const PENPAL_MAX_TIMEOUT_MS = 30000;
function useFrameReload() {
    const reloadCountRef = (0, react_1.useRef)(0);
    const reloadTimeoutRef = (0, react_1.useRef)(null);
    const [reloadKey, setReloadKey] = (0, react_1.useState)(0);
    const [isPenpalConnected, setIsPenpalConnected] = (0, react_1.useState)(false);
    const immediateReload = () => {
        setReloadKey(prev => prev + 1);
    };
    const scheduleReload = () => {
        if (reloadTimeoutRef.current) {
            clearTimeout(reloadTimeoutRef.current);
        }
        reloadCountRef.current += 1;
        const reloadDelay = RELOAD_BASE_DELAY_MS + (RELOAD_INCREMENT_MS * (reloadCountRef.current - 1));
        reloadTimeoutRef.current = setTimeout(() => {
            setReloadKey(prev => prev + 1);
            reloadTimeoutRef.current = null;
        }, reloadDelay);
    };
    const handleConnectionFailed = (0, lodash_1.debounce)(() => {
        setIsPenpalConnected(false);
        scheduleReload();
    }, 1000, { leading: true });
    const handleConnectionSuccess = () => {
        setIsPenpalConnected(true);
    };
    const getPenpalTimeout = () => {
        return Math.min(PENPAL_BASE_TIMEOUT_MS + (reloadCountRef.current * PENPAL_TIMEOUT_INCREMENT_MS), PENPAL_MAX_TIMEOUT_MS);
    };
    // Reset reload counter on successful connection
    (0, react_1.useEffect)(() => {
        if (isPenpalConnected && reloadCountRef.current > 0) {
            reloadCountRef.current = 0;
        }
    }, [isPenpalConnected]);
    // Reset connection state on reload
    (0, react_1.useEffect)(() => {
        setIsPenpalConnected(false);
    }, [reloadKey]);
    // Cleanup on unmount
    (0, react_1.useEffect)(() => {
        return () => {
            if (reloadTimeoutRef.current) {
                clearTimeout(reloadTimeoutRef.current);
            }
        };
    }, []);
    return {
        reloadKey,
        isPenpalConnected,
        immediateReload,
        handleConnectionFailed,
        handleConnectionSuccess,
        getPenpalTimeout,
    };
}
//# sourceMappingURL=use-frame-reload.js.map