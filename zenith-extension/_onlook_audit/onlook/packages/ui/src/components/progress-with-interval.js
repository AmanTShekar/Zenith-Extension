"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressWithInterval = void 0;
const react_1 = require("react");
const utils_1 = require("../utils");
const progress_1 = require("./progress");
const ProgressWithInterval = ({ isLoading, increment = 0.167, intervalMs = 100, className, maxValue = 100, }) => {
    const [progress, setProgress] = (0, react_1.useState)(0);
    const progressInterval = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
        }
        if (isLoading) {
            setProgress(0);
            progressInterval.current = setInterval(() => {
                setProgress((prev) => Math.min(prev + increment, maxValue));
            }, intervalMs);
        }
        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, [isLoading, increment, intervalMs, maxValue]);
    return <progress_1.Progress value={progress} className={(0, utils_1.cn)('w-full', className)}/>;
};
exports.ProgressWithInterval = ProgressWithInterval;
//# sourceMappingURL=progress-with-interval.js.map