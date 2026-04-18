"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateToBranching = migrateToBranching;
const dotenv_1 = require("dotenv");
const drizzle_orm_1 = require("drizzle-orm");
const uuid_1 = require("uuid");
const client_1 = require("../client");
const branch_1 = require("../defaults/branch");
const schema_1 = require("../schema");
// Load .env file
(0, dotenv_1.config)({ path: '../../.env' });
// Helper function to chunk array into smaller batches
function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}
// Utility function to handle database insert with retry logic
async function insertWithConstraintRetry(operation, entityType, batchNumber) {
    try {
        await operation();
    }
    catch (error) {
        if (error?.code === '23505' || error?.message?.includes('duplicate') || error?.message?.includes('unique')) {
            const batchInfo = batchNumber ? ` batch ${batchNumber}` : '';
            console.log(`    └─ ${entityType}${batchInfo} already exist (safe to continue)`);
        }
        else {
            throw error;
        }
    }
}
// Check current migration status
async function checkMigrationStatus() {
    const totalProjects = await client_1.db.select({ count: schema_1.projects.id }).from(schema_1.projects);
    const totalBranches = await client_1.db.select({ count: schema_1.branches.id }).from(schema_1.branches);
    const framesWithoutBranches = await client_1.db
        .select({ count: schema_1.frames.id })
        .from(schema_1.frames)
        .where((0, drizzle_orm_1.isNull)(schema_1.frames.branchId));
    const isCompleted = totalBranches.length > 0 &&
        totalBranches.length === totalProjects.length &&
        framesWithoutBranches.length === 0;
    const isPartial = totalBranches.length > 0 && !isCompleted;
    return {
        totalProjects: totalProjects.length,
        totalBranches: totalBranches.length,
        framesWithoutBranches: framesWithoutBranches.length,
        isCompleted,
        isPartial
    };
}
// Get projects that need migration
async function getProjectsToMigrate() {
    return await client_1.db
        .select()
        .from(schema_1.projects)
        .leftJoin(schema_1.branches, (0, drizzle_orm_1.eq)(schema_1.projects.id, schema_1.branches.projectId))
        .where((0, drizzle_orm_1.isNull)(schema_1.branches.id));
}
// Create branch objects for projects
function createBranchesForProjects(projectsToMigrate) {
    const newBranches = [];
    for (const { projects: project } of projectsToMigrate) {
        console.log(`🔀 Creating default branch for project: ${project.name} (${project.id})`);
        const legacyProject = project;
        const sandboxId = legacyProject.sandboxId || (0, uuid_1.v4)();
        const defaultBranch = (0, branch_1.createDefaultBranch)({
            projectId: project.id,
            sandboxId,
        });
        newBranches.push(defaultBranch);
    }
    return newBranches;
}
// Insert branches in batches
async function insertBranchesInBatches(branches) {
    if (branches.length === 0)
        return;
    console.log(`📥 Inserting ${branches.length} default branches...`);
    const branchBatchSize = 500;
    const branchChunks = chunkArray(branches, branchBatchSize);
    for (let i = 0; i < branchChunks.length; i++) {
        const chunk = branchChunks[i];
        if (!chunk)
            continue;
        console.log(`  └─ Inserting batch ${i + 1}/${branchChunks.length} (${chunk.length} branches)`);
        await insertWithConstraintRetry(async () => {
            await client_1.db.transaction(async (tx) => {
                await tx.insert(schema_1.branches).values(chunk);
            });
        }, 'branches', i + 1);
    }
}
// Process batch of frame updates in parallel
async function processFrameUpdatesInParallel(branchUpdates, batchSize = 1000) {
    const updatePromises = branchUpdates.map(async ({ branchId, projectId }) => {
        // Get frame IDs first, then update in bulk - still more efficient than individual queries
        const projectFrames = await client_1.db
            .select({ id: schema_1.frames.id })
            .from(schema_1.frames)
            .innerJoin(schema_1.canvases, (0, drizzle_orm_1.eq)(schema_1.frames.canvasId, schema_1.canvases.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.canvases.projectId, projectId), (0, drizzle_orm_1.isNull)(schema_1.frames.branchId)));
        if (projectFrames.length === 0) {
            return { branchId, projectId, rowsUpdated: 0 };
        }
        const frameIds = projectFrames.map(f => f.id);
        // Single bulk update - much faster than individual queries
        await client_1.db.transaction(async (tx) => {
            await tx
                .update(schema_1.frames)
                .set({ branchId })
                .where((0, drizzle_orm_1.inArray)(schema_1.frames.id, frameIds));
        });
        return { branchId, projectId, rowsUpdated: frameIds.length };
    });
    // Process all branches in parallel for maximum speed
    const results = await Promise.all(updatePromises);
    // Log results
    for (const { branchId, projectId, rowsUpdated } of results) {
        if (rowsUpdated > 0) {
            console.log(`  └─ Updated ${rowsUpdated} frames for project ${projectId}`);
        }
        else {
            console.log(`  └─ No frames need updating for project ${projectId} (already have branchId)`);
        }
    }
}
// Optimized bulk frame updates using single JOIN query per branch
async function updateFramesForBranches(branches) {
    if (branches.length === 0)
        return;
    console.log('🔗 Updating frames to reference default branches...');
    // Prepare batch updates - stateless operation
    const branchUpdates = branches.map(branch => ({
        branchId: branch.id,
        projectId: branch.projectId
    }));
    // Process in parallel batches for optimal performance
    const concurrencyLimit = 5; // Limit concurrent transactions
    const batches = chunkArray(branchUpdates, concurrencyLimit);
    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        if (!batch || batch.length === 0)
            continue;
        console.log(`  Processing batch ${i + 1}/${batches.length} (${batch.length} projects)`);
        await processFrameUpdatesInParallel(batch);
    }
}
// Handle orphaned frames with optimized batch processing
async function fixOrphanedFrames() {
    console.log('🧹 Checking for orphaned frames...');
    const orphanedFrames = await client_1.db
        .select({
        frameId: schema_1.frames.id,
        canvasId: schema_1.frames.canvasId,
        projectId: schema_1.canvases.projectId
    })
        .from(schema_1.frames)
        .innerJoin(schema_1.canvases, (0, drizzle_orm_1.eq)(schema_1.frames.canvasId, schema_1.canvases.id))
        .where((0, drizzle_orm_1.isNull)(schema_1.frames.branchId));
    if (orphanedFrames.length === 0) {
        console.log('✅ No orphaned frames found.');
        return;
    }
    console.log(`Found ${orphanedFrames.length} orphaned frames, fixing...`);
    // Group orphaned frames by project
    const framesByProject = new Map();
    for (const orphan of orphanedFrames) {
        if (!framesByProject.has(orphan.projectId)) {
            framesByProject.set(orphan.projectId, []);
        }
        framesByProject.get(orphan.projectId).push(orphan);
    }
    // Process projects in parallel batches for optimal performance
    const projectIds = Array.from(framesByProject.keys());
    const concurrencyLimit = 100; // Process up to 100 projects simultaneously
    const batches = chunkArray(projectIds, concurrencyLimit);
    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        if (!batch || batch.length === 0)
            continue;
        console.log(`  Processing batch ${i + 1}/${batches.length} (${batch.length} projects)`);
        // Process all projects in the batch in parallel
        await Promise.all(batch.map(projectId => fixOrphanedFramesForProject(projectId, framesByProject.get(projectId).length)));
    }
}
// Fix orphaned frames for a specific project using bulk operations
async function fixOrphanedFramesForProject(projectId, orphanCount) {
    const defaultBranch = await client_1.db
        .select({ id: schema_1.branches.id })
        .from(schema_1.branches)
        .where((0, drizzle_orm_1.eq)(schema_1.branches.projectId, projectId))
        .limit(1);
    let branchId;
    if (defaultBranch.length > 0 && !!defaultBranch[0]?.id) {
        branchId = defaultBranch[0].id;
    }
    else {
        branchId = await createEmergencyBranch(projectId);
    }
    // Direct bulk update without fetching frame IDs first - more efficient
    const result = await client_1.db.transaction(async (tx) => {
        return await tx
            .update(schema_1.frames)
            .set({ branchId })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(schema_1.frames.canvasId, tx.select({ id: schema_1.canvases.id })
            .from(schema_1.canvases)
            .where((0, drizzle_orm_1.eq)(schema_1.canvases.projectId, projectId))), (0, drizzle_orm_1.isNull)(schema_1.frames.branchId)));
    });
    console.log(`  └─ Fixed ${orphanCount} orphaned frames for project ${projectId}`);
}
// Create emergency branch with proper error handling
async function createEmergencyBranch(projectId) {
    console.log(`  └─ Creating emergency branch for orphaned frames in project ${projectId}`);
    // Double-check in case a branch was created concurrently
    const recheckBranch = await client_1.db
        .select({ id: schema_1.branches.id })
        .from(schema_1.branches)
        .where((0, drizzle_orm_1.eq)(schema_1.branches.projectId, projectId))
        .limit(1);
    if (recheckBranch.length > 0 && !!recheckBranch[0]?.id) {
        console.log(`    └─ Branch was created concurrently, using existing one`);
        return recheckBranch[0].id;
    }
    const emergencyBranch = (0, branch_1.createDefaultBranch)({
        projectId: projectId,
        sandboxId: (0, uuid_1.v4)(),
    });
    try {
        await client_1.db.transaction(async (tx) => {
            await tx.insert(schema_1.branches).values(emergencyBranch);
        });
        return emergencyBranch.id;
    }
    catch (error) {
        if (error?.code === '23505' || error?.message?.includes('duplicate') || error?.message?.includes('unique')) {
            console.log(`    └─ Emergency branch already exists, finding it...`);
            const existingBranch = await client_1.db
                .select({ id: schema_1.branches.id })
                .from(schema_1.branches)
                .where((0, drizzle_orm_1.eq)(schema_1.branches.projectId, projectId))
                .limit(1);
            if (existingBranch.length > 0 && !!existingBranch[0]?.id) {
                return existingBranch[0].id;
            }
            else {
                throw new Error(`Failed to create or find branch for project ${projectId}`);
            }
        }
        else {
            throw error;
        }
    }
}
// Verify migration completeness
async function verifyMigrationCompleteness(newBranchesCount) {
    console.log('✅ Verifying migration completeness...');
    const finalFramesWithoutBranches = await client_1.db
        .select({ count: schema_1.frames.id })
        .from(schema_1.frames)
        .where((0, drizzle_orm_1.isNull)(schema_1.frames.branchId));
    const finalTotalBranches = await client_1.db
        .select({ count: schema_1.branches.id })
        .from(schema_1.branches);
    const finalTotalProjects = await client_1.db
        .select({ count: schema_1.projects.id })
        .from(schema_1.projects);
    console.log(`\n📊 Final Migration Summary:`);
    console.log(`  • Total projects: ${finalTotalProjects.length}`);
    console.log(`  • Total branches: ${finalTotalBranches.length}`);
    console.log(`  • Frames without branch reference: ${finalFramesWithoutBranches.length}`);
    console.log(`  • New branches created this run: ${newBranchesCount}`);
    if (finalFramesWithoutBranches.length > 0) {
        throw new Error(`Migration incomplete: ${finalFramesWithoutBranches.length} frames still lack branch references`);
    }
}
async function migrateToBranching() {
    console.log('🔄 Starting migration to branching structure...');
    try {
        // Step 1: Check migration status
        const status = await checkMigrationStatus();
        console.log('📊 Current migration state:');
        console.log(`  • Total projects: ${status.totalProjects}`);
        console.log(`  • Total branches: ${status.totalBranches}`);
        console.log(`  • Frames without branch reference: ${status.framesWithoutBranches}`);
        if (status.isCompleted) {
            console.log('✅ Migration already completed - nothing to do!');
            return;
        }
        if (status.isPartial) {
            console.log('🔄 Detected partial migration - resuming from where we left off...');
        }
        else {
            console.log('🚀 Starting fresh migration...');
        }
        // Step 2: Get projects to migrate
        console.log('📋 Fetching projects without default branches...');
        const projectsToMigrate = await getProjectsToMigrate();
        if (projectsToMigrate.length === 0) {
            console.log('✅ All projects already have branches!');
        }
        else {
            console.log(`Found ${projectsToMigrate.length} projects to migrate`);
        }
        // Step 3: Create and insert branches
        const newBranches = createBranchesForProjects(projectsToMigrate);
        await insertBranchesInBatches(newBranches);
        // Step 4: Update frames
        await updateFramesForBranches(newBranches);
        // Step 5: Fix orphaned frames
        await fixOrphanedFrames();
        // Step 6: Verify completeness
        await verifyMigrationCompleteness(newBranches.length);
        console.log('\n✅ Migration to branching structure completed successfully!');
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}
// CLI runner
if (require.main === module) {
    (async () => {
        try {
            if (!process.env.SUPABASE_DATABASE_URL) {
                throw new Error('SUPABASE_DATABASE_URL environment variable is required');
            }
            console.log('🚀 Starting branching migration...');
            await migrateToBranching();
            console.log('🎉 Migration completed successfully');
            process.exit(0);
        }
        catch (error) {
            console.error('💥 Migration failed:', error);
            process.exit(1);
        }
    })();
}
//# sourceMappingURL=migrate-to-branching.js.map