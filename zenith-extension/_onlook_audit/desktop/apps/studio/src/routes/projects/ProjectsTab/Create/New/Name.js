"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewNameProject = void 0;
const button_1 = require("@onlook/ui/button");
const card_1 = require("@onlook/ui/card");
const input_1 = require("@onlook/ui/input");
const label_1 = require("@onlook/ui/label");
const helpers_1 = require("../../../helpers");
const NewNameProject = ({ props, variant }) => {
    const { projectData, setProjectData, nextStep, prevStep } = props;
    const renderHeader = () => (<>
            <card_1.CardTitle>{"Let's name your project"}</card_1.CardTitle>
            <card_1.CardDescription>
                {'If you want it to be different from the project folder name'}
            </card_1.CardDescription>
        </>);
    const renderContent = () => (<div className="flex flex-col w-full gap-2">
            <label_1.Label htmlFor="text">Project Name</label_1.Label>
            <input_1.Input className="bg-secondary" type="text" placeholder={(0, helpers_1.getRandomPlaceholder)()} value={projectData.name || ''} onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}/>
        </div>);
    const renderFooter = () => (<>
            <button_1.Button type="button" onClick={prevStep} variant="ghost">
                Back
            </button_1.Button>
            <button_1.Button disabled={!projectData.name || projectData.name.length === 0} type="button" onClick={nextStep} variant="outline">
                Next
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
exports.NewNameProject = NewNameProject;
NewNameProject.Header = (props) => <NewNameProject props={props} variant="header"/>;
NewNameProject.Content = (props) => <NewNameProject props={props} variant="content"/>;
NewNameProject.Footer = (props) => <NewNameProject props={props} variant="footer"/>;
NewNameProject.Header.displayName = 'NewNameProject.Header';
NewNameProject.Content.displayName = 'NewNameProject.Content';
NewNameProject.Footer.displayName = 'NewNameProject.Footer';
//# sourceMappingURL=Name.js.map