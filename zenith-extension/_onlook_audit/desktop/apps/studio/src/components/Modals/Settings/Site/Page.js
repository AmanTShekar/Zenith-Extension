"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageTab = void 0;
const Context_1 = require("@/components/Context");
const useMetadataForm_1 = require("@/hooks/useMetadataForm");
const models_1 = require("@onlook/models");
const use_toast_1 = require("@onlook/ui/use-toast");
const react_1 = require("react");
const MetadataForm_1 = require("./MetadataForm");
exports.PageTab = (0, react_1.memo)(({ metadata, path }) => {
    const projectsManager = (0, Context_1.useProjectsManager)();
    const editorEngine = (0, Context_1.useEditorEngine)();
    const project = projectsManager.project;
    const baseUrl = project?.domains?.custom?.url ?? project?.domains?.base?.url ?? project?.url;
    const { title, description, isDirty, uploadedImage, handleTitleChange, handleDescriptionChange, handleImageSelect, handleDiscard, setIsDirty, } = (0, useMetadataForm_1.useMetadataForm)({
        initialMetadata: metadata,
    });
    const handleSave = async () => {
        if (!project) {
            return;
        }
        try {
            const updatedMetadata = {
                ...metadata,
                title,
                description,
                openGraph: {
                    ...metadata?.openGraph,
                    title: title,
                    description: description,
                    url: baseUrl || '',
                    siteName: title,
                    type: 'website',
                },
            };
            if (!metadata?.metadataBase) {
                const url = baseUrl?.startsWith('http') ? baseUrl : `https://${baseUrl}`;
                if (url) {
                    updatedMetadata.metadataBase = new URL(url);
                }
            }
            if (uploadedImage) {
                let imagePath;
                try {
                    await editorEngine.image.upload(uploadedImage);
                    imagePath = `/${models_1.DefaultSettings.IMAGE_FOLDER.replace(/^public\//, '')}/${uploadedImage.name}`;
                }
                catch (error) {
                    console.log(error);
                    return;
                }
                updatedMetadata.openGraph = {
                    ...updatedMetadata.openGraph,
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
            await editorEngine.pages.updateMetadataPage(path, updatedMetadata);
            setIsDirty(false);
            (0, use_toast_1.toast)({
                title: 'Success',
                description: 'Page metadata has been updated successfully.',
            });
        }
        catch (error) {
            console.error('Failed to update metadata:', error);
            (0, use_toast_1.toast)({
                title: 'Error',
                description: 'Failed to update page metadata. Please try again.',
                variant: 'destructive',
            });
        }
    };
    return (<div className="text-sm">
            <div className="flex flex-col gap-2 p-6">
                <h2 className="text-lg">Page Settings</h2>
            </div>
            <MetadataForm_1.MetadataForm title={title} description={description} isDirty={isDirty} projectUrl={baseUrl} onTitleChange={handleTitleChange} onDescriptionChange={handleDescriptionChange} onImageSelect={handleImageSelect} onDiscard={handleDiscard} onSave={handleSave} currentMetadata={metadata}/>
        </div>);
});
exports.PageTab.displayName = 'PageTab';
//# sourceMappingURL=Page.js.map