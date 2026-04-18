"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useReducedMotion = useReducedMotion;
const react_1 = require("react");
function useReducedMotion() {
    const [prefersReducedMotion, setPrefersReducedMotion] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        function onChange(event) {
            setPrefersReducedMotion(event.matches);
        }
        const result = matchMedia('(prefers-reduced-motion: reduce)');
        result.addEventListener('change', onChange);
        setPrefersReducedMotion(result.matches);
        return () => result.removeEventListener('change', onChange);
    }, []);
    return prefersReducedMotion;
}
//# sourceMappingURL=use-reduced-motion.js.map