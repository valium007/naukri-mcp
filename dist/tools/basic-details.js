import { fullprofiles } from "../naukri-client.js";
export async function updateBasicDetails(cookies, profileId, input) {
    const profile = {};
    const profileAdditional = { profileId };
    let noticePeriod;
    if (input.experienceYears !== undefined) {
        profile.experience = {
            year: input.experienceYears,
            month: input.experienceMonths ?? 0,
        };
    }
    if (input.city) {
        profile.city = { id: input.city, value: input.city };
    }
    if (input.outsideIndia && input.country) {
        profile.country = { id: input.country, name: input.country };
    }
    if (input.absoluteCtc) {
        profile.absoluteCtc = input.absoluteCtc;
        profile.currency = input.currency ?? "INR";
    }
    if (input.noticePeriod !== undefined) {
        profile.noticePeriod = { id: input.noticePeriod, value: String(input.noticePeriod) };
    }
    if (input.noticeEndDate) {
        noticePeriod = { noticeEndDate: input.noticeEndDate };
    }
    if (input.entityDepartment) {
        profile.entityDepartment = { id: input.entityDepartment, value: input.entityDepartment };
    }
    if (input.entityIndustry) {
        profile.entityIndustryTypeId = { id: input.entityIndustry, value: input.entityIndustry };
    }
    if (input.entityRoleCategory) {
        profile.entityRoleCategory = { id: input.entityRoleCategory, value: input.entityRoleCategory };
    }
    if (input.entityRole) {
        profile.entityRole = { id: input.entityRole, value: input.entityRole };
    }
    if (input.salaryDDId) {
        profileAdditional.salaryDDId = input.salaryDDId;
        if (input.fixedCtc)
            profileAdditional.fixedCtc = input.fixedCtc;
        if (input.variableCtc)
            profileAdditional.variableCtc = input.variableCtc;
    }
    const data = { profileId };
    if (Object.keys(profile).length > 0) {
        data.profile = profile;
    }
    if (Object.keys(profileAdditional).length > 1) {
        data.profileAdditional = profileAdditional;
    }
    if (noticePeriod) {
        data.noticePeriod = [noticePeriod];
    }
    const result = await fullprofiles(cookies, data);
    if (result.status === 200) {
        return "Basic details updated";
    }
    return `Error (${result.status}): ${JSON.stringify(result.data)}`;
}
