"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTabActive = useTabActive;
const react_1 = require("react");
function useTabActive() {
    const [tabState, setTabState] = (0, react_1.useState)('active');
    const previousStateRef = (0, react_1.useRef)('active');
    (0, react_1.useEffect)(() => {
        const handleVisibilityChange = () => {
            const isVisible = document.visibilityState === 'visible';
            const previousState = previousStateRef.current;
            if (isVisible) {
                const newState = previousState === 'inactive' ? 'reactivated' : 'active';
                setTabState(newState);
                previousStateRef.current = newState;
            }
            else {
                setTabState('inactive');
                previousStateRef.current = 'inactive';
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);
    return { tabState };
}
//# sourceMappingURL=use-tab-active.js.map