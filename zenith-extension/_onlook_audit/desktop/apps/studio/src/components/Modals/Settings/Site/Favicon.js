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
exports.UploadButton = exports.Favicon = void 0;
const Context_1 = require("@/components/Context");
const button_1 = require("@onlook/ui/button");
const react_1 = __importStar(require("react"));
exports.Favicon = (0, react_1.forwardRef)(({ onImageSelect, url }, ref) => {
    const [selectedImage, setSelectedImage] = (0, react_1.useState)(url ?? null);
    const [isDragging, setIsDragging] = (0, react_1.useState)(false);
    const fileInputRef = (0, react_1.useRef)(null);
    const editorEngine = (0, Context_1.useEditorEngine)();
    (0, react_1.useEffect)(() => {
        if (url) {
            const image = editorEngine.image.assets.find((image) => url?.includes(image.fileName));
            if (image) {
                setSelectedImage(image.content);
            }
        }
    }, [url]);
    const handleDragOver = (0, react_1.useCallback)((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);
    const handleDragLeave = (0, react_1.useCallback)((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);
    const handleDrop = (0, react_1.useCallback)((e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find((file) => file.type.startsWith('image/'));
        if (imageFile) {
            saveImage(imageFile);
        }
    }, []);
    const handleFileSelect = (0, react_1.useCallback)((e) => {
        const files = Array.from(e.target.files || []);
        const imageFile = files.find((file) => file.type.startsWith('image/'));
        if (imageFile) {
            saveImage(imageFile);
        }
    }, []);
    const handleButtonClick = (0, react_1.useCallback)((e) => {
        e.preventDefault();
        fileInputRef.current?.click();
    }, []);
    const reset = (0, react_1.useCallback)(() => {
        if (url) {
            const image = editorEngine.image.assets.find((image) => url?.includes(image.fileName));
            if (image) {
                setSelectedImage(image.content);
            }
            else {
                setSelectedImage(url);
            }
        }
        else {
            setSelectedImage(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [url, editorEngine.image.assets]);
    (0, react_1.useImperativeHandle)(ref, () => ({
        reset,
    }), [reset]);
    const saveImage = (0, react_1.useCallback)(async (file) => {
        const url = URL.createObjectURL(file);
        setSelectedImage(url);
        onImageSelect(file);
    }, [onImageSelect]);
    return (<div className="p-2">
            <div className={`group h-16 w-16 bg-background-secondary rounded flex items-center justify-center p-4 
                    ${isDragging ? 'border-2 border-dashed border-primary' : ''}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                <input ref={fileInputRef} type="file" accept=".ico" className="hidden" id="favicon-upload" onChange={handleFileSelect}/>
                {selectedImage && <img src={selectedImage}/>}
            </div>
            <exports.UploadButton onButtonClick={handleButtonClick}/>
        </div>);
});
exports.Favicon.displayName = 'Favicon';
const UploadButton = ({ onButtonClick, }) => (<button_1.Button variant="secondary" className="flex items-center gap-2 px-4 py-0 backdrop-blur-sm rounded border border-foreground-tertiary/20 mt-2" type="button" onClick={onButtonClick}>
        <span>Upload Image</span>
    </button_1.Button>);
exports.UploadButton = UploadButton;
//# sourceMappingURL=Favicon.js.map