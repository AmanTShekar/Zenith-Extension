"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const otel_1 = require("@vercel/otel");
const langfuse_vercel_1 = require("langfuse-vercel");
function register() {
    (0, otel_1.registerOTel)({ serviceName: 'Onlook Web', traceExporter: new langfuse_vercel_1.LangfuseExporter() });
}
//# sourceMappingURL=instrumentation.js.map