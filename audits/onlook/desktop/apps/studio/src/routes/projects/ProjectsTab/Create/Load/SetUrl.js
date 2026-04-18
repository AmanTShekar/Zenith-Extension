"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadSetUrl = void 0;
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const button_1 = require("@onlook/ui/button");
const card_1 = require("@onlook/ui/card");
const collapsible_1 = require("@onlook/ui/collapsible");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const label_1 = require("@onlook/ui/label");
const utils_2 = require("@onlook/ui/utils");
const react_1 = require("react");
const LoadSetUrl = ({ props, variant }) => {
    const { projectData, setProjectData, prevStep, nextStep } = props;
    const [projectUrl, setProjectUrl] = (0, react_1.useState)(projectData.url || '');
    const [runCommand, setRunCommand] = (0, react_1.useState)(projectData.commands?.run || '');
    const [buildCommand, setBuildCommand] = (0, react_1.useState)(projectData.commands?.build || '');
    const [installCommand, setInstallCommand] = (0, react_1.useState)(projectData.commands?.install || '');
    const [error, setError] = (0, react_1.useState)(null);
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    function handleUrlInput(e) {
        setProjectUrl(e.currentTarget.value);
        if (!validateUrl(e.currentTarget.value)) {
            setError('Please use a valid URL');
            return;
        }
        else {
            setError(null);
        }
        setProjectData({
            ...projectData,
            url: e.currentTarget.value,
        });
    }
    function handleInstallCommandInput(e) {
        setInstallCommand(e.currentTarget.value);
        setProjectData({
            ...projectData,
            commands: {
                ...projectData.commands,
                install: e.currentTarget.value,
            },
        });
    }
    function handleRunCommandInput(e) {
        setRunCommand(e.currentTarget.value);
        setProjectData({
            ...projectData,
            commands: {
                ...projectData.commands,
                run: e.currentTarget.value,
            },
        });
    }
    function handleBuildCommandInput(e) {
        setBuildCommand(e.currentTarget.value);
        setProjectData({
            ...projectData,
            commands: {
                ...projectData.commands,
                build: e.currentTarget.value,
            },
        });
    }
    function validateUrl(url) {
        try {
            const parsedUrl = new URL(url);
            return ['http:', 'https:'].includes(parsedUrl.protocol);
        }
        catch (e) {
            return false;
        }
    }
    function goBack() {
        prevStep();
    }
    function handleNext() {
        if (!projectData.folderPath) {
            setError('No project folder path found');
            return;
        }
        const updatedInstallCommand = projectData.commands?.install || installCommand;
        if (!updatedInstallCommand) {
            setError('Please enter a valid install command');
            return;
        }
        (0, utils_1.invokeMainChannel)(constants_1.MainChannels.INSTALL_PROJECT_DEPENDENCIES, {
            folderPath: projectData.folderPath,
            installCommand: updatedInstallCommand,
        });
        nextStep();
    }
    const renderHeader = () => (<>
            <card_1.CardTitle>{'Configure your project (optional)'}</card_1.CardTitle>
            <card_1.CardDescription>
                {'Update your project URL and commands or keep the defaults.'}
            </card_1.CardDescription>
        </>);
    const renderContent = () => (<div className="flex flex-col w-full gap-6">
            <div className="space-y-2">
                <label_1.Label htmlFor="projectUrl">Local URL</label_1.Label>
                <input_1.Input id="projectUrl" className="bg-secondary" value={projectUrl} type="text" placeholder="http://localhost:3000" onInput={handleUrlInput}/>
            </div>

            <collapsible_1.Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <collapsible_1.CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium">
                    <icons_1.Icons.ChevronDown className={(0, utils_2.cn)('h-4 w-4 transition-transform duration-200', isOpen ? '' : '-rotate-90')}/>
                    Project Commands
                </collapsible_1.CollapsibleTrigger>
                <collapsible_1.CollapsibleContent className="pt-4">
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <label_1.Label htmlFor="installCommand">Install</label_1.Label>
                            <input_1.Input id="installCommand" className="bg-secondary" value={installCommand} type="text" placeholder={constants_1.DefaultSettings.COMMANDS.install} onInput={handleInstallCommandInput}/>
                        </div>
                        <div className="space-y-2">
                            <label_1.Label htmlFor="runCommand">Run</label_1.Label>
                            <input_1.Input id="runCommand" className="bg-secondary" value={runCommand} type="text" placeholder={constants_1.DefaultSettings.COMMANDS.run} onInput={handleRunCommandInput}/>
                        </div>
                        <div className="space-y-2">
                            <label_1.Label htmlFor="buildCommand">Build</label_1.Label>
                            <input_1.Input id="buildCommand" className="bg-secondary" value={buildCommand} type="text" placeholder={constants_1.DefaultSettings.COMMANDS.build} onInput={handleBuildCommandInput}/>
                        </div>
                    </div>
                </collapsible_1.CollapsibleContent>
            </collapsible_1.Collapsible>

            <p className="text-red-500 text-sm">{error || ''}</p>
        </div>);
    const renderFooter = () => (<>
            <button_1.Button type="button" onClick={goBack} variant="ghost">
                Back
            </button_1.Button>
            <button_1.Button disabled={!projectData.url ||
            projectData.url.length === 0 ||
            !projectData.commands?.run ||
            projectData.commands?.run.length === 0 ||
            !projectData.commands?.build ||
            projectData.commands?.build.length === 0} type="button" onClick={handleNext} variant="outline">
                {'Next'}
            </button_1.Button>
        </>);
    switch (variant) {
        case 'header':
            return renderHeader();
        case 'content':
            return renderContent();
        case 'footer':
            return renderFooter();
    }
};
exports.LoadSetUrl = LoadSetUrl;
LoadSetUrl.Header = (props) => <LoadSetUrl props={props} variant="header"/>;
LoadSetUrl.Content = (props) => <LoadSetUrl props={props} variant="content"/>;
LoadSetUrl.Footer = (props) => <LoadSetUrl props={props} variant="footer"/>;
LoadSetUrl.Header.displayName = 'LoadSetUrl.Header';
LoadSetUrl.Content.displayName = 'LoadSetUrl.Content';
LoadSetUrl.Footer.displayName = 'LoadSetUrl.Footer';
//# sourceMappingURL=SetUrl.js.map