"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinalizingProject = void 0;
const button_1 = require("@onlook/ui/button");
const card_1 = require("@onlook/ui/card");
const progress_with_interval_1 = require("@onlook/ui/progress-with-interval");
const react_1 = require("motion/react");
const steps_1 = require("../../steps");
const _context_1 = require("../_context");
const FinalizingProject = () => {
    const { isFinalizing, error, retry, cancel } = (0, _context_1.useProjectCreation)();
    return (<>
            <steps_1.StepHeader>
                <card_1.CardTitle>{'Setting up project...'}</card_1.CardTitle>
                <card_1.CardDescription>{"We're setting up your project"}</card_1.CardDescription>
            </steps_1.StepHeader>
            <steps_1.StepContent>
                <react_1.motion.div key="name" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full">
                    {error ? (<div className="w-full h-full flex items-center justify-center">
                            <p>{error}</p>
                        </div>) : (<progress_with_interval_1.ProgressWithInterval isLoading={isFinalizing ?? false}/>)}
                </react_1.motion.div>
            </steps_1.StepContent>
            <steps_1.StepFooter>
                <button_1.Button onClick={cancel} disabled={isFinalizing} variant="outline">
                    Cancel
                </button_1.Button>
                {error && (<button_1.Button onClick={retry} disabled={isFinalizing}>
                        Retry
                    </button_1.Button>)}
            </steps_1.StepFooter>
        </>);
};
exports.FinalizingProject = FinalizingProject;
//# sourceMappingURL=finalizing-project.js.map