"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageModal = PageModal;
const editor_1 = require("@/components/store/editor");
const helper_1 = require("@/components/store/editor/pages/helper");
const button_1 = require("@onlook/ui/button");
const dialog_1 = require("@onlook/ui/dialog");
const input_1 = require("@onlook/ui/input");
const sonner_1 = require("@onlook/ui/sonner");
const utils_1 = require("@onlook/ui/utils");
const react_1 = require("react");
function PageModal({ open, onOpenChange, mode = 'create', baseRoute = '/', initialName = '', }) {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const [pageName, setPageName] = (0, react_1.useState)('');
    const [warning, setWarning] = (0, react_1.useState)('');
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const fullPath = (0, react_1.useMemo)(() => {
        if (mode === 'rename') {
            const parentPath = baseRoute.split('/').slice(0, -1).join('/');
            return (0, helper_1.normalizeRoute)(parentPath ? `${parentPath}/${pageName}` : pageName);
        }
        return (0, helper_1.normalizeRoute)(`${baseRoute}/${pageName}`);
    }, [baseRoute, pageName, mode]);
    const [isComposing, setIsComposing] = (0, react_1.useState)(false);
    const title = mode === 'create' ? 'Create a New Page' : 'Rename Page';
    const buttonText = mode === 'create' ? 'Create Page' : 'Rename Page';
    const loadingText = mode === 'create' ? 'Creating...' : 'Renaming...';
    // Reset page name when modal opens
    (0, react_1.useEffect)(() => {
        if (open) {
            setPageName(initialName);
        }
    }, [open, initialName]);
    (0, react_1.useEffect)(() => {
        if (!pageName) {
            setWarning('');
            return;
        }
        const { valid, error } = (0, helper_1.validateNextJsRoute)(pageName);
        if (!valid) {
            setWarning(error ?? 'Invalid page name');
            return;
        }
        if ((0, helper_1.doesRouteExist)(editorEngine.pages.tree, fullPath)) {
            setWarning('This page already exists');
            return;
        }
        setWarning('');
    }, [pageName, fullPath, editorEngine.pages.tree]);
    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            if (mode === 'create') {
                await editorEngine.pages.createPage(baseRoute, pageName);
                (0, sonner_1.toast)('Page created!');
            }
            else {
                await editorEngine.pages.renamePage(baseRoute, pageName);
                (0, sonner_1.toast)('Page renamed!');
            }
            setPageName('');
            onOpenChange(false);
        }
        catch (error) {
            console.error(`Failed to ${mode} page:`, error);
            setWarning(`Failed to ${mode} page. Please try again.`);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
            <dialog_1.DialogContent>
                <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle>{title}</dialog_1.DialogTitle>
                    <dialog_1.DialogDescription>
                        This page will be /{fullPath} on your site
                    </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="col-span-3 space-y-2">
                        <input_1.Input id="pageName" value={pageName} onChange={(e) => {
            setPageName(e.target.value.toLowerCase());
        }} className={(0, utils_1.cn)(warning && 'border-yellow-300 focus-visible:ring-yellow-300')} placeholder="about-us or [blog] for a dynamic page" disabled={isLoading} onKeyDown={(e) => {
            if (e.key === 'Enter' && !isComposing) {
                handleSubmit();
            }
        }} onCompositionStart={() => setIsComposing(true)} onCompositionEnd={() => setIsComposing(false)}/>
                        {warning && (<p className="text-sm text-yellow-300 flex items-center gap-2">
                                {warning}
                            </p>)}
                    </div>
                </div>

                <dialog_1.DialogFooter>
                    <button_1.Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Cancel
                    </button_1.Button>
                    <button_1.Button variant="outline" onClick={handleSubmit} disabled={isLoading || !!warning || !pageName}>
                        {isLoading ? <>{loadingText}</> : buttonText}
                    </button_1.Button>
                </dialog_1.DialogFooter>
            </dialog_1.DialogContent>
        </dialog_1.Dialog>);
}
//# sourceMappingURL=page-modal.js.map