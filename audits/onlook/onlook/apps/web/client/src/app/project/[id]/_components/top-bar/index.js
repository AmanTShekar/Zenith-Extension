"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopBar = void 0;
const hotkey_1 = require("@/components/hotkey");
const editor_1 = require("@/components/store/editor");
const state_1 = require("@/components/store/state");
const avatar_dropdown_1 = require("@/components/ui/avatar-dropdown");
const helpers_1 = require("@/components/ui/settings-modal/helpers");
const keys_1 = require("@/i18n/keys");
const button_1 = require("@onlook/ui/button");
const hotkey_label_1 = require("@onlook/ui/hotkey-label");
const icons_1 = require("@onlook/ui/icons");
const tooltip_1 = require("@onlook/ui/tooltip");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const next_intl_1 = require("next-intl");
const react_2 = require("react");
const members_1 = require("../members");
const branch_1 = require("./branch");
const mode_toggle_1 = require("./mode-toggle");
const project_breadcrumb_1 = require("./project-breadcrumb");
const publish_1 = require("./publish");
exports.TopBar = (0, mobx_react_lite_1.observer)(() => {
    const stateManager = (0, state_1.useStateManager)();
    const [isMembersPopoverOpen, setIsMembersPopoverOpen] = (0, react_2.useState)(false);
    const editorEngine = (0, editor_1.useEditorEngine)();
    const t = (0, next_intl_1.useTranslations)();
    const UNDO_REDO_BUTTONS = [
        {
            click: () => editorEngine.action.undo(),
            isDisabled: !editorEngine.history.canUndo || editorEngine.chat.isStreaming,
            hotkey: hotkey_1.Hotkey.UNDO,
            icon: <icons_1.Icons.Reset className="h-4 w-4 mr-1"/>,
        },
        {
            click: () => editorEngine.action.redo(),
            isDisabled: !editorEngine.history.canRedo || editorEngine.chat.isStreaming,
            hotkey: hotkey_1.Hotkey.REDO,
            icon: <icons_1.Icons.Reset className="h-4 w-4 mr-1 scale-x-[-1]"/>,
        },
    ];
    return (<div className="flex flex-row h-10 p-0 justify-center items-center bg-background-onlook/60 backdrop-blur-xl">
            <div className="flex flex-row flex-grow basis-0 justify-start items-center">
                <project_breadcrumb_1.ProjectBreadcrumb />
                <span className="text-foreground-secondary/50 text-small">/</span>
                <branch_1.BranchDisplay />
            </div>
            <mode_toggle_1.ModeToggle />
            <div className="flex flex-grow basis-0 justify-end items-center gap-1.5 mr-2">
                <div className="flex items-center group">
                    <div className={`transition-all duration-200 ${isMembersPopoverOpen ? 'mr-2' : '-mr-2 group-hover:mr-2'}`}>
                        <members_1.Members onPopoverOpenChange={setIsMembersPopoverOpen}/>
                    </div>
                    <tooltip_1.Tooltip>
                        <tooltip_1.TooltipTrigger asChild>
                            <div className="flex items-center">
                                <avatar_dropdown_1.CurrentUserAvatar className="size-8 cursor-pointer hover:border-foreground-primary"/>
                            </div>
                        </tooltip_1.TooltipTrigger>
                        <tooltip_1.TooltipContent side="bottom" className="mt-1" hideArrow>
                            <p>Profile</p>
                        </tooltip_1.TooltipContent>
                    </tooltip_1.Tooltip>
                </div>
                <react_1.motion.div className="space-x-0 hidden lg:block -mr-1" layout transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            delay: 0,
        }}>
                    {UNDO_REDO_BUTTONS.map(({ click, hotkey, icon, isDisabled }) => (<tooltip_1.Tooltip key={hotkey.description}>
                            <tooltip_1.TooltipTrigger asChild>
                                <span>
                                    <button_1.Button variant="ghost" size="icon" className="h-8" onClick={click} disabled={isDisabled}>
                                        {icon}
                                    </button_1.Button>
                                </span>
                            </tooltip_1.TooltipTrigger>
                            <tooltip_1.TooltipContent side="bottom" hideArrow className="mt-2">
                                <hotkey_label_1.HotkeyLabel hotkey={hotkey}/>
                            </tooltip_1.TooltipContent>
                        </tooltip_1.Tooltip>))}
                </react_1.motion.div>
                <tooltip_1.Tooltip>
                    <tooltip_1.TooltipTrigger asChild>
                        <button_1.Button variant="ghost" size="icon" className="h-8" onClick={() => {
            stateManager.settingsTab = helpers_1.SettingsTabValue.VERSIONS;
            stateManager.isSettingsModalOpen = true;
        }}>
                            <icons_1.Icons.CounterClockwiseClock className="h-4 w-4"/>
                        </button_1.Button>
                    </tooltip_1.TooltipTrigger>
                    <tooltip_1.TooltipContent side="bottom" className="mt-1" hideArrow>
                        {t(keys_1.transKeys.editor.toolbar.versionHistory)}
                    </tooltip_1.TooltipContent>
                </tooltip_1.Tooltip>
                <publish_1.PublishButton />
            </div>
        </div>);
});
//# sourceMappingURL=index.js.map