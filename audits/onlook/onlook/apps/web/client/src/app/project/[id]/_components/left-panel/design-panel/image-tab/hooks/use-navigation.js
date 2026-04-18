"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useNavigation = void 0;
const constants_1 = require("@onlook/constants");
const react_1 = require("react");
const useNavigation = (initialFolder = constants_1.DEFAULT_IMAGE_DIRECTORY) => {
    const [activeFolder, setActiveFolder] = (0, react_1.useState)(initialFolder);
    const [search, setSearch] = (0, react_1.useState)('');
    // Generate breadcrumb path segments
    const breadcrumbSegments = (0, react_1.useMemo)(() => {
        const segments = activeFolder.split('/').filter(Boolean);
        return segments.map((segment, index) => {
            const path = '/' + segments.slice(0, index + 1).join('/');
            return { name: segment, path };
        });
    }, [activeFolder]);
    const navigateToFolder = (folderPath) => {
        setActiveFolder(folderPath);
        setSearch(''); // Clear search when navigating
    };
    const handleFolderClick = (folder) => {
        const newPath = activeFolder === '/' ? `/${folder.name}` : `${activeFolder}/${folder.name}`;
        navigateToFolder(newPath);
    };
    // Filter images based on search
    const filterImages = (images) => {
        if (!search)
            return images;
        return images.filter(image => image.name.toLowerCase().includes(search.toLowerCase()));
    };
    return {
        activeFolder,
        search,
        setSearch,
        breadcrumbSegments,
        navigateToFolder,
        handleFolderClick,
        filterImages,
    };
};
exports.useNavigation = useNavigation;
//# sourceMappingURL=use-navigation.js.map