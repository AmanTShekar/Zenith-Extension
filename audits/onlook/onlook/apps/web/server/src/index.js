"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rpc_1 = require("@onlook/rpc");
const server_1 = require("./server");
const server = (0, server_1.createServer)(rpc_1.editorServerConfig);
server.start();
//# sourceMappingURL=index.js.map