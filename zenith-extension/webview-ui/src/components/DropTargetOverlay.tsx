import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelectionStore } from '../stores/useSelectionStore';

export const DropTargetOverlay: React.FC = () => {
  const dropTargetId = useSelectionStore(state => state.dropTargetId);
  const dropTargetRect = useSelectionStore(state => state.dropTargetRect);
  const isDragging = useSelectionStore(state => state.isDragging);

  return (
    <AnimatePresence>
      {isDragging && dropTargetId && dropTargetRect && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: dropTargetRect.x,
            y: dropTargetRect.y,
            width: dropTargetRect.width,
            height: dropTargetRect.height
          }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute pointer-events-none z-[40]"
          style={{
            border: '2px dashed #00F0FF',
            borderRadius: '4px',
            boxShadow: '0 0 15px rgba(0, 240, 255, 0.2), inset 0 0 10px rgba(0, 240, 255, 0.1)',
            backgroundColor: 'rgba(0, 240, 255, 0.03)'
          }}
        >
          <div className="absolute top-[-22px] left-0 px-2 py-0.5 bg-[#00F0FF] text-black text-[9px] font-black uppercase tracking-widest rounded-t-sm animate-pulse">
            Drop Target
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
