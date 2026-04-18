"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowsControls = void 0;
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const projects_1 = require("@onlook/models/projects");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const react_1 = require("react");
const WindowsControls = () => {
    const [isMaximized, setIsMaximized] = (0, react_1.useState)(true);
    if (process.platform !== 'win32' && process.platform !== 'linux') {
        return null;
    }
    function sendCommand(command) {
        (0, utils_1.invokeMainChannel)(constants_1.MainChannels.SEND_WINDOW_COMMAND, command);
        if (command === projects_1.WindowCommand.MAXIMIZE || command === projects_1.WindowCommand.UNMAXIMIZE) {
            setIsMaximized(!isMaximized);
        }
    }
    return (<div className="flex text-foreground-active h-full">
            <button_1.Button onClick={() => sendCommand(projects_1.WindowCommand.MINIMIZE)} variant={'ghost'} className="hover:bg-background-onlook/30  hover:text-foreground outline-border w-full h-full rounded-none" aria-label="Minimize">
                <icons_1.Icons.Minus className="h-3 w-3"/>
            </button_1.Button>
            <button_1.Button onClick={() => sendCommand(isMaximized ? projects_1.WindowCommand.UNMAXIMIZE : projects_1.WindowCommand.MAXIMIZE)} variant={'ghost'} className="hover:bg-background-onlook/30 hover:text-foreground outline-border w-full h-full rounded-none" aria-label="Maximize">
                <icons_1.Icons.Copy className="h-3 w-3 scale-x-[-1]"/>
            </button_1.Button>
            <button_1.Button onClick={() => sendCommand(projects_1.WindowCommand.CLOSE)} variant={'ghost'} className="hover:bg-[#e81123] active:bg-[#e81123]/50 hover:text-foreground outline-border w-full h-full rounded-none" aria-label="Close">
                <icons_1.Icons.CrossL className="h-3 w-3"/>
            </button_1.Button>
        </div>);
};
exports.WindowsControls = WindowsControls;
//# sourceMappingURL=WindowsControls.js.map