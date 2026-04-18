"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSettingsRouter = void 0;
const db_1 = require("@onlook/db");
const drizzle_orm_1 = require("drizzle-orm");
const trpc_1 = require("../../trpc");
exports.userSettingsRouter = (0, trpc_1.createTRPCRouter)({
    get: trpc_1.protectedProcedure.query(async ({ ctx }) => {
        const user = ctx.user;
        const settings = await ctx.db.query.userSettings.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.userSettings.userId, user.id),
        });
        return (0, db_1.fromDbUserSettings)(settings ?? (0, db_1.createDefaultUserSettings)(user.id));
    }),
    upsert: trpc_1.protectedProcedure.input(db_1.userSettingsUpdateSchema).mutation(async ({ ctx, input }) => {
        const user = ctx.user;
        const existingSettings = await ctx.db.query.userSettings.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.userSettings.userId, user.id),
        });
        if (!existingSettings) {
            const newSettings = { ...(0, db_1.createDefaultUserSettings)(user.id), ...input };
            const [insertedSettings] = await ctx.db.insert(db_1.userSettings).values(newSettings).returning();
            return (0, db_1.fromDbUserSettings)(insertedSettings ?? newSettings);
        }
        const [updatedSettings] = await ctx.db.update(db_1.userSettings).set(input).where((0, drizzle_orm_1.eq)(db_1.userSettings.userId, user.id)).returning();
        if (!updatedSettings) {
            throw new Error('Failed to update user settings');
        }
        return (0, db_1.fromDbUserSettings)(updatedSettings);
    }),
});
//# sourceMappingURL=user-settings.js.map