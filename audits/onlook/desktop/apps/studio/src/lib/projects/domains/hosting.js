"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostingManager = void 0;
const constants_1 = require("@onlook/models/constants");
const hosting_1 = require("@onlook/models/hosting");
const projects_1 = require("@onlook/models/projects");
const utility_1 = require("@onlook/utility");
const mobx_1 = require("mobx");
const index_ts_1 = require("../../utils/index.ts");
const DEFAULT_STATE = {
    status: hosting_1.PublishStatus.UNPUBLISHED,
    message: null,
};
class HostingManager {
    projectsManager;
    project;
    domain;
    stateChangeListener = null;
    state = DEFAULT_STATE;
    constructor(projectsManager, project, domain) {
        this.projectsManager = projectsManager;
        this.project = project;
        this.domain = domain;
        (0, mobx_1.makeAutoObservable)(this);
        this.listenForStateChanges();
        if (this.domain.publishedAt) {
            this.updateState({
                status: hosting_1.PublishStatus.PUBLISHED,
                message: null,
            });
        }
    }
    async listenForStateChanges() {
        this.stateChangeListener = async (args) => {
            const state = args;
            this.updateState(state);
        };
        window.api.on(constants_1.MainChannels.PUBLISH_STATE_CHANGED, this.stateChangeListener);
    }
    updateDomain(domain) {
        const domains = { base: null, custom: null, ...this.project.domains };
        if (domain.type === projects_1.DomainType.BASE) {
            domains.base = domain;
        }
        else if (domain.type === projects_1.DomainType.CUSTOM) {
            domains.custom = domain;
        }
        this.updateProject({ domains });
    }
    removeDomain(type) {
        const domains = { base: null, custom: null, ...this.project.domains };
        if (type === projects_1.DomainType.BASE) {
            domains.base = null;
        }
        else if (type === projects_1.DomainType.CUSTOM) {
            domains.custom = null;
        }
        this.updateProject({ domains });
    }
    updateProject(project) {
        const newProject = { ...this.project, ...project };
        this.projectsManager.updateProject(newProject);
        this.project = newProject;
    }
    updateState(partialState) {
        this.state = { ...this.state, ...partialState };
    }
    async publish(options) {
        (0, index_ts_1.sendAnalytics)('hosting publish');
        this.updateState({ status: hosting_1.PublishStatus.LOADING, message: 'Creating deployment...' });
        this.projectsManager.versions?.createCommit(`Save before publishing to ${this.domain.url}`, false);
        const request = {
            folderPath: this.project.folderPath,
            buildScript: this.project.commands?.build || constants_1.DefaultSettings.COMMANDS.build,
            urls: this.domain.type === projects_1.DomainType.CUSTOM
                ? (0, utility_1.getPublishUrls)(this.domain.url)
                : [this.domain.url],
            options,
        };
        const res = await (0, index_ts_1.invokeMainChannel)(constants_1.MainChannels.PUBLISH_TO_DOMAIN, request);
        if (!res || !res.success) {
            const error = `Failed to publish hosting environment: ${res?.message || 'client error'}`;
            console.error(error);
            this.updateState({
                status: hosting_1.PublishStatus.ERROR,
                message: error,
            });
            (0, index_ts_1.sendAnalyticsError)('Failed to publish', {
                message: error,
            });
            return false;
        }
        this.updateState({ status: hosting_1.PublishStatus.PUBLISHED, message: res.message });
        this.updateDomain({ ...this.domain, publishedAt: new Date().toISOString() });
        (0, index_ts_1.sendAnalytics)('hosting publish success', {
            urls: request.urls,
        });
        return true;
    }
    async unpublish() {
        this.updateState({ status: hosting_1.PublishStatus.LOADING, message: 'Deleting deployment...' });
        (0, index_ts_1.sendAnalytics)('hosting unpublish');
        const urls = (0, utility_1.getPublishUrls)(this.domain.url);
        const res = await (0, index_ts_1.invokeMainChannel)(constants_1.MainChannels.UNPUBLISH_DOMAIN, {
            urls,
        });
        if (!res.success) {
            const error = `Failed to unpublish hosting environment: ${res?.message || 'client error'}`;
            console.error(error);
            this.updateState({
                status: hosting_1.PublishStatus.ERROR,
                message: error,
            });
            (0, index_ts_1.sendAnalyticsError)('Failed to unpublish', {
                message: error,
            });
            return false;
        }
        this.removeDomain(this.domain.type);
        this.updateState({ status: hosting_1.PublishStatus.UNPUBLISHED, message: null });
        (0, index_ts_1.sendAnalytics)('hosting unpublish success');
        return true;
    }
    async dispose() {
        if (this.stateChangeListener) {
            window.api.removeListener(constants_1.MainChannels.PUBLISH_STATE_CHANGED, this.stateChangeListener);
        }
    }
    refresh() {
        this.updateState(DEFAULT_STATE);
    }
}
exports.HostingManager = HostingManager;
//# sourceMappingURL=hosting.js.map