"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogTimer = void 0;
class LogTimer {
    startTime;
    name;
    constructor(name) {
        this.startTime = Date.now();
        this.name = name;
    }
    log(step) {
        const elapsed = Date.now() - this.startTime;
        console.log(`[${this.name}] ${step}: ${elapsed}ms`);
    }
}
exports.LogTimer = LogTimer;
//# sourceMappingURL=timer.js.map