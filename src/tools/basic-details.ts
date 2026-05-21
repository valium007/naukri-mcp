import type { NaukriCookieJar } from "../auth.js";
import { fullprofiles } from "../naukri-client.js";

export interface BasicDetailsInput {
  /** Total experience in years */
  experienceYears?: number;
  experienceMonths?: number;
  /** City name or ID */
  city?: string;
  /** Is the city outside India? */
  outsideIndia?: boolean;
  country?: string;
  /** Current annual salary (numeric string) */
  absoluteCtc?: string;
  currency?: string;
  /** Salary breakdown ID */
  salaryDDId?: number;
  fixedCtc?: string;
  variableCtc?: string;
  /** Notice period days (1, 15, 30, 60, 90) */
  noticePeriod?: number;
  noticeEndDate?: string;
  /** Entity IDs for department/industry/role */
  entityDepartment?: string;
  entityIndustry?: string;
  entityRoleCategory?: string;
  entityRole?: string;
}

export async function updateBasicDetails(
  cookies: NaukriCookieJar,
  profileId: string,
  input: BasicDetailsInput
): Promise<string> {
  const profile: Record<string, unknown> = {};
  const profileAdditional: Record<string, unknown> = { profileId };
  let noticePeriod: Record<string, unknown> | undefined;

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
    if (input.fixedCtc) profileAdditional.fixedCtc = input.fixedCtc;
    if (input.variableCtc) profileAdditional.variableCtc = input.variableCtc;
  }

  const data: Record<string, unknown> = { profileId };

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
