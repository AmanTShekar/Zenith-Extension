"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteTab = void 0;
const editor_1 = require("@/components/store/editor");
const react_1 = require("@/trpc/react");
const constants_1 = require("@onlook/constants");
const icons_1 = require("@onlook/ui/icons");
const sonner_1 = require("@onlook/ui/sonner");
const utility_1 = require("@onlook/utility");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_2 = require("react");
const metadata_form_1 = require("./metadata-form");
const use_metadata_form_1 = require("./use-metadata-form");
exports.SiteTab = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const { data: domains } = react_1.api.domain.getAll.useQuery({ projectId: editorEngine.projectId });
    const baseUrl = domains?.published?.url ?? domains?.preview?.url;
    const homePage = (0, react_2.useMemo)(() => {
        return editorEngine.pages.tree.find((page) => page.path === '/');
    }, [editorEngine.pages.tree]);
    const { title, titleObject, description, isDirty, uploadedImage, isSimpleTitle, handleTitleChange, handleTitleTemplateChange, handleTitleAbsoluteChange, handleDescriptionChange, handleImageSelect, handleDiscard, setIsDirty, getFinalTitleMetadata, } = (0, use_metadata_form_1.useMetadataForm)({
        initialMetadata: homePage?.metadata ?? {},
    });
    const [uploadedFavicon, setUploadedFavicon] = (0, react_2.useState)(null);
    const [isSaving, setIsSaving] = (0, react_2.useState)(false);
    const handleFaviconSelect = (file) => {
        setUploadedFavicon(file);
        setIsDirty(true);
    };
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const url = (0, utility_1.createSecureUrl)(baseUrl);
            const finalTitle = getFinalTitleMetadata();
            const siteTitle = typeof finalTitle === 'string' ? finalTitle : finalTitle.absolute ?? finalTitle.default ?? '';
            const updatedMetadata = {
                ...(homePage?.metadata ?? {}),
                title: finalTitle,
                description,
                openGraph: {
                    ...homePage?.metadata?.openGraph,
                    title: siteTitle,
                    description: description,
                    url,
                    siteName: siteTitle,
                    type: 'website',
                },
            };
            if (!homePage?.metadata?.metadataBase) {
                if (url) {
                    updatedMetadata.metadataBase = new URL(url);
                }
            }
            if (uploadedFavicon) {
                let faviconPath;
                try {
                    await editorEngine.image.upload(uploadedFavicon, constants_1.DefaultSettings.IMAGE_FOLDER);
                    faviconPath = `/${uploadedFavicon.name}`;
                }
                catch (error) {
                    sonner_1.toast.error('Failed to upload favicon. Please try again.');
                    return;
                }
                updatedMetadata.icons = {
                    icon: faviconPath,
                };
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
            await editorEngine.pages.updateMetadataPage('/', updatedMetadata);
            setUploadedFavicon(null);
            setIsDirty(false);
            sonner_1.toast.success('Site metadata has been updated successfully.', {});
        }
        catch (error) {
            console.error('Failed to update metadata:', error);
            sonner_1.toast.error('Failed to update site metadata. Please try again.', {
                description: 'Failed to update site metadata. Please try again.',
            });
        }
        finally {
            setIsSaving(false);
        }
    };
    return (<div className="text-sm">
            <div className="flex flex-col gap-2 p-6">
                <h2 className="text-lg">Site Settings</h2>
            </div>
            <div className="relative">
                {editorEngine.pages.isScanning ? (<div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="flex items-center gap-3 text-foreground-secondary">
                            <icons_1.Icons.LoadingSpinner className="h-5 w-5 animate-spin"/>
                            <span className="text-sm">Fetching metadata...</span>
                        </div>
                    </div>) : (<metadata_form_1.MetadataForm title={title} titleObject={titleObject} description={description} isDirty={isDirty} projectUrl={baseUrl} isSimpleTitle={isSimpleTitle} disabled={editorEngine.pages.isScanning} isSaving={isSaving} onTitleChange={handleTitleChange} onTitleTemplateChange={handleTitleTemplateChange} onTitleAbsoluteChange={handleTitleAbsoluteChange} onDescriptionChange={handleDescriptionChange} onImageSelect={handleImageSelect} onFaviconSelect={handleFaviconSelect} onDiscard={handleDiscard} onSave={handleSave} showFavicon={true} currentMetadata={homePage?.metadata ?? {}} isRoot={true}/>)}
            </div>
        </div>);
});
//# sourceMappingURL=index.js.map