"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteTab = void 0;
const Context_1 = require("@/components/Context");
const useMetadataForm_1 = require("@/hooks/useMetadataForm");
const models_1 = require("@onlook/models");
const constants_1 = require("@onlook/models/constants");
const utils_1 = require("@/lib/utils");
const use_toast_1 = require("@onlook/ui/use-toast");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const MetadataForm_1 = require("./MetadataForm");
exports.SiteTab = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const projectsManager = (0, Context_1.useProjectsManager)();
    const project = projectsManager.project;
    const siteSetting = project?.metadata;
    const baseUrl = project?.domains?.custom?.url ?? project?.domains?.base?.url ?? project?.url;
    const { title, description, isDirty, uploadedImage, handleTitleChange, handleDescriptionChange, handleImageSelect, handleDiscard, setIsDirty, } = (0, useMetadataForm_1.useMetadataForm)({
        initialMetadata: siteSetting ?? undefined,
    });
    const [uploadedFavicon, setUploadedFavicon] = (0, react_1.useState)(null);
    const handleFaviconSelect = (file) => {
        setUploadedFavicon(file);
        setIsDirty(true);
    };
    const handleSave = async () => {
        if (!project) {
            return;
        }
        try {
            const updatedMetadata = {
                ...siteSetting,
                title,
                description,
            };
            if (!siteSetting?.metadataBase) {
                const url = baseUrl?.startsWith('http') ? baseUrl : `https://${baseUrl}`;
                if (url) {
                    updatedMetadata.metadataBase = new URL(url);
                }
            }
            if (uploadedFavicon) {
                // Delete old favicon if it exists
                if (siteSetting?.icons?.icon) {
                    const oldFavicon = editorEngine.image.assets.find((image) => image.fileName === 'favicon.ico');
                    if (oldFavicon) {
                        try {
                            await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.DELETE_IMAGE_FROM_PROJECT, {
                                projectFolder: project.folderPath,
                                image: oldFavicon,
                            });
                        }
                        catch (error) {
                            console.warn('Failed to delete old favicon:', error);
                        }
                    }
                }
                const buffer = await uploadedFavicon.arrayBuffer();
                const base64String = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
                const image = {
                    content: base64String,
                    fileName: 'favicon.ico',
                    mimeType: 'image/x-icon',
                };
                await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.SAVE_IMAGE_TO_PROJECT, {
                    projectFolder: project.folderPath,
                    image,
                });
                updatedMetadata.icons = {
                    icon: '/favicon.ico',
                };
            }
            if (uploadedImage) {
                await editorEngine.image.upload(uploadedImage);
                const imagePath = `/${models_1.DefaultSettings.IMAGE_FOLDER.replace(/^public\//, '')}/${uploadedImage.name}`;
                updatedMetadata.openGraph = {
                    ...updatedMetadata.openGraph,
                    title: title,
                    description: description,
                    url: baseUrl || '',
                    siteName: title,
                    images: [
                        {
                            url: imagePath,
                            width: 1200,
                            height: 630,
                            alt: title,
                        },
                    ],
                    type: 'website',
                };
            }
            projectsManager.updatePartialProject({
                ...project,
                metadata: updatedMetadata,
            });
            await editorEngine.pages.updateMetadataPage('/', updatedMetadata);
            await editorEngine.image.scanImages();
            setUploadedFavicon(null);
            setIsDirty(false);
            (0, use_toast_1.toast)({
                title: 'Success',
                description: 'Site metadata has been updated successfully.',
            });
        }
        catch (error) {
            console.error('Failed to update metadata:', error);
            (0, use_toast_1.toast)({
                title: 'Error',
                description: 'Failed to update site metadata. Please try again.',
                variant: 'destructive',
            });
        }
    };
    return (<div className="text-sm">
            <div className="flex flex-col gap-2 p-6">
                <h2 className="text-lg">Site Settings</h2>
            </div>
            <MetadataForm_1.MetadataForm title={title} description={description} isDirty={isDirty} projectUrl={baseUrl} onTitleChange={handleTitleChange} onDescriptionChange={handleDescriptionChange} onImageSelect={handleImageSelect} onFaviconSelect={handleFaviconSelect} onDiscard={handleDiscard} onSave={handleSave} showFavicon={true} currentMetadata={siteSetting ?? undefined}/>
        </div>);
});
//# sourceMappingURL=index.js.map