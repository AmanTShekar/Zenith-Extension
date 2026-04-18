"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganizationQuery = getOrganizationQuery;
exports.getUserOrganizationsQuery = getUserOrganizationsQuery;
exports.getOrganizationUsersQuery = getOrganizationUsersQuery;
exports.getOrganizationUserQuery = getOrganizationUserQuery;
async function getOrganizationQuery({ organization_id }, supabase, signal) {
    if (!organization_id) {
        return;
    }
    let query = supabase
        .from('organizations')
        .select(`
      *,
      users (*, organization_role:users_on_organization(membership_role)),
      projects (*)
      `)
        .eq('id', organization_id);
    if (signal) {
        query = query.abortSignal(signal);
    }
    try {
        const { data, error } = await query.maybeSingle();
        if (error) {
            throw error;
        }
        if (data) {
            return data;
        }
    }
    catch (error) {
        console.error(error);
    }
}
async function getUserOrganizationsQuery({ user_id }, supabase, signal) {
    if (!user_id) {
        throw new Error('user_id is required');
    }
    let query = supabase.from('users_on_organization').select('*').eq('user_id', user_id);
    if (signal) {
        query = query.abortSignal(signal);
    }
    try {
        const { data, error } = await query.order('created_at', {
            ascending: false,
        });
        if (error) {
            throw error;
        }
        return data ?? [];
    }
    catch (error) {
        console.error(error);
    }
}
async function getOrganizationUsersQuery({ organization_id }, supabase, signal) {
    if (!organization_id) {
        throw new Error('organization_id is required');
    }
    let query = supabase
        .from('users_on_organization')
        .select('*')
        .eq('organization_id', organization_id);
    if (signal) {
        query = query.abortSignal(signal);
    }
    try {
        const { data, error } = await query.order('created_at', {
            ascending: false,
        });
        if (error) {
            throw error;
        }
        return data ?? [];
    }
    catch (error) {
        console.error(error);
    }
}
async function getOrganizationUserQuery({ organization_id, user_id }, supabase, signal) {
    if (!organization_id) {
        throw new Error('organization_id is required');
    }
    if (!user_id) {
        throw new Error('user_id is required');
    }
    let query = supabase
        .from('users_on_organization')
        .select('*, user:users!user_id(*), organization:organizations!organization_id(*)')
        .eq('user_id', user_id)
        .eq('organization_id', organization_id);
    if (signal) {
        query = query.abortSignal(signal);
    }
    try {
        const { data, error } = await query.maybeSingle();
        if (error) {
            throw error;
        }
        if (data) {
            return data;
        }
    }
    catch (error) {
        console.error(error);
    }
}
//# sourceMappingURL=index.js.map