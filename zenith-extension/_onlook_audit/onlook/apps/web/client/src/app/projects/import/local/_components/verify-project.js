"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyProject = void 0;
const button_1 = require("@onlook/ui/button");
const card_1 = require("@onlook/ui/card");
const icons_1 = require("@onlook/ui/icons");
const react_1 = require("motion/react");
const react_2 = require("react");
const steps_1 = require("../../steps");
const _context_1 = require("../_context");
const VerifyProject = () => {
    const { projectData, prevStep, nextStep, isFinalizing, validateNextJsProject } = (0, _context_1.useProjectCreation)();
    const [validation, setValidation] = (0, react_2.useState)(null);
    (0, react_2.useEffect)(() => {
        validateProject();
    }, [projectData]);
    const validateProject = async () => {
        if (!projectData.files) {
            return;
        }
        const validation = await validateNextJsProject(projectData.files);
        setValidation(validation);
    };
    const validProject = () => (<react_1.motion.div key="name" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full flex flex-row items-center border p-4 rounded-lg bg-teal-900 border-teal-600 gap-2">
            <div className="flex flex-row items-center justify-between w-full gap-4">
                <div className="p-3 bg-teal-500 rounded-lg">
                    <icons_1.Icons.Directory className="w-5 h-5"/>
                </div>
                <div className="flex flex-col gap-1 break-all w-full">
                    <p className="text-regular text-teal-100">{projectData.name}</p>
                    <p className="text-teal-200 text-mini">{projectData.folderPath}</p>
                </div>
            </div>
            <icons_1.Icons.CheckCircled className="w-5 h-5 text-teal-200"/>
        </react_1.motion.div>);
    const invalidProject = () => (<react_1.motion.div key="name" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full flex flex-row items-center border p-4 rounded-lg bg-amber-900 border-amber-600 gap-2">
            <div className="flex flex-col gap-2 w-full">
                <div className="flex flex-row items-center justify-between w-full gap-3">
                    <div className="p-3 bg-amber-500 rounded-md">
                        <icons_1.Icons.Directory className="w-5 h-5"/>
                    </div>
                    <div className="flex flex-col gap-1 break-all w-full">
                        <p className="text-regular text-amber-100">{projectData.name}</p>
                        <p className="text-amber-200 text-mini">{projectData.folderPath}</p>
                    </div>
                    <icons_1.Icons.ExclamationTriangle className="w-5 h-5 text-amber-200"/>
                </div>
                <p className="text-amber-100 text-sm">This is not a NextJS Project</p>
            </div>
        </react_1.motion.div>);
    const renderHeader = () => {
        if (!validation) {
            return (<>
                    <card_1.CardTitle>{'Verifying compatibility with Onlook'}</card_1.CardTitle>
                    <card_1.CardDescription>
                        {"We're checking to make sure this project can work with Onlook"}
                    </card_1.CardDescription>
                </>);
        }
        if (validation?.isValid) {
            return (<>
                    <card_1.CardTitle>{'Project verified'}</card_1.CardTitle>
                    <card_1.CardDescription>{'Your project is ready to import to Onlook'}</card_1.CardDescription>
                </>);
        }
        else {
            return (<>
                    <card_1.CardTitle>{"This project won't work with Onlook"}</card_1.CardTitle>
                    <card_1.CardDescription>
                        {'Onlook only works with NextJS + React + Tailwind projects'}
                    </card_1.CardDescription>
                </>);
        }
    };
    return (<>
            <steps_1.StepHeader>{renderHeader()}</steps_1.StepHeader>
            <steps_1.StepContent>
                <react_1.motion.div key="name" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full">
                    {validation?.isValid ? validProject() : invalidProject()}
                </react_1.motion.div>
            </steps_1.StepContent>
            <steps_1.StepFooter>
                <button_1.Button onClick={prevStep} disabled={isFinalizing} variant="outline">
                    Cancel
                </button_1.Button>
                <button_1.Button className="px-3 py-2" onClick={validation?.isValid ? nextStep : prevStep} disabled={isFinalizing}>
                    {validation?.isValid ? 'Finish setup' : 'Select a different folder'}
                </button_1.Button>
            </steps_1.StepFooter>
        </>);
};
exports.VerifyProject = VerifyProject;
//# sourceMappingURL=verify-project.js.map