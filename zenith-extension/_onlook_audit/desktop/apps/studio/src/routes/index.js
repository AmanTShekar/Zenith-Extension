"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Routes = void 0;
const Context_1 = require("@/components/Context");
const routes_1 = require("@/lib/routes");
const mobx_react_lite_1 = require("mobx-react-lite");
const editor_1 = require("./editor");
const projects_1 = require("./projects");
const signin_1 = require("./signin");
exports.Routes = (0, mobx_react_lite_1.observer)(() => {
    const routeManager = (0, Context_1.useRouteManager)();
    const authManager = (0, Context_1.useAuthManager)();
    const projectsManager = (0, Context_1.useProjectsManager)();
    if (!authManager.authenticated && authManager.isAuthEnabled) {
        routeManager.route = routes_1.Route.SIGN_IN;
    }
    else if (projectsManager.project) {
        routeManager.route = routes_1.Route.EDITOR;
    }
    else {
        routeManager.route = routes_1.Route.PROJECTS;
    }
    switch (routeManager.route) {
        case routes_1.Route.EDITOR:
            return <editor_1.ProjectEditor />;
        case routes_1.Route.SIGN_IN:
            return <signin_1.SignIn />;
        case routes_1.Route.PROJECTS:
            return <projects_1.Projects />;
        default:
            return <div>404: Unknown route</div>;
    }
});
//# sourceMappingURL=index.js.map