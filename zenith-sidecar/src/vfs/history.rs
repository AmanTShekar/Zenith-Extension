use std::collections::VecDeque;
use uuid::Uuid;
use crate::vfs::engine::FilePatch;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UndoFrame {
    pub id: u64,
    pub transaction_id: Uuid,
    pub description: String,
    pub forward_patches: Vec<FilePatch>,
    pub reverse_patches: Vec<FilePatch>,
}

#[derive(Clone)]
pub struct HistoryManager {
    pub undo_stack: VecDeque<UndoFrame>,
    pub redo_stack: Vec<UndoFrame>,
    pub max_frames: usize,
}

impl HistoryManager {
    pub fn new(max_frames: usize) -> Self {
        Self {
            undo_stack: VecDeque::with_capacity(max_frames),
            redo_stack: Vec::new(),
            max_frames,
        }
    }

    pub fn push(&mut self, frame: UndoFrame) {
        self.redo_stack.clear();
        self.undo_stack.push_back(frame);
        if self.undo_stack.len() > self.max_frames {
            self.undo_stack.pop_front();
        }
    }

    pub fn pop_undo(&mut self) -> Option<UndoFrame> {
        self.undo_stack.pop_back()
    }

    pub fn pop_redo(&mut self) -> Option<UndoFrame> {
        self.redo_stack.pop()
    }

    pub fn push_redo(&mut self, frame: UndoFrame) {
        self.redo_stack.push(frame);
    }

    pub fn push_undo_back(&mut self, frame: UndoFrame) {
        self.undo_stack.push_back(frame);
    }
}
