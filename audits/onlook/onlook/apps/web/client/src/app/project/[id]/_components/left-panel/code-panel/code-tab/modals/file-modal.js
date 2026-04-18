"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileModal = void 0;
const button_1 = require("@onlook/ui/button");
const dialog_1 = require("@onlook/ui/dialog");
const input_1 = require("@onlook/ui/input");
const label_1 = require("@onlook/ui/label");
const utils_1 = require("@onlook/ui/utils");
const path_1 = __importDefault(require("path"));
const react_1 = require("react");
const file_templates_1 = require("../shared/file-templates");
const FileModal = ({ basePath, show, setShow, onSuccess, onCreateFile, }) => {
    const [name, setName] = (0, react_1.useState)('');
    const [currentPath, setCurrentPath] = (0, react_1.useState)(basePath);
    const [warning, setWarning] = (0, react_1.useState)('');
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [isComposing, setIsComposing] = (0, react_1.useState)(false);
    // Update currentPath when basePath prop changes
    (0, react_1.useEffect)(() => {
        setCurrentPath(basePath);
    }, [basePath]);
    const fullPath = (0, react_1.useMemo)(() => {
        if (!name)
            return '';
        return path_1.default.join(currentPath, name).replace(/\\/g, '/');
    }, [currentPath, name]);
    const title = 'Create New File';
    const buttonText = 'Create File';
    const loadingText = 'Creating file...';
    const placeholder = 'component.tsx';
    const handleSubmit = async () => {
        if (!name || warning)
            return;
        try {
            setIsLoading(true);
            const content = (0, file_templates_1.getFileTemplate)(name);
            await onCreateFile(fullPath, content);
            setName('');
            setCurrentPath(basePath);
            setWarning('');
            setShow(false);
            onSuccess?.();
        }
        catch (error) {
            console.error('Failed to create file:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create file';
            setWarning(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    };
    const displayPath = currentPath === '' ? '/' : `/${currentPath}`;
    return (<dialog_1.Dialog open={show} onOpenChange={(isOpen) => setShow(isOpen)}>
            <dialog_1.DialogContent>
                <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle>{title}</dialog_1.DialogTitle>
                    <dialog_1.DialogDescription>
                        Create a new file
                    </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label_1.Label htmlFor="path">
                            Directory Path
                        </label_1.Label>
                        <input_1.Input id="path" value={currentPath} onChange={(e) => setCurrentPath(e.target.value)} placeholder="/" disabled={isLoading} className="text-sm"/>
                        <p className="text-xs text-muted-foreground">
                            Path where the file will be created
                        </p>
                    </div>
                    <div className="space-y-2">
                        <label_1.Label htmlFor="name">
                            File Name
                        </label_1.Label>
                        <input_1.Input id="name" value={name} onChange={(e) => setName(e.target.value)} className={(0, utils_1.cn)(warning && 'border-yellow-300 focus-visible:ring-yellow-300')} placeholder={placeholder} disabled={isLoading} onKeyDown={(e) => {
            if (e.key === 'Enter' && !isComposing && !warning && name) {
                handleSubmit();
            }
        }} onCompositionStart={() => setIsComposing(true)} onCompositionEnd={() => setIsComposing(false)}/>
                        {warning && (<p className="text-sm text-yellow-300 flex items-center gap-2">
                                {warning}
                            </p>)}
                        {fullPath && !warning && (<p className="text-sm text-muted-foreground">
                                Full path: <code className="bg-background-secondary px-1 py-0.5 rounded text-xs">{fullPath}</code>
                            </p>)}
                    </div>
                </div>

                <dialog_1.DialogFooter>
                    <button_1.Button variant="ghost" onClick={() => setShow(false)} disabled={isLoading}>
                        Cancel
                    </button_1.Button>
                    <button_1.Button variant="outline" onClick={handleSubmit} disabled={isLoading || !!warning || !name}>
                        {isLoading ? loadingText : buttonText}
                    </button_1.Button>
                </dialog_1.DialogFooter>
            </dialog_1.DialogContent>
        </dialog_1.Dialog>);
};
exports.FileModal = FileModal;
//# sourceMappingURL=file-modal.js.map