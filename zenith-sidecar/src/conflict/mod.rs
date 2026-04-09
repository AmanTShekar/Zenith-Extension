//! Conflict resolution module.

pub mod lww;
pub mod ot_engine;
pub mod soft_lock;

pub use lww::{ConflictResolver, ElementState, LWWRegister, PropertyValue, WriteResult};
