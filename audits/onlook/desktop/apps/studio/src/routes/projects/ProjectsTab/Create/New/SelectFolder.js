"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewSelectFolder = void 0;
const utils_1 = require("@/lib/utils");
const helpers_1 = require("@/routes/projects/helpers");
const constants_1 = require("@onlook/models/constants");
const button_1 = require("@onlook/ui/button");
const card_1 = require("@onlook/ui/card");
const icons_1 = require("@onlook/ui/icons");
const react_1 = require("motion/react");
const NewSelectFolder = ({ props, variant }) => {
    const { projectData, setProjectData, prevStep, nextStep } = props;
    async function pickProjectFolder() {
        const path = (await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.PICK_COMPONENTS_DIRECTORY));
        if (path == null) {
            return;
        }
        const pathWithProject = `${path}${utils_1.platformSlash}${nameToFolderName(projectData.name || 'new-project')}`;
        setProjectData({ ...projectData, folderPath: pathWithProject });
    }
    function nameToFolderName(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/^(\d)/, '_$1');
    }
    function handleSetupProject() {
        if (!projectData.folderPath) {
            console.error('Folder path is missing');
            return;
        }
        const { name, path } = (0, helpers_1.getFolderNameAndTargetPath)(projectData.folderPath);
        (0, utils_1.invokeMainChannel)(constants_1.MainChannels.CREATE_NEW_PROJECT, { name, path });
        nextStep();
    }
    const renderHeader = () => (<>
            <card_1.CardTitle>{'Select your project folder'}</card_1.CardTitle>
            <card_1.CardDescription>{"We'll create a folder for your new app here"}</card_1.CardDescription>
        </>);
    const renderContent = () => (<react_1.MotionConfig transition={{ duration: 0.5, type: 'spring', bounce: 0 }}>
            <react_1.AnimatePresence mode="popLayout">
                {projectData.folderPath ? (<react_1.motion.div key="folderPath" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full flex flex-row items-center border px-4 py-5 rounded bg-background-onlook gap-2">
                        <div className="flex flex-col gap-1 break-all">
                            <p className="text-regular">{projectData.name}</p>
                            <p className="text-mini text-foreground-onlook">
                                {projectData.folderPath}
                            </p>
                        </div>
                        <button_1.Button className="ml-auto w-10 h-10" variant={'ghost'} size={'icon'} onClick={() => setProjectData({ ...projectData, folderPath: undefined })}>
                            <icons_1.Icons.MinusCircled />
                        </button_1.Button>
                    </react_1.motion.div>) : (<react_1.motion.div key="selectFolder" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full">
                        <button_1.Button className="w-full h-32 text-regularPlus text-foreground-onlook border-[0.5px] bg-background-onlook/50 hover:bg-background-onlook/60" variant={'outline'} onClick={pickProjectFolder}>
                            {'Click to select a folder'}
                        </button_1.Button>
                    </react_1.motion.div>)}
            </react_1.AnimatePresence>
        </react_1.MotionConfig>);
    const renderFooter = () => (<>
            <button_1.Button type="button" onClick={prevStep} variant="ghost">
                Back
            </button_1.Button>
            <button_1.Button disabled={!projectData.folderPath} type="button" onClick={handleSetupProject} variant="outline">
                {projectData.folderPath ? 'Set up project' : 'Next'}
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
exports.NewSelectFolder = NewSelectFolder;
NewSelectFolder.Header = (props) => <NewSelectFolder props={props} variant="header"/>;
NewSelectFolder.Content = (props) => <NewSelectFolder props={props} variant="content"/>;
NewSelectFolder.Footer = (props) => <NewSelectFolder props={props} variant="footer"/>;
NewSelectFolder.Header.displayName = 'NewSelectFolder.Header';
NewSelectFolder.Content.displayName = 'NewSelectFolder.Content';
NewSelectFolder.Footer.displayName = 'NewSelectFolder.Footer';
//# sourceMappingURL=SelectFolder.js.map