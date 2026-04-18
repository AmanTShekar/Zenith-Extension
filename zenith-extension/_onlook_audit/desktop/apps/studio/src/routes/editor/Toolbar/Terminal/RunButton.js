"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const run_1 = require("@onlook/models/run");
const button_1 = require("@onlook/ui/button");
const index_1 = require("@onlook/ui/icons/index");
const tooltip_1 = require("@onlook/ui/tooltip");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const PortWarningModal_1 = __importDefault(require("./PortWarningModal"));
const RunButton = (0, mobx_react_lite_1.observer)(() => {
    const projectsManager = (0, Context_1.useProjectsManager)();
    const editorEngine = (0, Context_1.useEditorEngine)();
    const runner = projectsManager.runner;
    const isPortAvailable = runner?.port?.isPortAvailable;
    const [isPortModalOpen, setIsPortModalOpen] = (0, react_2.useState)(false);
    const { t } = (0, react_i18next_1.useTranslation)();
    const handleClick = () => {
        if (!isPortAvailable) {
            setIsPortModalOpen(true);
            return;
        }
        if (runner?.state === run_1.RunState.RUNNING || runner?.state === run_1.RunState.SETTING_UP) {
            runner?.stop();
            return;
        }
        if (runner?.state === run_1.RunState.ERROR) {
            runner.restart();
            editorEngine.errors.clear();
            return;
        }
        runner?.start();
    };
    function renderIcon() {
        if (!isPortAvailable) {
            return <index_1.Icons.ExclamationTriangle className="text-amber-100"/>;
        }
        if (runner?.isLoading) {
            return <index_1.Icons.Shadow className="animate-spin"/>;
        }
        switch (runner?.state) {
            case run_1.RunState.SETTING_UP:
            case run_1.RunState.STOPPING:
                return <index_1.Icons.Shadow className="animate-spin"/>;
            case run_1.RunState.ERROR:
                return <index_1.Icons.ExclamationTriangle />;
            case run_1.RunState.RUNNING:
                return <index_1.Icons.Stop />;
            case run_1.RunState.STOPPED:
                return <index_1.Icons.Play />;
            default:
                return <index_1.Icons.Play />;
        }
    }
    function getExtraButtonClasses() {
        if (!isPortAvailable) {
            return 'text-amber-700 dark:text-amber-100 border-amber-500 before:absolute before:inset-0 before:bg-[radial-gradient(169.40%_89.55%_at_94.76%_6.29%,theme(colors.amber.200/80)_0%,theme(colors.amber.300/80)_100%)] dark:before:bg-[radial-gradient(169.40%_89.55%_at_94.76%_6.29%,theme(colors.amber.800/80)_0%,theme(colors.amber.500/80)_100%)] after:absolute after:inset-0 after:bg-[radial-gradient(169.40%_89.55%_at_90%_10%,theme(colors.amber.300/50)_0%,theme(colors.amber.200/50)_100%)] dark:after:bg-[radial-gradient(169.40%_89.55%_at_90%_10%,theme(colors.amber.500/50)_0%,theme(colors.amber.400/50)_100%)] after:opacity-0 hover:after:opacity-100 before:transition-all after:transition-all before:duration-300 after:duration-300 before:z-0 after:z-0';
        }
        if (runner?.isLoading) {
            return 'cursor-wait text-gray-700 dark:text-foreground-secondary before:absolute before:inset-0 before:bg-[radial-gradient(169.40%_89.55%_at_94.76%_6.29%,theme(colors.gray.200/80)_0%,theme(colors.gray.100/20)_100%)] dark:before:bg-[radial-gradient(169.40%_89.55%_at_94.76%_6.29%,theme(colors.background.onlook/80)_0%,theme(colors.background.onlook/20)_100%)] before:transition-opacity before:duration-300 before:z-0';
        }
        switch (runner?.state) {
            case run_1.RunState.STOPPED:
                return 'text-teal-700 dark:text-teal-100 before:absolute before:inset-0 before:bg-[radial-gradient(169.40%_89.55%_at_94.76%_6.29%,theme(colors.teal.200/80)_0%,theme(colors.teal.300/80)_100%)] dark:before:bg-[radial-gradient(169.40%_89.55%_at_94.76%_6.29%,theme(colors.teal.800/80)_0%,theme(colors.teal.500/80)_100%)] after:absolute after:inset-0 after:bg-[radial-gradient(169.40%_89.55%_at_90%_10%,theme(colors.teal.300/50)_0%,theme(colors.teal.200/50)_100%)] dark:after:bg-[radial-gradient(169.40%_89.55%_at_90%_10%,theme(colors.teal.500/50)_0%,theme(colors.teal.400/50)_100%)] after:opacity-0 hover:after:opacity-100 before:transition-all after:transition-all before:duration-300 after:duration-300 before:z-0 after:z-0';
            case run_1.RunState.ERROR:
            case run_1.RunState.RUNNING:
                return 'text-gray-700 hover:text-red-700 dark:text-foreground-secondary dark:hover:text-red-200 before:absolute before:inset-0 before:bg-[radial-gradient(169.40%_89.55%_at_94.76%_6.29%,theme(colors.gray.200/80)_0%,theme(colors.gray.100/20)_100%)] dark:before:bg-[radial-gradient(169.40%_89.55%_at_94.76%_6.29%,theme(colors.background.onlook/80)_0%,theme(colors.background.onlook/20)_100%)] after:absolute after:inset-0 after:bg-[radial-gradient(169.40%_89.55%_at_90%_10%,theme(colors.red.200/50)_0%,theme(colors.red.300/50)_100%)] dark:after:bg-[radial-gradient(169.40%_89.55%_at_90%_10%,theme(colors.red.800/50)_0%,theme(colors.red.600/50)_100%)] after:opacity-0 hover:after:opacity-100 before:transition-opacity after:transition-opacity before:duration-300 after:duration-300 before:z-0 after:z-0';
            default:
                return '';
        }
    }
    function getButtonTitle() {
        // Prioritize port conflict message
        if (!isPortAvailable) {
            return t('editor.runButton.portInUse');
        }
        if (runner?.isLoading) {
            return t('editor.runButton.loading');
        }
        switch (runner?.state) {
            case run_1.RunState.STOPPED:
                return t('editor.runButton.play');
            case run_1.RunState.ERROR:
                return t('editor.runButton.retry');
            case run_1.RunState.RUNNING:
            case run_1.RunState.SETTING_UP:
                return t('editor.runButton.stop');
            default:
                return t('editor.runButton.play');
        }
    }
    const buttonText = getButtonTitle();
    const buttonCharacters = (0, react_2.useMemo)(() => {
        const characters = buttonText.split('').map((ch, index) => ({
            id: `runbutton_${ch === ' ' ? 'space' : ch}${index}`,
            label: index === 0 ? ch.toUpperCase() : ch,
        }));
        return characters;
    }, [buttonText]);
    const buttonWidth = (0, react_2.useMemo)(() => {
        const baseWidth = 50;
        // Different languages may have different character widths
        // For languages with wider characters like Chinese/Japanese/Korean, use a larger multiplier
        const isWideCharLanguage = /[\u3000-\u9fff\uAC00-\uD7AF]/.test(buttonText);
        const charWidthMultiplier = isWideCharLanguage ? 15 : 8;
        const textWidth = buttonText.length * charWidthMultiplier;
        return Math.min(baseWidth + textWidth, 112);
    }, [buttonText]);
    function getTooltipText() {
        switch (runner?.state) {
            case run_1.RunState.STOPPED:
                return 'Run your App';
            case run_1.RunState.RUNNING:
                return 'Stop Running your App & Clean Code';
            case run_1.RunState.ERROR:
                return 'Restart your App';
            default:
                if (!isPortAvailable) {
                    return 'Click to resolve port conflict';
                }
                return 'Unknown app state';
        }
    }
    return (<>
            <react_1.motion.div layout="preserve-aspect" animate={{ width: buttonWidth }} className={(0, utils_1.cn)('overflow-hidden', runner?.isLoading ? 'max-w-[100px] cursor-wait' : '')} transition={{
            type: 'spring',
            bounce: 0.2,
            duration: 0.6,
            stiffness: 150,
            damping: 20,
        }}>
                <tooltip_1.Tooltip>
                    <tooltip_1.TooltipTrigger asChild>
                        <button_1.Button variant="ghost" className={(0, utils_1.cn)('border-transparent rounded-none px-3 py-6 gap-x-1.5 top-[0.5px] transition-colors duration-300 z-8 relative', getExtraButtonClasses(), runner?.isLoading ? 'cursor-wait' : '')} disabled={runner?.isLoading ||
            runner?.state === run_1.RunState.SETTING_UP ||
            runner?.state === run_1.RunState.STOPPING} onClick={handleClick}>
                            <div className="z-10">{renderIcon()}</div>
                            <span className="text-mini z-10 relative overflow-hidden">
                                <react_1.AnimatePresence mode="popLayout">
                                    {buttonCharacters.map((character) => (<react_1.motion.span key={character.id} layoutId={character.id} layout="position" className={(0, utils_1.cn)('inline-block', character.label === ' ' && 'w-[0.4em]')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{
                type: 'spring',
                bounce: 0.1,
                duration: 0.4,
            }}>
                                            {character.label === ' ' ? '\u00A0' : character.label}
                                        </react_1.motion.span>))}
                                </react_1.AnimatePresence>
                            </span>
                        </button_1.Button>
                    </tooltip_1.TooltipTrigger>
                    <tooltip_1.TooltipContent>
                        <p>{getTooltipText()}</p>
                    </tooltip_1.TooltipContent>
                </tooltip_1.Tooltip>
            </react_1.motion.div>

            <PortWarningModal_1.default open={isPortModalOpen} onOpenChange={setIsPortModalOpen}/>
        </>);
});
exports.default = RunButton;
//# sourceMappingURL=RunButton.js.map