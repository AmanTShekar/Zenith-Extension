import { motion, AnimatePresence } from 'framer-motion';

export function QuickStartGuide({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const steps = [
    {
      title: '1. Connect Your Project',
      description: 'Start your local development server (Vite, Next.js, etc.) and Zenith will automatically detect it on the Home screen. Click to connect.',
      icon: 'ph-plugs-connected'
    },
    {
      title: '2. Enable Surgical Mode',
      description: 'Click the "Surgical" button in the top bar to enable real-time element selection. Hover and click any element in your app to inspect it.',
      icon: 'ph-lightning'
    },
    {
      title: '3. Multi-Device Design',
      description: 'Toggle "Multi-view" in the design bar to see your app across Desktop, Tablet, and Mobile simultaneously.',
      icon: 'ph-columns'
    },
    {
      title: '4. Master Shortcuts',
      description: 'Use Cmd/Ctrl + 0 to autofit, and +/- to zoom. Hold Space or Shift to pan across the infinite canvas.',
      icon: 'ph-keyboard'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[500] cursor-pointer"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-surface border border-white/10 rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] z-[501] overflow-hidden flex flex-col"
          >
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center text-xl">
                     <i className="ph ph-sparkle" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Quick Start Guide</h2>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Zenith v3.10 Development</p>
                  </div>
               </div>
               <button 
                 onClick={onClose}
                 className="w-10 h-10 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
               >
                  <i className="ph ph-x" />
               </button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
               {steps.map((step, i) => (
                 <div key={i} className="flex gap-6 group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-blue-400 group-hover:border-blue-400/30 transition-all shadow-xl">
                       <i className={`ph ${step.icon} text-2xl`} />
                    </div>
                    <div className="space-y-1">
                       <h3 className="text-[14px] font-bold text-white/90">{step.title}</h3>
                       <p className="text-[12px] leading-relaxed text-white/40 group-hover:text-white/60 transition-colors">
                          {step.description}
                       </p>
                    </div>
                 </div>
               ))}
            </div>

            <div className="p-8 bg-black/40 border-t border-white/5 text-center">
                <button 
                  onClick={onClose}
                  className="px-8 py-3 bg-white text-black rounded-xl font-bold text-[12px] uppercase tracking-widest hover:bg-white/90 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] active:scale-95"
                >
                   Got it, let's build
                </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
