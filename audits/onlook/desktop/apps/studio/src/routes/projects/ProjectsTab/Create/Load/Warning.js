"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadWarning = void 0;
const button_1 = require("@onlook/ui/button");
const card_1 = require("@onlook/ui/card");
const icons_1 = require("@onlook/ui/icons");
const LoadWarning = ({ props, variant }) => {
    const { prevStep, nextStep } = props;
    const renderHeader = () => (<div className="flex flex-row items-center gap-2">
            <icons_1.Icons.ExclamationTriangle className="w-5 h-5"/>
            <card_1.CardTitle>{'Warning: Save your progress'}</card_1.CardTitle>
        </div>);
    const renderContent = () => (<p>
            Onlook will make code changes to your project.
            <br />
            Please save your progress before importing.
        </p>);
    const renderFooter = () => (<>
            <button_1.Button type="button" onClick={prevStep} variant="ghost">
                Back
            </button_1.Button>
            <button_1.Button type="button" onClick={nextStep} variant="outline">
                I understand
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
exports.LoadWarning = LoadWarning;
LoadWarning.Header = (props) => <LoadWarning props={props} variant="header"/>;
LoadWarning.Content = (props) => <LoadWarning props={props} variant="content"/>;
LoadWarning.Footer = (props) => <LoadWarning props={props} variant="footer"/>;
LoadWarning.Header.displayName = 'LoadWarning.Header';
LoadWarning.Content.displayName = 'LoadWarning.Content';
LoadWarning.Footer.displayName = 'LoadWarning.Footer';
//# sourceMappingURL=Warning.js.map