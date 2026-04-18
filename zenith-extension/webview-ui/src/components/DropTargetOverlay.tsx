import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelectionStore } from '../stores/useSelectionStore';

export const DropTargetOverlay: React.FC = () => {
  const dragTargetId = useSelectionStore(state => state.dragTargetId);
  const dragTargetRect = useSelectionStore(state => state.dragTargetRect);
  const isDragging = useSelectionStore(state => state.isDragging);

  return (
    <AnimatePresence>
      {isDragging && dragTargetId && dragTargetRect && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: dragTargetRect.x,
            y: dragTargetRect.y,
            width: dragTargetRect.width,
            height: dragTargetRect.height
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
