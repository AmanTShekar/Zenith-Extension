"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadNameProject = void 0;
const button_1 = require("@onlook/ui/button");
const card_1 = require("@onlook/ui/card");
const input_1 = require("@onlook/ui/input");
const label_1 = require("@onlook/ui/label");
const helpers_1 = require("../../../helpers");
const LoadNameProject = ({ props: { projectData, currentStep, setProjectData, totalSteps, prevStep, nextStep }, }) => {
    function setProjectName(name) {
        setProjectData({
            ...projectData,
            name,
        });
    }
    function goBack() {
        prevStep();
    }
    return (<card_1.Card className="w-[30rem]">
            <card_1.CardHeader>
                <card_1.CardTitle>{'Let’s name your project'}</card_1.CardTitle>
                <card_1.CardDescription>
                    {"This is your Onlook project name. Don't worry, This will not rename your actual folder."}
                </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="h-24 flex items-center w-full">
                <div className="flex flex-col w-full gap-2">
                    <label_1.Label htmlFor="text">Project Name</label_1.Label>
                    <input_1.Input type="text" placeholder={(0, helpers_1.getRandomPlaceholder)()} value={projectData.name || ''} onInput={(e) => setProjectName(e.currentTarget.value)}/>
                </div>
            </card_1.CardContent>
            <card_1.CardFooter className="text-sm">
                <p className="text-foreground-onlook">{`${currentStep + 1} of ${totalSteps}`}</p>
                <div className="flex ml-auto gap-2">
                    <button_1.Button type="button" onClick={goBack} variant="ghost">
                        Back
                    </button_1.Button>
                    <button_1.Button disabled={!projectData.name || projectData.name.length === 0} type="button" onClick={nextStep} variant="outline">
                        Next
                    </button_1.Button>
                </div>
            </card_1.CardFooter>
        </card_1.Card>);
};
exports.LoadNameProject = LoadNameProject;
//# sourceMappingURL=Name.js.map