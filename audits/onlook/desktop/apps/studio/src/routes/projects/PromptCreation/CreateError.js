"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateErrorCard = void 0;
const Context_1 = require("@/components/Context");
const create_1 = require("@/lib/projects/create");
const button_1 = require("@onlook/ui/button");
const card_1 = require("@onlook/ui/card");
const icons_1 = require("@onlook/ui/icons");
const motion_card_1 = require("@onlook/ui/motion-card");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_i18next_1 = require("react-i18next");
const react_1 = require("motion/react");
const use_resize_observer_1 = __importDefault(require("use-resize-observer"));
exports.CreateErrorCard = (0, mobx_react_lite_1.observer)(() => {
    const { t } = (0, react_i18next_1.useTranslation)();
    const projectsManager = (0, Context_1.useProjectsManager)();
    const { ref: diffRef, height: diffHeight } = (0, use_resize_observer_1.default)();
    return (<react_1.MotionConfig transition={{ duration: 0.5, type: 'spring', bounce: 0 }}>
            <motion_card_1.MotionCard initial={{ opacity: 0, y: 20 }} animate={{ height: diffHeight, opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className={(0, utils_1.cn)('w-[600px] mb-32 backdrop-blur-md bg-background/30 overflow-hidden')}>
                <react_1.motion.div ref={diffRef} layout="position" className="flex flex-col">
                    <card_1.CardHeader>
                        <react_1.motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl text-foreground-primary">
                            {t('projects.create.error.title')}
                        </react_1.motion.h2>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                        <div className="flex flex-col gap-3 rounded p-0 transition-colors duration-200 cursor-text">
                            <react_1.motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-sm text-red-500 max-h-96 overflow-y-auto">
                                {projectsManager.create.error ||
            t('projects.create.loading.description')}
                            </react_1.motion.p>
                            <div className="flex flex-row w-full justify-between mt-4">
                                <button_1.Button variant="outline" className="text-foreground-tertiary text-sm" onClick={() => (projectsManager.create.state = create_1.CreateState.PROMPT)}>
                                    <icons_1.Icons.Return className="w-4 h-4 mr-2"/>
                                    {t('projects.create.error.backToPrompt')}
                                </button_1.Button>
                            </div>
                        </div>
                    </card_1.CardContent>
                </react_1.motion.div>
            </motion_card_1.MotionCard>
        </react_1.MotionConfig>);
});
//# sourceMappingURL=CreateError.js.map