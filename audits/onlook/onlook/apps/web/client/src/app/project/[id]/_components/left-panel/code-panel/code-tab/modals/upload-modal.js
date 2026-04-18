"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadModal = void 0;
const button_1 = require("@onlook/ui/button");
const dialog_1 = require("@onlook/ui/dialog");
const input_1 = require("@onlook/ui/input");
const label_1 = require("@onlook/ui/label");
const sonner_1 = require("@onlook/ui/sonner");
const utils_1 = require("@onlook/ui/utils");
const utility_1 = require("@onlook/utility");
const path_1 = __importDefault(require("path"));
const react_1 = require("react");
const UploadModal = ({ basePath, show, setShow, onSuccess, onCreateFile, }) => {
    const [currentPath, setCurrentPath] = (0, react_1.useState)(basePath);
    const [selectedFiles, setSelectedFiles] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [isDragging, setIsDragging] = (0, react_1.useState)(false);
    // Update currentPath when basePath prop changes
    (0, react_1.useEffect)(() => {
        setCurrentPath(basePath);
    }, [basePath]);
    const handleFileSelect = (event) => {
        setSelectedFiles(event.target.files);
    };
    const handleDrop = (0, react_1.useCallback)((event) => {
        event.preventDefault();
        setIsDragging(false);
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            setSelectedFiles(files);
        }
    }, []);
    const handleDragOver = (0, react_1.useCallback)((event) => {
        event.preventDefault();
        setIsDragging(true);
    }, []);
    const handleDragLeave = (0, react_1.useCallback)((event) => {
        event.preventDefault();
        setIsDragging(false);
    }, []);
    const handleSubmit = async () => {
        if (!selectedFiles || selectedFiles.length === 0)
            return;
        try {
            setIsLoading(true);
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                if (!file)
                    continue;
                const fileName = file.name;
                const fullPath = path_1.default.join(currentPath, fileName).replace(/\\/g, '/');
                const isBinary = (0, utility_1.isBinaryFile)(fileName);
                const content = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        if (isBinary) {
                            // For binary files, convert ArrayBuffer to Uint8Array
                            resolve(new Uint8Array(reader.result));
                        }
                        else {
                            // For text files, use string result
                            resolve(reader.result);
                        }
                    };
                    reader.onerror = () => reject(reader.error);
                    // Use appropriate read method
                    if (isBinary) {
                        reader.readAsArrayBuffer(file);
                    }
                    else {
                        reader.readAsText(file);
                    }
                });
                await onCreateFile(fullPath, content);
            }
            const fileCount = selectedFiles.length;
            (0, sonner_1.toast)(`${fileCount} file${fileCount > 1 ? 's' : ''} uploaded successfully!`);
            setSelectedFiles(null);
            setCurrentPath(basePath);
            setShow(false);
            onSuccess?.();
        }
        catch (error) {
            console.error('Failed to upload files:', error);
            sonner_1.toast.error(`Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        finally {
            setIsLoading(false);
        }
    };
    const clearSelection = () => {
        setSelectedFiles(null);
        // Reset file input
        const fileInput = document.getElementById('file-upload');
        if (fileInput) {
            fileInput.value = '';
        }
    };
    return (<dialog_1.Dialog open={show} onOpenChange={(isOpen) => {
            setShow(isOpen);
            if (!isOpen) {
                clearSelection();
            }
        }}>
            <dialog_1.DialogContent>
                <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle>Upload Files</dialog_1.DialogTitle>
                    <dialog_1.DialogDescription>
                        Upload files to your project
                    </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label_1.Label htmlFor="path">
                            Directory Path
                        </label_1.Label>
                        <input_1.Input id="path" value={currentPath} onChange={(e) => setCurrentPath(e.target.value)} placeholder="/" disabled={isLoading} className="text-sm"/>
                        <p className="text-xs text-muted-foreground">
                            Path where files will be uploaded
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label_1.Label htmlFor="file-upload">
                            Select Files
                        </label_1.Label>
                        <div className={(0, utils_1.cn)("border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer hover:border-primary/50", isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25", selectedFiles && selectedFiles.length > 0 ? "border-green-500" : "")} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onClick={() => document.getElementById('file-upload')?.click()}>
                            <input id="file-upload" type="file" multiple onChange={handleFileSelect} className="hidden" disabled={isLoading}/>

                            <div className="text-center">
                                {selectedFiles && selectedFiles.length > 0 ? (<div className="space-y-2">
                                        <p className="text-sm font-medium text-green-500">
                                            {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                                        </p>
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            {Array.from(selectedFiles).map((file, index) => (<div key={index}>
                                                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                                </div>))}
                                        </div>
                                        <button_1.Button variant="outline" size="sm" onClick={(e) => {
                e.stopPropagation();
                clearSelection();
            }} disabled={isLoading}>
                                            Clear Selection
                                        </button_1.Button>
                                    </div>) : (<div className="space-y-2">
                                        <p className="text-sm">
                                            Drag and drop files here, or click to select
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Multiple files can be selected
                                        </p>
                                    </div>)}
                            </div>
                        </div>
                    </div>
                </div>

                <dialog_1.DialogFooter>
                    <button_1.Button variant="ghost" onClick={() => setShow(false)} disabled={isLoading}>
                        Cancel
                    </button_1.Button>
                    <button_1.Button variant="outline" onClick={handleSubmit} disabled={isLoading || !selectedFiles || selectedFiles.length === 0}>
                        {isLoading ? 'Uploading...' : `Upload ${selectedFiles?.length || 0} file${selectedFiles && selectedFiles.length > 1 ? 's' : ''}`}
                    </button_1.Button>
                </dialog_1.DialogFooter>
            </dialog_1.DialogContent>
        </dialog_1.Dialog>);
};
exports.UploadModal = UploadModal;
//# sourceMappingURL=upload-modal.js.map