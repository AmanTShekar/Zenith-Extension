"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateCodeDiffRequest = getOrCreateCodeDiffRequest;
async function getOrCreateCodeDiffRequest(oid, branchId, oidToCodeChange) {
    let diffRequest = oidToCodeChange.get(oid);
    if (!diffRequest) {
        diffRequest = {
            oid,
            branchId,
            structureChanges: [],
            attributes: {},
            textContent: null,
            overrideClasses: null,
        };
        oidToCodeChange.set(oid, diffRequest);
    }
    return diffRequest;
}
//# sourceMappingURL=helpers.js.map