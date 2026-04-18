"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const input_1 = require("@onlook/ui/input");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const ProjectNameInput = (0, mobx_react_lite_1.observer)(() => {
    const projectsManager = (0, Context_1.useProjectsManager)();
    const [projectName, setProjectName] = (0, react_1.useState)('');
    const [isEditing, setIsEditing] = (0, react_1.useState)(false);
    const [originalName, setOriginalName] = (0, react_1.useState)('');
    const inputRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (projectsManager.project) {
            setProjectName(projectsManager.project.name);
            setOriginalName(projectsManager.project.name);
        }
    }, [projectsManager.project]);
    (0, react_1.useEffect)(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);
    const handleRenameProject = () => {
        if (projectsManager.project && projectName.trim() !== '') {
            projectsManager.updateProject({ ...projectsManager.project, name: projectName.trim() });
            setIsEditing(false);
            setOriginalName(projectName.trim());
        }
        else {
            cancelRename();
        }
    };
    const cancelRename = () => {
        setProjectName(originalName);
        setIsEditing(false);
    };
    const handleStartEditing = () => {
        setIsEditing(true);
        setIsEditing(true);
        setOriginalName(projectName);
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleRenameProject();
        }
        else if (e.key === 'Escape') {
            cancelRename();
        }
    };
    return (<div className="flex items-center">
            {isEditing ? (<input_1.Input ref={inputRef} value={projectName} onChange={(e) => setProjectName(e.target.value)} onKeyDown={handleKeyDown} onBlur={handleRenameProject} className="mx-0 max-w-[200px] px-1 py-0 h-6 text-foreground-onlook text-small caret-red-500 selection:bg-red-500/50 placeholder:hover:text-red-500 selection:text-red-900 dark:selection:bg-red-500/50 dark:selection:text-red-200"/>) : (<span className="mx-0 max-w-[60px] md:max-w-[100px] lg:max-w-[200px] px-0 text-foreground-onlook text-small truncate cursor-pointer" onDoubleClick={handleStartEditing}>
                    {projectsManager.project?.name}
                </span>)}
        </div>);
});
exports.default = ProjectNameInput;
//# sourceMappingURL=ProjectNameInput.js.map