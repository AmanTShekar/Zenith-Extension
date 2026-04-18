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
exports.DraftableInput = void 0;
exports.useDraftValue = useDraftValue;
const React = __importStar(require("react"));
const react_merge_refs_1 = require("react-merge-refs");
function useDraftValue(value, onChange) {
    const [draft, setDraft] = React.useState(value);
    React.useEffect(() => {
        setDraft(value);
    }, [value]);
    return [draft, setDraft, () => onChange(draft)];
}
const DraftableInput = React.forwardRef(({ value, placeholder, onChangeValue, ...props }, ref) => {
    const inputRef = React.createRef();
    const [draft, onDraftChange, onDraftChangeDone] = useDraftValue(value ?? '', onChangeValue ?? (() => { }));
    React.useEffect(() => {
        const input = inputRef.current;
        if (input) {
            const onChangeNative = () => {
                onDraftChangeDone();
            };
            input.addEventListener('change', onChangeNative);
            return () => {
                input.removeEventListener('change', onChangeNative);
            };
        }
    }, [inputRef, onDraftChangeDone]);
    return (<input {...props} value={draft} placeholder={placeholder} onChange={(e) => onDraftChange(e.currentTarget.value)} ref={(0, react_merge_refs_1.mergeRefs)([inputRef, ref])}/>);
});
exports.DraftableInput = DraftableInput;
DraftableInput.displayName = 'DraftableInput';
//# sourceMappingURL=draftable-input.js.map