"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const BashCodeDisplay = (0, mobx_react_lite_1.observer)(({ content, isStream }) => {
    const projectsManager = (0, Context_1.useProjectsManager)();
    const projectPath = projectsManager.project?.folderPath;
    const [running, setRunning] = (0, react_1.useState)(false);
    const [stdOut, setStdOut] = (0, react_1.useState)(null);
    const [stdErr, setStdErr] = (0, react_1.useState)(null);
    const runCommand = async () => {
        if (!projectPath) {
            console.error('No project path found');
            return;
        }
        setRunning(true);
        const res = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.RUN_COMMAND, {
            cwd: projectPath,
            command: content,
        });
        if (!res || !res.success) {
            setStdErr(res?.error || 'Failed to run command');
        }
        else {
            setStdOut(res.output || '');
            setStdErr(null);
        }
        setRunning(false);
    };
    return (<div className="flex flex-col border rounded-lg bg-background w-full text-foreground">
                <div className="flex flex-col w-full h-full">
                    <div className="relative flex items-center p-4 text-xs w-full overflow-x-auto bg-background-secondary">
                        <span className="text-foreground-secondary select-none mr-2">$</span>
                        <code className="w-full">{content}</code>
                    </div>
                    {(stdOut !== null || stdErr !== null) && (<div className="w-full h-[1px] bg-foreground-secondary/30"></div>)}
                    {stdOut !== null && (<code className="px-4 py-2 text-xs w-full overflow-x-auto bg-background-secondary">
                            {stdOut}
                        </code>)}
                    {stdErr !== null && (<code className="px-4 py-2 text-xs w-full overflow-x-auto bg-background-secondary text-red-500">
                            {stdErr}
                        </code>)}
                </div>

                <div className="flex h-8 items-center">
                    {stdOut !== null ? (<button_1.Button size={'sm'} className="flex flex-grow rounded-none gap-2 px-1 bg-foreground/10 text-foreground group-hover:bg-foreground/20 group-hover:text-foreground-secondary transition-none" variant={'ghost'} onClick={runCommand} disabled={running || isStream}>
                            {running ? (<icons_1.Icons.Shadow className="animate-spin"/>) : (<icons_1.Icons.Reload className="text-foreground group-hover:text-foreground-secondary transition-none"/>)}
                            Run again
                        </button_1.Button>) : (<button_1.Button size={'sm'} className="group flex flex-grow rounded-none gap-2 px-1 bg-teal-400/20 text-teal-200 hover:bg-teal-400/40 hover:text-teal-100" variant={'ghost'} onClick={runCommand} disabled={running || isStream}>
                            {running ? (<icons_1.Icons.Shadow className="animate-spin"/>) : (<icons_1.Icons.Play className="text-teal-300 group-hover:text-teal-100 transition-none"/>)}
                            Run command
                        </button_1.Button>)}
                </div>
            </div>);
});
exports.default = BashCodeDisplay;
//# sourceMappingURL=BashCodeDisplay.js.map