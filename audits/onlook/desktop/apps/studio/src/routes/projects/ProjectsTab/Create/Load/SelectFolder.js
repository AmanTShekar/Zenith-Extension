"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadSelectFolder = void 0;
const utils_1 = require("@/lib/utils");
const helpers_1 = require("@/routes/projects/helpers");
const constants_1 = require("@onlook/models/constants");
const button_1 = require("@onlook/ui/button");
const card_1 = require("@onlook/ui/card");
const icons_1 = require("@onlook/ui/icons");
const LoadSelectFolder = ({ props, variant }) => {
    const { projectData, setProjectData, prevStep, nextStep } = props;
    async function pickProjectFolder() {
        const path = (await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.PICK_COMPONENTS_DIRECTORY));
        if (path == null) {
            return;
        }
        setProjectData({
            ...projectData,
            folderPath: path,
            name: (0, helpers_1.getNameFromPath)(path),
        });
    }
    function handleClickPath() {
        (0, utils_1.invokeMainChannel)(constants_1.MainChannels.OPEN_IN_EXPLORER, projectData.folderPath);
    }
    const renderHeader = () => (<>
            <card_1.CardTitle>{'Select your project folder'}</card_1.CardTitle>
            <card_1.CardDescription>{"This is where we'll reference your App"}</card_1.CardDescription>
        </>);
    const renderContent = () => (<>
            {projectData.folderPath ? (<div className="w-full flex flex-row items-center border-[0.5px] bg-background-onlook/60 px-4 py-5 rounded">
                    <div className="flex flex-col text-sm gap-1 break-all">
                        <p className="text-regularPlus">{projectData.name}</p>
                        <button className="hover:underline text-mini text-foreground-onlook text-start" onClick={handleClickPath}>
                            {projectData.folderPath}
                        </button>
                    </div>
                    <button_1.Button className="ml-auto w-10 h-10" variant={'ghost'} size={'icon'} onClick={() => {
                setProjectData({
                    ...projectData,
                    folderPath: undefined,
                });
            }}>
                        <icons_1.Icons.MinusCircled />
                    </button_1.Button>
                </div>) : (<button_1.Button className="w-full h-32 text-regularPlus text-foreground-onlook border-[0.5px] bg-background-onlook/50 hover:bg-background-onlook/60" variant={'outline'} onClick={pickProjectFolder}>
                    {'Click to select your folder'}
                </button_1.Button>)}
        </>);
    const renderFooter = () => (<>
            <button_1.Button type="button" onClick={prevStep} variant="ghost">
                Back
            </button_1.Button>
            <button_1.Button disabled={!projectData.folderPath} type="button" onClick={nextStep} variant="outline">
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
exports.LoadSelectFolder = LoadSelectFolder;
LoadSelectFolder.Header = (props) => <LoadSelectFolder props={props} variant="header"/>;
LoadSelectFolder.Content = (props) => <LoadSelectFolder props={props} variant="content"/>;
LoadSelectFolder.Footer = (props) => <LoadSelectFolder props={props} variant="footer"/>;
LoadSelectFolder.Header.displayName = 'LoadSelectFolder.Header';
LoadSelectFolder.Content.displayName = 'LoadSelectFolder.Content';
LoadSelectFolder.Footer.displayName = 'LoadSelectFolder.Footer';
//# sourceMappingURL=SelectFolder.js.map