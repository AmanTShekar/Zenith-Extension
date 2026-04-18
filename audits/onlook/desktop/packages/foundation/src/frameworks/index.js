"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Framework = void 0;
const __1 = require("..");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const cra_1 = require("./cra");
const next_1 = require("./next");
const vite_1 = require("./vite");
const webpack_1 = require("./webpack");
class Framework {
    name;
    identify;
    updateConfig;
    dependencies;
    buildToolName;
    cleanup;
    static NEXT = new Framework('Next.js', next_1.isNextJsProject, next_1.modifyNextConfig, constants_1.NEXT_DEPENDENCIES, constants_1.BUILD_TOOL_NAME.NEXT, next_1.removeNextCache);
    static VITE = new Framework('Vite', vite_1.isViteJsProject, vite_1.modifyViteConfig, constants_1.VITE_DEPENDENCIES, constants_1.BUILD_TOOL_NAME.VITE);
    static WEBPACK = new Framework('Webpack', webpack_1.isWebpackProject, webpack_1.modifyWebpackConfig, constants_1.WEBPACK_DEPENDENCIES, constants_1.BUILD_TOOL_NAME.WEBPACK);
    static CRA = new Framework('Create React App', cra_1.isCRAProject, cra_1.modifyCRAConfig, constants_1.CRA_DEPENDENCIES, constants_1.BUILD_TOOL_NAME.CRA);
    constructor(name, identify, updateConfig, dependencies, buildToolName, cleanup) {
        this.name = name;
        this.identify = identify;
        this.updateConfig = updateConfig;
        this.dependencies = dependencies;
        this.buildToolName = buildToolName;
        this.cleanup = cleanup;
    }
    setup = async (callback) => {
        if (await this.identify()) {
            callback(__1.SetupStage.INSTALLING, `Installing required packages for ${this.name}...`);
            await (0, utils_1.installPackages)(this.dependencies);
            callback(__1.SetupStage.CONFIGURING, `Applying ${this.name} configuration...`);
            const configFileExtension = await (0, utils_1.getFileExtensionByPattern)(process.cwd(), constants_1.CONFIG_FILE_PATTERN[this.buildToolName]);
            if (configFileExtension) {
                await this.updateConfig(configFileExtension);
            }
            if (this.cleanup) {
                callback(__1.SetupStage.CONFIGURING, `Cleaning up after setup...`);
                this.cleanup();
            }
            return true;
        }
        return false;
    };
    static getAll() {
        return [this.NEXT, this.VITE, this.WEBPACK, this.CRA];
    }
}
exports.Framework = Framework;
//# sourceMappingURL=index.js.map