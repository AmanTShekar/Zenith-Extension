"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEnterSubmit = useEnterSubmit;
const react_1 = require("react");
function useEnterSubmit() {
    const formRef = (0, react_1.useRef)(null);
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
            formRef.current?.requestSubmit();
            event.preventDefault();
        }
    };
    return { formRef, onKeyDown: handleKeyDown };
}
//# sourceMappingURL=use-enter-submit.js.map