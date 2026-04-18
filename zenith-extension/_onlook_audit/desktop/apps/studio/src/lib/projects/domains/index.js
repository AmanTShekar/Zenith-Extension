"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainsManager = void 0;
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const projects_1 = require("@onlook/models/projects");
const utility_1 = require("@onlook/utility");
const mobx_1 = require("mobx");
const hosting_1 = require("./hosting");
class DomainsManager {
    projectsManager;
    project;
    _baseHosting = null;
    _customHosting = null;
    constructor(projectsManager, project) {
        this.projectsManager = projectsManager;
        this.project = project;
        (0, mobx_1.makeAutoObservable)(this);
        this.setupHostingManagers();
    }
    updateProject(project) {
        this.project = project;
        this.setupHostingManagers();
    }
    setupHostingManagers() {
        if (!this.project.domains?.base) {
            this._baseHosting = null;
        }
        else {
            this._baseHosting = new hosting_1.HostingManager(this.projectsManager, this.project, this.project.domains.base);
        }
        if (!this.project.domains?.custom) {
            this._customHosting = null;
        }
        else {
            this._customHosting = new hosting_1.HostingManager(this.projectsManager, this.project, this.project.domains.custom);
        }
    }
    get base() {
        return this._baseHosting;
    }
    get custom() {
        return this._customHosting;
    }
    addBaseDomainToProject(buildFlags) {
        const domains = {
            base: null,
            custom: null,
            ...this.project.domains,
        };
        const url = `${(0, utility_1.getValidSubdomain)(this.project.id)}.${constants_1.HOSTING_DOMAIN}`;
        domains.base = {
            type: projects_1.DomainType.BASE,
            url,
        };
        this.projectsManager.updateProject({ ...this.project, domains });
        setTimeout(() => {
            this.base?.publish({ buildFlags, envVars: this.project.env });
        }, 100);
    }
    async addCustomDomainToProject(url) {
        const domains = {
            base: null,
            custom: null,
            ...this.project.domains,
        };
        domains.custom = {
            type: projects_1.DomainType.CUSTOM,
            url,
        };
        this.projectsManager.updateProject({ ...this.project, domains });
    }
    async removeCustomDomainFromProject() {
        const domains = {
            base: null,
            ...this.project.domains,
            custom: null,
        };
        this.projectsManager.updateProject({ ...this.project, domains });
    }
    async getOwnedDomains() {
        const response = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.GET_OWNED_DOMAINS);
        if (!response.success) {
            console.error(response.message ?? 'Failed to get owned domains');
            return [];
        }
        return response.domains ?? [];
    }
    dispose() {
        this._baseHosting?.dispose();
        this._customHosting?.dispose();
    }
}
exports.DomainsManager = DomainsManager;
//# sourceMappingURL=index.js.map