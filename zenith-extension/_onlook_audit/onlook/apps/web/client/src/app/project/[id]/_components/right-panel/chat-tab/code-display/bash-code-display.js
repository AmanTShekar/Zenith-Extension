"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BashCodeDisplay = void 0;
const editor_1 = require("@/components/store/editor");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const strip_ansi_1 = __importDefault(require("strip-ansi"));
const formatCommandOutput = (output) => {
    if (output === null) {
        return null;
    }
    const lines = output.split('\n');
    return lines.map((line, index) => {
        // Handle ANSI color codes and special characters
        const cleanLine = (0, strip_ansi_1.default)(line);
        // Add appropriate styling based on line content
        if (cleanLine.includes('installed')) {
            return (<div key={index} className="text-green-400 flex items-center gap-2">
                    <icons_1.Icons.Check className="h-4 w-4"/>
                    <span>{cleanLine}</span>
                </div>);
        }
        if (cleanLine.includes('error') || cleanLine.includes('Error')) {
            return (<div key={index} className="text-red-400 flex items-center gap-2">
                    <icons_1.Icons.CrossCircled className="h-4 w-4"/>
                    <span>{cleanLine}</span>
                </div>);
        }
        if (cleanLine.includes('warning') || cleanLine.includes('Warning')) {
            return (<div key={index} className="text-yellow-400 flex items-center gap-2">
                    <icons_1.Icons.ExclamationTriangle className="h-4 w-4"/>
                    <span>{cleanLine}</span>
                </div>);
        }
        if (cleanLine.includes('$')) {
            return (<div key={index} className="text-blue-400 flex items-center gap-2">
                    <icons_1.Icons.Terminal className="h-4 w-4"/>
                    <span>{cleanLine}</span>
                </div>);
        }
        // Default styling for other lines
        return <div key={index} className="text-foreground-secondary">{cleanLine}</div>;
    });
};
exports.BashCodeDisplay = (0, mobx_react_lite_1.observer)(({ content, defaultStdOut, defaultStdErr, isStream }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const [running, setRunning] = (0, react_1.useState)(false);
    const [stdOut, setStdOut] = (0, react_1.useState)(defaultStdOut);
    const [stdErr, setStdErr] = (0, react_1.useState)(defaultStdErr);
    const runCommand = async () => {
        setRunning(true);
        setStdOut(null);
        setStdErr(null);
        try {
            const result = await editorEngine.activeSandbox.session.runCommand(content, setStdOut);
            if (!result) {
                setStdErr('Failed to execute command: No session available');
                return;
            }
            if (!result.success) {
                setStdErr(result.error || 'Failed to execute command');
            }
            else {
                setStdOut(result.output || '');
            }
        }
        catch (error) {
            setStdErr(error instanceof Error ? error.message : 'An unexpected error occurred');
        }
        finally {
            setRunning(false);
        }
    };
    return (<div className="flex flex-col border rounded-lg bg-background w-full text-foreground">
                <div className="flex flex-col w-full h-full">
                    <div className="relative flex p-4 text-xs w-full overflow-auto bg-background-secondary">
                        <code className="whitespace-pre">
                            <span className="text-foreground-secondary select-none mr-2">$</span>
                            {content}</code>
                    </div>
                    {(stdOut !== null || stdErr !== null) && (<div className="w-full h-[1px] bg-foreground-secondary/30"></div>)}
                    {stdOut !== null && (<code className="px-4 py-2 text-xs w-full max-h-48 overflow-auto bg-background-secondary whitespace-pre font-mono space-y-1">
                            {formatCommandOutput(stdOut)}
                        </code>)}
                    {stdErr !== null && (<code className="px-4 py-2 text-xs w-full max-h-48 overflow-auto bg-background-secondary text-red-500 whitespace-pre font-mono">
                            {formatCommandOutput(stdErr)}
                        </code>)}
                </div>

                <div className="flex h-8 items-center">
                    {stdOut !== null ? (<button_1.Button size={'sm'} className="flex flex-grow rounded-none gap-2 px-1 bg-foreground/10 text-foreground group-hover:bg-foreground/20 group-hover:text-foreground-secondary transition-none" variant={'ghost'} onClick={runCommand} disabled={running || isStream}>
                            {running ? (<icons_1.Icons.LoadingSpinner className="animate-spin"/>) : (<icons_1.Icons.Reload className="text-foreground group-hover:text-foreground-secondary transition-none"/>)}
                            Run again
                        </button_1.Button>) : (<button_1.Button size={'sm'} className="group flex flex-grow rounded-none gap-2 px-1 bg-teal-400/20 text-teal-200 hover:bg-teal-400/40 hover:text-teal-100" variant={'ghost'} onClick={runCommand} disabled={running || isStream}>
                            {running ? (<icons_1.Icons.LoadingSpinner className="animate-spin"/>) : (<icons_1.Icons.Play className="text-teal-300 group-hover:text-teal-100 transition-none"/>)}
                            Run command
                        </button_1.Button>)}
                </div>
            </div>);
});
//# sourceMappingURL=bash-code-display.js.map