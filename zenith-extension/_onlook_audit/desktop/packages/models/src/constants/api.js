"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostingRoutes = exports.REQUEST_TYPE_HEADER = exports.REDIRECT_APP_URL = exports.ProxyRoutes = exports.BASE_PROXY_ROUTE = exports.ApiRoutes = exports.BASE_API_ROUTE = exports.FUNCTIONS_ROUTE = void 0;
// WARNING: BE CAREFUL WHEN CHANGING THESE ROUTES, THEY ARE USED IN PRODUCTION
exports.FUNCTIONS_ROUTE = '/functions/v1';
exports.BASE_API_ROUTE = '/api';
var ApiRoutes;
(function (ApiRoutes) {
    ApiRoutes["AI"] = "/ai";
    ApiRoutes["AI_V2"] = "/ai-v2";
    ApiRoutes["ANALYTICS"] = "/analytics";
    ApiRoutes["HOSTING"] = "/hosting";
    ApiRoutes["HOSTING_V2"] = "/hosting/v2";
    ApiRoutes["CUSTOM_DOMAINS"] = "/custom-domains";
    ApiRoutes["CREATE_CHECKOUT"] = "/create-checkout";
    ApiRoutes["CHECK_SUBSCRIPTION"] = "/check-subscription";
    ApiRoutes["CREATE_CUSTOMER_PORTAL_SESSION"] = "/create-customer-portal-session";
})(ApiRoutes || (exports.ApiRoutes = ApiRoutes = {}));
exports.BASE_PROXY_ROUTE = '/proxy';
var ProxyRoutes;
(function (ProxyRoutes) {
    ProxyRoutes["ANTHROPIC"] = "/anthropic";
    ProxyRoutes["TRAINLOOP"] = "/trainloop";
})(ProxyRoutes || (exports.ProxyRoutes = ProxyRoutes = {}));
exports.REDIRECT_APP_URL = 'https://onlook.dev/redirect-app';
exports.REQUEST_TYPE_HEADER = 'X-Onlook-Request-Type';
var HostingRoutes;
(function (HostingRoutes) {
    HostingRoutes["CREATE_DOMAIN_VERIFICATION"] = "/create-domain-verification";
    HostingRoutes["VERIFY_DOMAIN"] = "/verify-domain";
    HostingRoutes["DEPLOY_WEB"] = "/deploy-web";
    HostingRoutes["OWNED_DOMAINS"] = "/owned-domains";
})(HostingRoutes || (exports.HostingRoutes = HostingRoutes = {}));
//# sourceMappingURL=api.js.map