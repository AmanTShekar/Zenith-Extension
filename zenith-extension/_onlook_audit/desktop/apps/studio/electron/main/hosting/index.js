"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const growth_1 = require("@onlook/growth");
const constants_1 = require("@onlook/models/constants");
const hosting_1 = require("@onlook/models/hosting");
const utility_1 = require("@onlook/utility");
const __1 = require("..");
const analytics_1 = __importDefault(require("../analytics"));
const auth_1 = require("../auth");
const helpers_1 = require("./helpers");
const run_1 = require("./run");
const timer_1 = require("/common/helpers/timer");
class HostingManager {
    static instance;
    static getInstance() {
        if (!HostingManager.instance) {
            HostingManager.instance = new HostingManager();
        }
        return HostingManager.instance;
    }
    async publish({ folderPath, buildScript, urls, options, }) {
        try {
            const timer = new timer_1.LogTimer('Deployment');
            this.emitState(hosting_1.PublishStatus.LOADING, 'Preparing project...');
            await this.runPrepareStep(folderPath);
            this.emitState(hosting_1.PublishStatus.LOADING, 'Creating optimized build...');
            timer.log('Prepare completed');
            if (!options?.skipBadge) {
                this.emitState(hosting_1.PublishStatus.LOADING, 'Adding badge...');
                await this.addBadge(folderPath);
                timer.log('"Built with Onlook" badge added');
            }
            // Run the build script
            await this.runBuildStep(folderPath, buildScript, options);
            this.emitState(hosting_1.PublishStatus.LOADING, 'Preparing project for deployment...');
            timer.log('Build completed');
            // Postprocess the project for deployment
            const { success: postprocessSuccess, error: postprocessError } = await (0, helpers_1.postprocessNextBuild)(folderPath);
            timer.log('Project preparation completed');
            if (!postprocessSuccess) {
                throw new Error(`Failed to postprocess project for deployment, error: ${postprocessError}`);
            }
            // Serialize the files for deployment
            const NEXT_BUILD_OUTPUT_PATH = `${folderPath}/${constants_1.CUSTOM_OUTPUT_DIR}/standalone`;
            const files = await (0, helpers_1.serializeFiles)(NEXT_BUILD_OUTPUT_PATH);
            this.emitState(hosting_1.PublishStatus.LOADING, 'Deploying project...');
            timer.log('Files serialized, sending to Freestyle...');
            const id = await this.sendHostingPostRequest(files, urls, options?.envVars);
            timer.log('Deployment completed');
            this.emitState(hosting_1.PublishStatus.PUBLISHED, 'Deployment successful, deployment ID: ' + id);
            if (!options?.skipBadge) {
                await this.removeBadge(folderPath);
                timer.log('"Built with Onlook" badge removed');
            }
            return {
                success: true,
                message: 'Deployment successful, deployment ID: ' + id,
            };
        }
        catch (error) {
            console.error('Failed to deploy to preview environment', error);
            this.emitState(hosting_1.PublishStatus.ERROR, 'Deployment failed with error: ' + error);
            analytics_1.default.trackError('Failed to deploy to preview environment', {
                error,
            });
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async addBadge(folderPath) {
        await (0, growth_1.injectBuiltWithScript)(folderPath);
        await (0, growth_1.addBuiltWithScript)(folderPath);
    }
    async removeBadge(folderPath) {
        await (0, growth_1.removeBuiltWithScriptFromLayout)(folderPath);
        await (0, growth_1.removeBuiltWithScript)(folderPath);
    }
    async runPrepareStep(folderPath) {
        // Preprocess the project
        const { success: preprocessSuccess, error: preprocessError } = await (0, helpers_1.preprocessNextBuild)(folderPath);
        if (!preprocessSuccess) {
            throw new Error(`Failed to prepare project for deployment, error: ${preprocessError}`);
        }
        // Update .gitignore to ignore the custom output directory
        const gitignoreSuccess = (0, helpers_1.updateGitignore)(folderPath, constants_1.CUSTOM_OUTPUT_DIR);
        if (!gitignoreSuccess) {
            console.warn('Failed to update .gitignore');
        }
    }
    async runBuildStep(folderPath, buildScript, options) {
        // Use default build flags if no build flags are provided
        const buildFlagsString = (0, utility_1.isNullOrUndefined)(options?.buildFlags)
            ? constants_1.DefaultSettings.EDITOR_SETTINGS.buildFlags
            : options?.buildFlags || '';
        const BUILD_SCRIPT_NO_LINT = (0, utility_1.isEmptyString)(buildFlagsString)
            ? buildScript
            : `${buildScript} -- ${buildFlagsString}`;
        if (options?.skipBuild) {
            console.log('Skipping build');
            return;
        }
        const { success: buildSuccess, error: buildError, output: buildOutput, } = await (0, run_1.runBuildScript)(folderPath, BUILD_SCRIPT_NO_LINT);
        if (!buildSuccess) {
            this.emitState(hosting_1.PublishStatus.ERROR, `Build failed with error: ${buildError}`);
            throw new Error(`Build failed with error: ${buildError}`);
        }
        else {
            console.log('Build succeeded with output: ', buildOutput);
        }
    }
    emitState(state, message) {
        console.log(`Deployment state: ${state} - ${message}`);
        __1.mainWindow?.webContents.send(constants_1.MainChannels.PUBLISH_STATE_CHANGED, {
            state,
            message,
        });
        analytics_1.default.track(`hosting state updated`, {
            state,
            message,
        });
    }
    async unpublish(urls) {
        try {
            const id = await this.sendHostingPostRequest({}, urls);
            this.emitState(hosting_1.PublishStatus.UNPUBLISHED, 'Deployment deleted with ID: ' + id);
            analytics_1.default.track('hosting unpublish', {
                state: hosting_1.PublishStatus.UNPUBLISHED,
                message: 'Deployment deleted with ID: ' + id,
            });
            return {
                success: true,
                message: 'Deployment deleted with ID: ' + id,
            };
        }
        catch (error) {
            console.error('Failed to delete deployment', error);
            this.emitState(hosting_1.PublishStatus.ERROR, 'Failed to delete deployment');
            analytics_1.default.trackError('Failed to delete deployment', {
                error,
            });
            return {
                success: false,
                message: 'Failed to delete deployment. ' + error,
            };
        }
    }
    async sendHostingPostRequest(files, urls, envVars) {
        const authTokens = await (0, auth_1.getRefreshedAuthTokens)();
        const config = {
            domains: urls,
            entrypoint: 'server.js',
            envVars,
        };
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_API_URL}${constants_1.FUNCTIONS_ROUTE}${constants_1.BASE_API_ROUTE}${constants_1.ApiRoutes.HOSTING_V2}${constants_1.HostingRoutes.DEPLOY_WEB}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authTokens.accessToken}`,
            },
            body: JSON.stringify({
                files,
                config,
            }),
        });
        const freestyleResponse = (await res.json());
        if (!res.ok || !freestyleResponse.success) {
            console.log(JSON.stringify(freestyleResponse));
            throw new Error(`${freestyleResponse.error?.message || freestyleResponse.message || 'Unknown error'}`);
        }
        return freestyleResponse.data?.deploymentId ?? '';
    }
}
exports.default = HostingManager.getInstance();
//# sourceMappingURL=index.js.map