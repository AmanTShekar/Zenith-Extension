"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBuildScript = runBuildScript;
const bun_1 = require("../bun");
async function runBuildScript(folderPath, buildScript) {
    return await (0, bun_1.runBunCommand)(buildScript, {
        cwd: folderPath,
        env: { ...process.env, NODE_ENV: 'production' },
    });
}
//# sourceMappingURL=run.js.map