"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCodeDiffs = getCodeDiffs;
const run_1 = __importDefault(require("../../run"));
const helpers_1 = require("../../run/helpers");
const files_1 = require("../files");
const helpers_2 = require("../helpers");
const helpers_3 = require("./helpers");
const transform_1 = require("./transform");
async function getCodeDiffs(requests) {
    const groupedRequests = await groupRequestsByOid(requests);
    return processGroupedRequests(groupedRequests);
}
async function groupRequestsByOid(requests) {
    const groupedRequests = new Map();
    for (const request of requests) {
        const templateNode = await run_1.default.getTemplateNode(request.oid);
        if (!templateNode) {
            console.error(`Template node not found for oid: ${request.oid}`);
            continue;
        }
        const codeBlock = await (0, files_1.readFile)(templateNode.path);
        if (!codeBlock) {
            console.error(`Failed to read file: ${templateNode.path}`);
            continue;
        }
        const path = templateNode.path;
        let groupedRequest = groupedRequests.get(path);
        if (!groupedRequest) {
            groupedRequest = { oidToCodeDiff: new Map(), codeBlock };
        }
        groupedRequest.oidToCodeDiff.set(request.oid, request);
        groupedRequests.set(path, groupedRequest);
    }
    return groupedRequests;
}
function processGroupedRequests(groupedRequests) {
    const diffs = [];
    for (const [path, request] of groupedRequests) {
        const { oidToCodeDiff, codeBlock } = request;
        const ast = (0, helpers_2.parseJsxFile)(codeBlock);
        if (!ast) {
            continue;
        }
        const original = (0, helpers_3.generateCode)(ast, helpers_1.GENERATE_CODE_OPTIONS, codeBlock);
        (0, transform_1.transformAst)(ast, oidToCodeDiff);
        const generated = (0, helpers_3.generateCode)(ast, helpers_1.GENERATE_CODE_OPTIONS, codeBlock);
        diffs.push({ original, generated, path });
    }
    return diffs;
}
//# sourceMappingURL=index.js.map