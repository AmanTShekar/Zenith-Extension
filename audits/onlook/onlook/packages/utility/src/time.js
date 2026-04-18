"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogTimer = exports.formatCommitDate = exports.timeAgo = void 0;
const timeAgo = (date) => {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const diffYears = Math.floor(diff / (1000 * 60 * 60 * 24 * 30 * 12));
    if (diffYears > 0) {
        return `${diffYears}y`;
    }
    const diffMonths = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    if (diffMonths > 0) {
        return `${diffMonths}m`;
    }
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
        return `${diffDays}d`;
    }
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    if (diffHours > 0) {
        return `${diffHours}h`;
    }
    const diffMinutes = Math.floor(diff / (1000 * 60));
    if (diffMinutes > 0) {
        return `${diffMinutes}m`;
    }
    const diffSeconds = Math.floor(diff / 1000);
    return `${diffSeconds}s`;
};
exports.timeAgo = timeAgo;
const formatCommitDate = (timeStamp, options) => {
    const then = new Date(timeStamp * 1000);
    return then.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        ...(options?.includeDate && {
            month: 'numeric',
            day: 'numeric',
            year: '2-digit',
        }),
    });
};
exports.formatCommitDate = formatCommitDate;
/**
 * A utility class for performance logging and timing
 * Tracks elapsed time since creation and provides logging methods
 */
class LogTimer {
    startTime;
    name;
    constructor(name) {
        this.startTime = Date.now();
        this.name = name;
    }
    /**
     * Logs the elapsed time for a specific step
     * @param step - Description of the step being timed
     */
    log(step) {
        const elapsed = Date.now() - this.startTime;
        console.log(`[${this.name}] ${step}: ${elapsed}ms`);
    }
    /**
     * Gets the elapsed time in milliseconds without logging
     * @returns Elapsed time in milliseconds
     */
    getElapsed() {
        return Date.now() - this.startTime;
    }
    /**
     * Resets the timer to the current time
     */
    reset() {
        this.startTime = Date.now();
    }
}
exports.LogTimer = LogTimer;
//# sourceMappingURL=time.js.map