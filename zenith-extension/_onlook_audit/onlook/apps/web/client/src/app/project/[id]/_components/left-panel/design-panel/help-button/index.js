"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpButton = void 0;
const telemetry_1 = require("@/utils/telemetry");
const icons_1 = require("@onlook/ui/icons");
const mobx_react_lite_1 = require("mobx-react-lite");
exports.HelpButton = (0, mobx_react_lite_1.observer)(() => {
    return (<button aria-label="Open help" className="w-16 h-16 rounded-xl flex flex-col items-center justify-center gap-1.5 p-2 text-muted-foreground hover:text-foreground" onClick={() => void (0, telemetry_1.openFeedbackWidget)()}>
            <icons_1.Icons.QuestionMarkCircled className="w-5 h-5"/>
        </button>);
});
//# sourceMappingURL=index.js.map