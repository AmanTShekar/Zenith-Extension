"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeviceType = exports.computeWindowMetadata = void 0;
const constants_1 = require("@onlook/constants");
const computeWindowMetadata = (width, height) => {
    const numericWidth = Number(width);
    const numericHeight = Number(height);
    return {
        orientation: numericWidth > numericHeight ? constants_1.Orientation.Landscape : constants_1.Orientation.Portrait,
        aspectRatioLocked: true,
        device: computeDevice(numericWidth, numericHeight),
        theme: constants_1.Theme.System,
        width: numericWidth,
        height: numericHeight,
    };
};
exports.computeWindowMetadata = computeWindowMetadata;
const computeDevice = (width, height) => {
    let matchedDevice = 'Custom';
    for (const category in constants_1.DEVICE_OPTIONS) {
        const devices = constants_1.DEVICE_OPTIONS[category];
        for (const deviceName in devices) {
            const resolution = devices[deviceName];
            if (typeof resolution === 'string') {
                const [w, h] = resolution.split('x').map(Number);
                if (w === width && h === height) {
                    matchedDevice = deviceName;
                    break;
                }
            }
        }
        if (matchedDevice !== 'Custom')
            break;
    }
    return matchedDevice;
};
const getDeviceType = (name) => {
    if (name === 'Custom') {
        return 'Custom';
    }
    for (const category in constants_1.DEVICE_OPTIONS) {
        const devices = constants_1.DEVICE_OPTIONS[category];
        if (devices && devices[name]) {
            switch (category) {
                case 'Phone':
                    return 'Phone';
                case 'Tablet':
                    return 'Tablet';
                case 'Laptop':
                    return 'Laptop';
                case 'Desktop':
                    return 'Desktop';
                case 'Custom':
                    return 'Custom';
                default:
                    return 'Custom';
            }
        }
    }
    return 'Custom';
};
exports.getDeviceType = getDeviceType;
//# sourceMappingURL=window-metadata.js.map