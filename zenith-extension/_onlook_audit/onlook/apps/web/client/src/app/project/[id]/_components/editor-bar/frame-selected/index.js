"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameSelected = void 0;
const editor_1 = require("@/components/store/editor");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = __importDefault(require("react"));
const use_dropdown_manager_1 = require("../hooks/use-dropdown-manager");
const use_measure_group_1 = require("../hooks/use-measure-group");
const overflow_menu_1 = require("../overflow-menu");
const separator_1 = require("../separator");
const device_selector_1 = require("./device-selector");
const rotate_group_1 = require("./rotate-group");
const theme_group_1 = require("./theme-group");
const window_actions_group_1 = require("./window-actions-group");
exports.FrameSelected = (0, mobx_react_lite_1.observer)(({ availableWidth = 0 }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const frameData = editorEngine.frames.selected[0];
    const { isOpen, onOpenChange } = (0, use_dropdown_manager_1.useDropdownControl)({
        id: 'window-selected-overflow-dropdown',
        isOverflow: true
    });
    if (!frameData)
        return null;
    const WINDOW_GROUPS = [
        {
            key: 'device',
            label: 'Device',
            components: [
                <device_selector_1.DeviceSelector key="device"/>
            ]
        },
        {
            key: 'rotate',
            label: 'Rotate',
            components: [
                <rotate_group_1.RotateGroup key="rotate" frameData={frameData}/>
            ]
        },
        {
            key: 'window-actions',
            label: 'Window Actions',
            components: [
                <window_actions_group_1.WindowActionsGroup key="window-actions" frameData={frameData}/>
            ]
        },
        {
            key: 'theme',
            label: 'Theme',
            components: [
                <theme_group_1.ThemeGroup key="theme" frameData={frameData}/>
            ]
        },
    ];
    const { visibleCount } = (0, use_measure_group_1.useMeasureGroup)({
        availableWidth,
        count: WINDOW_GROUPS.length
    });
    const visibleGroups = WINDOW_GROUPS.slice(0, visibleCount);
    const overflowGroups = WINDOW_GROUPS.slice(visibleCount);
    return (<div className="flex items-center justify-center gap-0.5 w-full overflow-hidden px-0.5">
            {visibleGroups.map((group, groupIdx) => (<react_1.default.Fragment key={group.key}>
                    {groupIdx > 0 && <separator_1.InputSeparator />}
                    <div className="flex items-center gap-0.5">
                        {group.components.map((comp, idx) => (<react_1.default.Fragment key={idx}>{comp}</react_1.default.Fragment>))}
                    </div>
                </react_1.default.Fragment>))}
            <overflow_menu_1.OverflowMenu isOpen={isOpen} onOpenChange={onOpenChange} overflowGroups={overflowGroups} visibleCount={visibleCount}/>
        </div>);
});
//# sourceMappingURL=index.js.map