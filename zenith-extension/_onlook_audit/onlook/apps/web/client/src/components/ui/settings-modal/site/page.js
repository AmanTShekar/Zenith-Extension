"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageTab = void 0;
const editor_1 = require("@/components/store/editor");
const react_1 = require("@/trpc/react");
const constants_1 = require("@onlook/constants");
const icons_1 = require("@onlook/ui/icons");
const sonner_1 = require("@onlook/ui/sonner");
const utility_1 = require("@onlook/utility");
const react_2 = require("react");
const metadata_form_1 = require("./metadata-form");
const use_metadata_form_1 = require("./use-metadata-form");
const PageTab = ({ metadata, path }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const { data: project } = react_1.api.project.get.useQuery({ projectId: editorEngine.projectId });
    const { data: domains } = react_1.api.domain.getAll.useQuery({ projectId: editorEngine.projectId });
    const baseUrl = domains?.published?.url ?? domains?.preview?.url;
    const { title, titleObject, description, isDirty, uploadedImage, isSimpleTitle, handleTitleChange, handleTitleTemplateChange, handleTitleAbsoluteChange, handleDescriptionChange, handleImageSelect, handleDiscard, setIsDirty, getFinalTitleMetadata, } = (0, use_metadata_form_1.useMetadataForm)({
        initialMetadata: metadata,
    });
    const [isSaving, setIsSaving] = (0, react_2.useState)(false);
    const handleSave = async () => {
        if (!project) {
            return;
        }
        setIsSaving(true);
        try {
            const url = (0, utility_1.createSecureUrl)(baseUrl);
            const finalTitle = getFinalTitleMetadata();
            const siteTitle = typeof finalTitle === 'string' ? finalTitle : finalTitle.absolute ?? finalTitle.default ?? '';
            const updatedMetadata = {
                ...metadata,
                title: finalTitle,
                description,
                openGraph: {
                    ...metadata?.openGraph,
                    title: siteTitle,
                    description: description,
                    url: url,
                    siteName: siteTitle,
                    type: 'website',
                },
            };
            if (!metadata?.metadataBase) {
                if (url) {
                    updatedMetadata.metadataBase = new URL(url);
                }
            }
            if (uploadedImage) {
                let imagePath;
                try {
                    await editorEngine.image.upload(uploadedImage, constants_1.DefaultSettings.IMAGE_FOLDER);
                    imagePath = `/${uploadedImage.name}`;
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
                            alt: siteTitle,
                        },
                    ],
                    type: 'website',
                };
            }
            await editorEngine.pages.updateMetadataPage(path, updatedMetadata);
            setIsDirty(false);
            sonner_1.toast.success('Page metadata has been updated successfully.');
        }
        catch (error) {
            console.error('Failed to update metadata:', error);
            sonner_1.toast.error('Failed to update page metadata. Please try again.');
        }
        finally {
            setIsSaving(false);
        }
    };
    return (<div className="text-sm">
            <div className="flex flex-col gap-2 p-6">
                <h2 className="text-lg">Page Settings</h2>
            </div>
            <div className="relative">
                {editorEngine.pages.isScanning ? (<div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="flex items-center gap-3 text-foreground-secondary">
                            <icons_1.Icons.LoadingSpinner className="h-5 w-5 animate-spin"/>
                            <span className="text-sm">Fetching metadata...</span>
                        </div>
                    </div>) : (<metadata_form_1.MetadataForm title={title} titleObject={titleObject} description={description} isDirty={isDirty} projectUrl={baseUrl} isSimpleTitle={isSimpleTitle} disabled={editorEngine.pages.isScanning} isSaving={isSaving} onTitleChange={handleTitleChange} onTitleTemplateChange={handleTitleTemplateChange} onTitleAbsoluteChange={handleTitleAbsoluteChange} onDescriptionChange={handleDescriptionChange} onImageSelect={handleImageSelect} onDiscard={handleDiscard} onSave={handleSave} currentMetadata={metadata} isRoot={false}/>)}
            </div>
        </div>);
};
exports.PageTab = PageTab;
//# sourceMappingURL=page.js.map