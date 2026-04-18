"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProject = createProject;
const models_1 = require("@onlook/models");
const download_1 = __importDefault(require("download"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const bun_1 = require("../bun");
async function createProject(projectName, targetPath, onProgress) {
    try {
        const fullPath = path.join(targetPath, projectName);
        // Check if the directory already exists
        if (fs.existsSync(fullPath)) {
            throw new Error(`Directory ${fullPath} already exists. Please import it to Onlook or go back to create a different folder.`);
        }
        onProgress(models_1.CreateStage.CLONING, `Cloning template...`);
        await downloadTemplate(fullPath);
        // Install dependencies
        const result = await (0, bun_1.runBunCommand)('npm install -y --no-audit --no-fund', {
            cwd: fullPath,
        });
        if (!result.success) {
            throw new Error(`Failed to install dependencies: ${result.error}`);
        }
        onProgress(models_1.CreateStage.COMPLETE, 'Project created successfully!');
    }
    catch (error) {
        onProgress(models_1.CreateStage.ERROR, `Project creation failed: ${error}`);
        throw error;
    }
}
async function downloadTemplate(fullPath) {
    try {
        const zipUrl = `https://github.com/onlook-dev/starter/archive/refs/heads/main.zip`;
        await (0, download_1.default)(zipUrl, fullPath, {
            extract: true,
            strip: 1,
            retry: 3,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to download and extract template: ${error.message}`);
        }
        throw new Error('Failed to download and extract template: Unknown error');
    }
}
//# sourceMappingURL=install.js.map