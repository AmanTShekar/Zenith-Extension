"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganizationId = getOrganizationId;
exports.getOrganizationById = getOrganizationById;
exports.getOrganizationByName = getOrganizationByName;
exports.createOrganization = createOrganization;
exports.updateOrganization = updateOrganization;
exports.updateOrganizationUser = updateOrganizationUser;
exports.deleteOrganization = deleteOrganization;
exports.getUserOnOrganization = getUserOnOrganization;
exports.updateUserOnOrganization = updateUserOnOrganization;
exports.getCurrentUserOrganizations = getCurrentUserOrganizations;
exports.getOrganizationUsers = getOrganizationUsers;
exports.removeOrganizationUser = removeOrganizationUser;
exports.searchOrganizations = searchOrganizations;
async function getOrganizationId(params, supabase) {
    try {
        const { error, data } = await supabase.rpc('get_organization_id', params);
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
async function getOrganizationById(params, supabase) {
    try {
        const { error, data } = await supabase.rpc('get_organization_by_id', params);
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
async function getOrganizationByName(params, supabase) {
    try {
        const { error, data } = await supabase.rpc('get_organization_by_name', params);
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
async function createOrganization(params, supabase) {
    try {
        const { error, data } = await supabase.rpc('create_organization', params);
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
async function updateOrganization(params, supabase) {
    try {
        const { error, data } = await supabase.rpc('update_organization', params);
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
async function updateOrganizationUser(params, supabase) {
    try {
        const { error, data } = await supabase.rpc('update_user_on_organization', params);
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
async function deleteOrganization(params, supabase) {
    try {
        const { error, data } = await supabase.rpc('delete_organization', params);
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
async function getUserOnOrganization(params, supabase) {
    try {
        const { error, data } = await supabase.rpc('get_user_on_organization', params);
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
async function updateUserOnOrganization(params, supabase) {
    try {
        const { error, data } = await supabase.rpc('update_user_on_organization', params);
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
async function getCurrentUserOrganizations(supabase) {
    try {
        const { error, data } = await supabase.rpc('get_current_user_organizations');
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
async function getOrganizationUsers(params, supabase) {
    try {
        const { error, data } = await supabase.rpc('get_organization_users', params);
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
async function removeOrganizationUser(params, supabase) {
    try {
        const { error, data } = await supabase.rpc('remove_organization_user', params);
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
async function searchOrganizations(params, supabase) {
    try {
        const { error, data } = await supabase.rpc('search_organizations', params);
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