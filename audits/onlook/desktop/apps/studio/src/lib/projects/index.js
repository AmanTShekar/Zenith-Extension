"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsManager = exports.ProjectTabs = void 0;
const constants_1 = require("@onlook/models/constants");
const mobx_1 = require("mobx");
const non_secure_1 = require("nanoid/non-secure");
const utils_1 = require("../utils");
const create_1 = require("./create");
const domains_1 = require("./domains");
const run_1 = require("./run");
const versions_1 = require("./versions");
var ProjectTabs;
(function (ProjectTabs) {
    ProjectTabs["PROJECTS"] = "projects";
    ProjectTabs["SETTINGS"] = "settings";
    ProjectTabs["PROMPT_CREATE"] = "prompt-create";
    ProjectTabs["IMPORT_PROJECT"] = "import-project";
})(ProjectTabs || (exports.ProjectTabs = ProjectTabs = {}));
class ProjectsManager {
    projectsTab = ProjectTabs.PROJECTS;
    editorEngine = null;
    createManager;
    _project = null;
    _projects = [];
    _run = null;
    _domains = null;
    _versions = null;
    constructor() {
        (0, mobx_1.makeAutoObservable)(this);
        this.createManager = new create_1.CreateManager(this);
        this.restoreProjects();
    }
    get create() {
        return this.createManager;
    }
    async restoreProjects() {
        const cachedProjects = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.GET_PROJECTS);
        if (!cachedProjects || !cachedProjects.projects) {
            console.error('Failed to restore projects');
            return;
        }
        this._projects = cachedProjects.projects;
        const appState = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.GET_APP_STATE);
        if (!appState) {
            console.error('Failed to restore app state');
            return;
        }
        if (appState.activeProjectId) {
            this.project = this._projects.find((p) => p.id === appState.activeProjectId) || null;
        }
    }
    createProject(name, url, folderPath, commands) {
        const newProject = {
            id: (0, non_secure_1.nanoid)(),
            name,
            url,
            folderPath,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            commands,
            previewImg: null,
            settings: null,
            domains: {
                base: null,
                custom: null,
            },
            metadata: null,
            env: {},
        };
        const updatedProjects = [...this._projects, newProject];
        this.projects = updatedProjects;
        return newProject;
    }
    updateProject(newProject) {
        const updatedProjects = this._projects.map((p) => p.id === newProject.id ? newProject : p);
        this.project = newProject;
        this.projects = updatedProjects;
    }
    updatePartialProject(newProject) {
        if (!this.project) {
            console.error('Project not found');
            return;
        }
        this.updateProject({ ...this.project, ...newProject });
    }
    updateAppState(appState) {
        (0, utils_1.invokeMainChannel)(constants_1.MainChannels.REPLACE_APP_STATE, appState);
    }
    saveProjects() {
        (0, utils_1.invokeMainChannel)(constants_1.MainChannels.UPDATE_PROJECTS, { projects: this._projects });
    }
    deleteProject(project, deleteProjectFolder = false) {
        if (this.project?.id === project.id) {
            this.project = null;
        }
        this.projects = this._projects.filter((p) => p.id !== project.id);
        if (deleteProjectFolder) {
            (0, utils_1.invokeMainChannel)(constants_1.MainChannels.DELETE_FOLDER, project.folderPath);
        }
        (0, utils_1.sendAnalytics)('delete project', { url: project.url, id: project.id, deleteProjectFolder });
    }
    async scanProjectMetadata(project) {
        try {
            const metadata = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.SCAN_PROJECT_METADATA, {
                projectRoot: project.folderPath,
            });
            this.updatePartialProject({ metadata });
        }
        catch (error) {
            console.error(error);
        }
    }
    get project() {
        return this._project;
    }
    get runner() {
        return this._run;
    }
    get domains() {
        return this._domains;
    }
    get versions() {
        return this._versions;
    }
    set project(newProject) {
        if (!newProject) {
            this.disposeManagers();
        }
        else {
            this.setOrUpdateManagers(newProject);
        }
        this._project = newProject;
        this.updateAppState({
            activeProjectId: this.project?.id ?? null,
        });
    }
    setOrUpdateManagers(project) {
        if (!this.editorEngine) {
            console.error('Editor engine not found');
            return;
        }
        if (!this._run) {
            this._run = new run_1.RunManager(this.editorEngine, project);
        }
        else {
            this._run.updateProject(project);
        }
        if (!this._domains) {
            this._domains = new domains_1.DomainsManager(this, project);
        }
        else {
            this._domains.updateProject(project);
        }
        if (!this._versions) {
            this._versions = new versions_1.VersionsManager(project, this.editorEngine);
        }
        else {
            this._versions.updateProject(project);
        }
    }
    disposeManagers() {
        this._run?.dispose();
        this._domains?.dispose();
        this._versions?.dispose();
        this._run = null;
        this._domains = null;
        this._versions = null;
    }
    get projects() {
        return this._projects;
    }
    set projects(newProjects) {
        this._projects = newProjects;
        this.saveProjects();
    }
}
exports.ProjectsManager = ProjectsManager;
//# sourceMappingURL=index.js.map