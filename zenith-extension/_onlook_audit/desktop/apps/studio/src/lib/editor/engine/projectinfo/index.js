"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectInfoManager = void 0;
const mobx_1 = require("mobx");
class ProjectInfoManager {
    projectComponents;
    constructor() {
        (0, mobx_1.makeAutoObservable)(this);
        this.projectComponents = [];
    }
    get components() {
        return this.projectComponents;
    }
    set components(newComponents) {
        this.projectComponents = newComponents;
    }
}
exports.ProjectInfoManager = ProjectInfoManager;
//# sourceMappingURL=index.js.map