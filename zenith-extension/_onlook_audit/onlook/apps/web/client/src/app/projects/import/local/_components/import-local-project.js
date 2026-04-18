"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportLocalProject = void 0;
const use_get_background_1 = require("@/hooks/use-get-background");
const motion_card_1 = require("@onlook/ui/motion-card");
const react_1 = require("motion/react");
const use_resize_observer_1 = __importDefault(require("use-resize-observer"));
const _context_1 = require("../_context");
const finalizing_project_1 = require("./finalizing-project");
const select_folder_1 = require("./select-folder");
const steps = [<select_folder_1.NewSelectFolder />, <finalizing_project_1.FinalizingProject />];
const ImportLocalProject = () => {
    const { currentStep, direction } = (0, _context_1.useProjectCreation)();
    const { ref } = (0, use_resize_observer_1.default)();
    const variants = {
        initial: (direction) => {
            return { x: `${120 * direction}%`, opacity: 0 };
        },
        active: { x: '0%', opacity: 1 },
        exit: (direction) => {
            return { x: `${-120 * direction}%`, opacity: 0 };
        },
    };
    const backgroundUrl = (0, use_get_background_1.useGetBackground)('create');
    return (<div className="relative w-full h-full flex items-center justify-center" style={{
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundImage: `url(${backgroundUrl})`,
        }}>
            <div className="relative z-10">
                <react_1.MotionConfig transition={{ duration: 0.5, type: 'spring', bounce: 0 }}>
                    <motion_card_1.MotionCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="w-[30rem] min-h-[12rem] bg-background/80 overflow-hidden p-0 border border-primary/20 rounded-lg shadow-lg">
                        <react_1.motion.div ref={ref} layout="position" className="flex flex-col">
                            <react_1.AnimatePresence mode="popLayout" initial={false} custom={direction}>
                                <react_1.motion.div key={currentStep} custom={direction} variants={variants} initial="initial" animate="active" exit="exit">
                                    {steps[currentStep]}
                                </react_1.motion.div>
                            </react_1.AnimatePresence>
                        </react_1.motion.div>
                    </motion_card_1.MotionCard>
                </react_1.MotionConfig>
            </div>
        </div>);
};
exports.ImportLocalProject = ImportLocalProject;
//# sourceMappingURL=import-local-project.js.map