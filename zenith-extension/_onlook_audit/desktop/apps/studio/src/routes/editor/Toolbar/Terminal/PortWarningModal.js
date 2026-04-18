"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const models_1 = require("@/lib/models");
const button_1 = require("@onlook/ui/button");
const dialog_1 = require("@onlook/ui/dialog");
const index_1 = require("@onlook/ui/icons/index");
const utils_1 = require("@onlook/ui/utils");
const framer_motion_1 = require("framer-motion");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const PortWarningModal = (0, mobx_react_lite_1.observer)(({ open, onOpenChange }) => {
    const projectsManager = (0, Context_1.useProjectsManager)();
    const editorEngine = (0, Context_1.useEditorEngine)();
    const portManager = projectsManager.runner?.port;
    const [showStillTaken, setShowStillTaken] = (0, react_1.useState)(false);
    if (!portManager) {
        console.error('Port manager not found');
        return null;
    }
    (0, react_1.useEffect)(() => {
        portManager.listenForPortChanges();
        return () => portManager.clearPortCheckInterval();
    }, [portManager]);
    const handleChangePort = () => {
        editorEngine.settingsTab = models_1.SettingsTabValue.PROJECT;
        onOpenChange(false);
        editorEngine.isSettingsOpen = true;
    };
    const getMessage = () => showStillTaken
        ? `Port ${portManager.currentPort} is still occupied. Check your other IDE.`
        : `Port ${portManager.currentPort} is currently in use.`;
    const handleRefresh = async () => {
        try {
            await portManager.checkPort();
            if (!portManager.isPortAvailable) {
                setShowStillTaken(true);
                setTimeout(() => setShowStillTaken(false), 3000);
            }
        }
        catch (error) {
            console.error('Error checking port status:', error);
        }
    };
    const messageCharacters = (0, react_1.useMemo)(() => {
        const message = getMessage();
        return message.split('').map((label, index) => ({
            label,
            id: `port-message-${message.length}-${index}-${label}`,
        }));
    }, [getMessage, showStillTaken]);
    return (<dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
                <dialog_1.DialogContent>
                    <dialog_1.DialogHeader>
                        <dialog_1.DialogTitle className="text-title3">Port Conflict Detected</dialog_1.DialogTitle>
                    </dialog_1.DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="col-span-3 space-y-3">
                            <div className={(0, utils_1.cn)('flex items-center justify-between gap-2 p-1 px-3 rounded-md border-[0.5px] transition-all duration-200', showStillTaken
            ? 'bg-amber-500/20 border-amber-400'
            : 'bg-amber-500/10 border-amber-500')}>
                                <div className="flex items-center gap-2 justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <index_1.Icons.ExclamationTriangle className="w-4 h-4 text-amber-500"/>
                                        <span className="text-xs relative overflow-hidden">
                                            <framer_motion_1.AnimatePresence mode="popLayout">
                                                {messageCharacters.map((character) => (<framer_motion_1.motion.span key={character.id} layoutId={character.id} layout="position" className={(0, utils_1.cn)('inline-block', character.label === ' ' && 'w-[0.4em]', showStillTaken
                ? 'text-amber-200'
                : 'text-amber-400')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{
                type: 'spring',
                bounce: 0.1,
                duration: 0.4,
            }}>
                                                        {character.label === ' '
                ? '\u00A0'
                : character.label}
                                                    </framer_motion_1.motion.span>))}
                                            </framer_motion_1.AnimatePresence>
                                        </span>
                                    </div>
                                    <button_1.Button variant="ghost" className="gap-x-1.5 p-1 text-xs text-amber-500 hover:text-amber-300 bg-transparent hover:bg-transparent" onClick={handleRefresh}>
                                        <index_1.Icons.Reload className="h-4 w-4"/>
                                        Refresh
                                    </button_1.Button>
                                </div>
                            </div>
                            <p className="text-regular text-foreground/80">
                                Another process is running on{' '}
                                <strong>localhost:{portManager.currentPort}</strong>. You may need
                                to stop that process or run your application on a different port.
                            </p>
                        </div>
                    </div>
                    <dialog_1.DialogFooter>
                        <button_1.Button variant="ghost" className="mr-auto hidden" onClick={handleChangePort}>
                            Update port
                        </button_1.Button>
                        <button_1.Button variant="outline" onClick={() => onOpenChange(false)}>
                            I understand
                        </button_1.Button>
                    </dialog_1.DialogFooter>
                </dialog_1.DialogContent>
            </dialog_1.Dialog>);
});
exports.default = PortWarningModal;
//# sourceMappingURL=PortWarningModal.js.map