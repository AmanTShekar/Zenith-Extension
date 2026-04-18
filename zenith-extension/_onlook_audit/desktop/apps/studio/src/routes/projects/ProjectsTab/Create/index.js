"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dunes_create_dark_png_1 = __importDefault(require("@/assets/dunes-create-dark.png"));
const dunes_create_light_png_1 = __importDefault(require("@/assets/dunes-create-light.png"));
const Context_1 = require("@/components/Context");
const ThemeProvider_1 = require("@/components/ThemeProvider");
const utils_1 = require("@/lib/utils");
const helpers_1 = require("@/routes/projects/helpers");
const constants_1 = require("@onlook/models/constants");
const motion_card_1 = require("@onlook/ui/motion-card");
const react_1 = require("motion/react");
const react_2 = require("react");
const use_resize_observer_1 = __importDefault(require("use-resize-observer"));
const stepContents_1 = require("./stepContents");
const variants = {
    initial: (direction) => {
        return { x: `${120 * direction}%`, opacity: 0 };
    },
    active: { x: '0%', opacity: 1 },
    exit: (direction) => {
        return { x: `${-120 * direction}%`, opacity: 0 };
    },
};
const DEFAULT_PROJECT_DATA = {
    url: 'http://localhost:3000',
    commands: constants_1.DefaultSettings.COMMANDS,
    hasCopied: false,
};
const CreateProject = ({ createMethod, setCreateMethod, }) => {
    const projectsManager = (0, Context_1.useProjectsManager)();
    const [currentStep, setCurrentStep] = (0, react_2.useState)(0);
    const [steps, setSteps] = (0, react_2.useState)([]);
    const [projectData, setProjectData] = (0, react_2.useState)(DEFAULT_PROJECT_DATA);
    const [direction, setDirection] = (0, react_2.useState)(0);
    const { ref, height } = (0, use_resize_observer_1.default)();
    const { theme } = (0, ThemeProvider_1.useTheme)();
    const [backgroundImage, setBackgroundImage] = (0, react_2.useState)(dunes_create_light_png_1.default);
    (0, react_2.useEffect)(() => {
        const determineBackgroundImage = () => {
            if (theme === constants_1.Theme.Dark) {
                return dunes_create_dark_png_1.default;
            }
            else if (theme === constants_1.Theme.Light) {
                return dunes_create_light_png_1.default;
            }
            else if (theme === constants_1.Theme.System) {
                return window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? dunes_create_dark_png_1.default
                    : dunes_create_light_png_1.default;
            }
            return dunes_create_light_png_1.default;
        };
        setBackgroundImage(determineBackgroundImage());
    }, [theme]);
    (0, react_2.useEffect)(() => {
        setCurrentStep(0);
        setProjectData(DEFAULT_PROJECT_DATA);
        if (createMethod === helpers_1.CreateMethod.NEW) {
            setSteps(stepContents_1.newProjectSteps);
        }
        else if (createMethod === helpers_1.CreateMethod.LOAD) {
            setSteps(stepContents_1.loadProjectSteps);
        }
        (0, utils_1.sendAnalytics)('start create project', { method: createMethod });
    }, [createMethod]);
    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setDirection(1);
            setCurrentStep((prev) => prev + 1);
        }
        else {
            // This is the last step, so we should finalize the project
            finalizeProject();
        }
    };
    const prevStep = () => {
        if (currentStep === 0) {
            setCreateMethod(null);
            return;
        }
        setDirection(-1);
        setCurrentStep((prev) => prev - 1);
    };
    const finalizeProject = () => {
        if (!projectData.name ||
            !projectData.url ||
            !projectData.folderPath ||
            !projectData.commands?.run ||
            !projectData.commands?.build ||
            !projectData.commands?.install) {
            throw new Error('Project data is missing.');
        }
        const newProject = projectsManager.createProject(projectData.name, projectData.url, projectData.folderPath, {
            run: projectData.commands.run,
            build: projectData.commands.build,
            install: projectData.commands.install,
        });
        projectsManager.project = newProject;
        setTimeout(() => {
            projectsManager.runner?.startIfPortAvailable();
        }, 1000);
        (0, utils_1.sendAnalytics)('create project', {
            url: newProject.url,
            method: createMethod,
            id: newProject.id,
        });
        setCreateMethod(null);
    };
    const renderStep = () => {
        const stepContent = steps[currentStep];
        if (!stepContent) {
            return (<react_1.motion.p layout="position" initial={{ opacity: 0, y: 200 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 200 }}>
                    {'Project created successfully.'}
                </react_1.motion.p>);
        }
        const stepProps = {
            projectData,
            setProjectData: (newData) => setProjectData((prevData) => ({ ...prevData, ...newData })),
            currentStep,
            totalSteps: steps.length,
            prevStep,
            nextStep,
        };
        (0, utils_1.sendAnalytics)('creation step', {
            method: createMethod,
            step: currentStep,
            stepName: (0, helpers_1.getStepName)(createMethod, currentStep),
        });
        return (<>
                {stepContent.header(stepProps)}
                {stepContent.content(stepProps)}
            </>);
    };
    return (<div className="fixed inset-0">
            <div className="relative w-full h-full flex items-center justify-center" style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}>
                <div className="absolute inset-0 bg-background/50"/>
                <div className="relative z-10">
                    <react_1.MotionConfig transition={{ duration: 0.5, type: 'spring', bounce: 0 }}>
                        <motion_card_1.MotionCard initial={{ opacity: 0, y: 20 }} animate={{ height, opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="w-[30rem] min-h-[12rem] backdrop-blur-md bg-background/30 overflow-hidden p-0">
                            <react_1.motion.div ref={ref} layout="position" className="flex flex-col">
                                <react_1.AnimatePresence mode="popLayout" initial={false} custom={direction}>
                                    <react_1.motion.div key={currentStep} custom={direction} variants={variants} initial="initial" animate="active" exit="exit">
                                        {renderStep()}
                                    </react_1.motion.div>
                                </react_1.AnimatePresence>
                                <motion_card_1.MotionCardFooter initial={{ opacity: 0, y: 200 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 200 }} layout="position" className="text-sm pb-4">
                                    <p className="text-foreground-onlook">{`${currentStep + 1} of ${steps.length}`}</p>
                                    <div id="footer-buttons" className="flex ml-auto gap-2">
                                        {steps[currentStep]?.footerButtons({
            projectData,
            setProjectData: (newData) => setProjectData((prevData) => ({
                ...prevData,
                ...newData,
            })),
            currentStep,
            totalSteps: steps.length,
            prevStep,
            nextStep,
        })}
                                    </div>
                                </motion_card_1.MotionCardFooter>
                            </react_1.motion.div>
                        </motion_card_1.MotionCard>
                    </react_1.MotionConfig>
                </div>
            </div>
        </div>);
};
exports.default = CreateProject;
//# sourceMappingURL=index.js.map