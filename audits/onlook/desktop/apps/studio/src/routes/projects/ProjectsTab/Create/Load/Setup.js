"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadSetupProject = void 0;
const utils_1 = require("@/lib/utils");
const helpers_1 = require("@/routes/projects/helpers");
const constants_1 = require("@onlook/models/constants");
const button_1 = require("@onlook/ui/button");
const card_1 = require("@onlook/ui/card");
const icons_1 = require("@onlook/ui/icons");
const progress_1 = require("@onlook/ui/progress");
const react_1 = require("motion/react");
const react_2 = require("react");
var StepState;
(function (StepState) {
    StepState["INSTALLING"] = "installing";
    StepState["INSTALLED"] = "installed";
    StepState["ERROR"] = "error";
})(StepState || (StepState = {}));
const LoadSetupProject = ({ props, variant }) => {
    const { projectData, prevStep, nextStep } = props;
    const [state, setState] = (0, react_2.useState)(StepState.INSTALLING);
    const [progress, setProgress] = (0, react_2.useState)(0);
    const [message, setMessage] = (0, react_2.useState)('Installing project');
    (0, react_2.useEffect)(() => {
        window.api.on(constants_1.MainChannels.SETUP_PROJECT_CALLBACK, ({ stage, message }) => {
            setMessage(message);
            if (stage === 'installing') {
                setProgress(50);
                setState(StepState.INSTALLING);
            }
            else if (stage === 'configuring') {
                setProgress(75);
                setState(StepState.INSTALLING);
            }
            else if (stage === 'complete') {
                setProgress(100);
                setState(StepState.INSTALLED);
            }
            else if (stage === 'error') {
                setState(StepState.ERROR);
                (0, utils_1.sendAnalytics)('create project error', { message, method: helpers_1.CreateMethod.NEW });
            }
        });
        return () => {
            window.api.removeAllListeners(constants_1.MainChannels.SETUP_PROJECT_CALLBACK);
        };
    }, []);
    function handleClickPath() {
        (0, utils_1.invokeMainChannel)(constants_1.MainChannels.OPEN_IN_EXPLORER, projectData.folderPath);
    }
    const renderHeader = () => (<>
            <card_1.CardTitle>{renderTitle()}</card_1.CardTitle>
            <card_1.CardDescription>{renderDescription()}</card_1.CardDescription>
        </>);
    const renderContent = () => (<react_1.MotionConfig transition={{ duration: 0.5, type: 'spring', bounce: 0 }}>
            <react_1.AnimatePresence mode="popLayout">
                {state === StepState.INSTALLED && (<react_1.motion.div key="installed" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full flex flex-row items-center border-[0.5px] p-4 rounded gap-2 text-green-950 bg-green-100/40 border-green-400 dark:border-green-500 dark:text-green-300 dark:bg-green-950">
                        <div className={'flex flex-col text-sm gap-1 break-all'}>
                            <p className="text-regularPlus">{projectData.name}</p>
                            <button className="hover:underline text-mini text-start" onClick={handleClickPath}>
                                {projectData.folderPath}
                            </button>
                        </div>
                        <icons_1.Icons.CheckCircled className="ml-auto"/>
                    </react_1.motion.div>)}
                {state === StepState.ERROR && (<react_1.motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-sm w-full flex flex-row items-center border-[0.5px] p-4 rounded gap-2 border-red-500 text-red-900 bg-red-100/40 dark:border-red-600 dark:text-red-200 dark:bg-red-900">
                        <p className="overflow-auto max-h-96">{message}</p>
                        <icons_1.Icons.CrossCircled className="ml-auto w-12"/>
                    </react_1.motion.div>)}
                {state === StepState.INSTALLING && (<react_1.motion.div key="installing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col w-full gap-2 text-sm">
                        <progress_1.Progress value={progress} className="w-full"/>
                        <p>{message}</p>
                    </react_1.motion.div>)}
            </react_1.AnimatePresence>
        </react_1.MotionConfig>);
    const renderFooter = () => (<>
            <button_1.Button type="button" onClick={prevStep} variant="ghost">
                {state === StepState.INSTALLING ? 'Cancel' : 'Back'}
            </button_1.Button>
            <button_1.Button disabled={state === StepState.INSTALLING} variant={'outline'} onClick={nextStep}>
                {state === StepState.ERROR ? 'Continue anyway' : 'Complete setup'}
            </button_1.Button>
        </>);
    function renderTitle() {
        if (state === StepState.INSTALLED) {
            return 'Your project is ready';
        }
        if (state === StepState.ERROR) {
            return 'Error creating project';
        }
        return 'Setting up project...';
    }
    function renderDescription() {
        if (state === StepState.INSTALLED) {
            return 'Open this project in Onlook any time to start designing';
        }
        if (state === StepState.ERROR) {
            return (<p>
                    {`Please try again or `}
                    <a href="mailto:support@onlook.com" className="underline">
                        {'contact support'}
                    </a>
                    {` for help.`}
                </p>);
        }
        return 'Installing the right files and folders for you.';
    }
    switch (variant) {
        case 'header':
            return renderHeader();
        case 'content':
            return renderContent();
        case 'footer':
            return renderFooter();
    }
};
exports.LoadSetupProject = LoadSetupProject;
LoadSetupProject.Header = (props) => <LoadSetupProject props={props} variant="header"/>;
LoadSetupProject.Content = (props) => <LoadSetupProject props={props} variant="content"/>;
LoadSetupProject.Footer = (props) => <LoadSetupProject props={props} variant="footer"/>;
LoadSetupProject.Header.displayName = 'LoadSetupProject.Header';
LoadSetupProject.Content.displayName = 'LoadSetupProject.Content';
LoadSetupProject.Footer.displayName = 'LoadSetupProject.Footer';
//# sourceMappingURL=Setup.js.map