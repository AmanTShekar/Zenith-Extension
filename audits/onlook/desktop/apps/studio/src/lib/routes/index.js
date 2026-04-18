"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteManager = exports.Route = void 0;
const mobx_1 = require("mobx");
const utils_1 = require("../utils");
var Route;
(function (Route) {
    Route["EDITOR"] = "editor";
    Route["SIGN_IN"] = "signin";
    Route["PROJECTS"] = "projects";
})(Route || (exports.Route = Route = {}));
class RouteManager {
    currentRoute = Route.PROJECTS;
    constructor() {
        (0, mobx_1.makeAutoObservable)(this);
    }
    get route() {
        return this.currentRoute;
    }
    set route(newRoute) {
        if (newRoute === this.currentRoute) {
            return;
        }
        this.currentRoute = newRoute;
        (0, utils_1.sendAnalytics)('navigate', { route: newRoute });
    }
}
exports.RouteManager = RouteManager;
//# sourceMappingURL=index.js.map