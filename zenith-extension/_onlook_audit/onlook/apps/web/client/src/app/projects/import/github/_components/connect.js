"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectGithub = void 0;
const button_1 = require("@onlook/ui/button");
const card_1 = require("@onlook/ui/card");
const icons_1 = require("@onlook/ui/icons");
const separator_1 = require("@onlook/ui/separator");
const react_1 = require("motion/react");
const steps_1 = require("../../steps");
const _context_1 = require("../_context");
const ConnectGithub = () => {
    const { prevStep, nextStep, installation, } = (0, _context_1.useImportGithubProject)();
    const itemContent = ({ title, description, icon, }) => {
        return (<div className="flex">
                <div className="p-3">{icon}</div>
                <div className="flex flex-col w-full">
                    <p className="font-medium">{title}</p>
                    <p className="text-gray-200">{description}</p>
                </div>
            </div>);
    };
    return (<>
            <steps_1.StepHeader>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gray-700 rounded-lg">
                        <icons_1.Icons.OnlookLogo className="w-6 h-6"/>
                    </div>
                    <icons_1.Icons.DotsHorizontal className="w-6 h-6"/>
                    <div className="p-3 bg-gray-700 rounded-lg">
                        <icons_1.Icons.GitHubLogo className="w-6 h-6"/>
                    </div>
                </div>
                <card_1.CardTitle className="text-xl font-normal">{'Connect to GitHub'}</card_1.CardTitle>
                <card_1.CardDescription className="font-normal">
                    {'Work with real code directly in Onlook'}
                </card_1.CardDescription>
            </steps_1.StepHeader>
            <steps_1.StepContent>
                <react_1.motion.div key="name" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full text-sm">
                    <separator_1.Separator orientation="horizontal" className="shrink-0 bg-border mb-6"/>
                    {itemContent({
            title: installation.hasInstallation
                ? 'GitHub App already connected'
                : 'Install Onlook GitHub App',
            description: installation.hasInstallation
                ? 'You can access your repositories through the GitHub App'
                : 'Get secure repository access with fine-grained permissions',
            icon: installation.hasInstallation
                ? <icons_1.Icons.Check className="w-5 h-5 text-green-500"/>
                : <icons_1.Icons.GitHubLogo className="w-5 h-5"/>,
        })}
                    {installation.error && (<div className="mt-4 p-3 bg-red-900 border border-red-800 rounded-md">
                            <div className="text-red-100 text-sm">{installation.error}</div>
                        </div>)}
                    <separator_1.Separator orientation="horizontal" className="shrink-0 bg-border mt-6"/>
                </react_1.motion.div>
            </steps_1.StepContent>
            <steps_1.StepFooter>
                <button_1.Button onClick={prevStep} variant="outline">
                    Cancel
                </button_1.Button>

                {installation.hasInstallation ? (<div className="flex gap-2">
                        <button_1.Button size="icon" variant="outline" className="py-2" onClick={() => installation.redirectToInstallation()}>
                            <icons_1.Icons.Gear className="w-4 h-4"/>
                        </button_1.Button>
                        <button_1.Button className="px-3 py-2" onClick={nextStep}>
                            <icons_1.Icons.ArrowRight className="w-4 h-4 mr-2"/>
                            <span>Continue</span>
                        </button_1.Button>
                    </div>) : (<button_1.Button className="px-3 py-2" onClick={() => installation.redirectToInstallation()} disabled={installation.isChecking}>
                        <icons_1.Icons.GitHubLogo className="w-4 h-4 mr-2"/>
                        <span>Install GitHub App</span>
                    </button_1.Button>)}
            </steps_1.StepFooter>
        </>);
};
exports.ConnectGithub = ConnectGithub;
//# sourceMappingURL=connect.js.map