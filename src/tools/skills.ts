import type { NaukriCookieJar } from "../auth.js";
import { fullprofiles } from "../naukri-client.js";

/**
 * Add or update a tech skill (IT skill).
 *
 * From EditTechSkills JS:
 * {
 *   fieldMasks: [],
 *   data: {
 *     itskills: [{ sid, entitySkillId, entitySkill, skill, experienceTime: {year,month} }],
 *     profileId
 *   }
 * }
 */
export async function addTechSkill(
  cookies: NaukriCookieJar,
  profileId: string,
  skill: { name: string; years: number; months: number; skillId?: number }
): Promise<string> {
  const data = {
    profileId,
    itskills: [
      {
        sid: skill.skillId ?? -1,
        entitySkillId: null,
        entitySkill: skill.name,
        skill: skill.name,
        experienceTime: { year: skill.years, month: skill.months },
      },
    ],
  };
  const result = await fullprofiles(cookies, data);
  if (result.status === 200) {
    return `Added tech skill: ${skill.name} (${skill.years}y ${skill.months}m)`;
  }
  return `Error (${result.status}): ${JSON.stringify(result.data)}`;
}

export async function updateKeySkills(
  cookies: NaukriCookieJar,
  profileId: string,
  skills: string[]
): Promise<string> {
  // Key skills are stored as comma-separated string in the profile
  const data = {
    profileId,
    profile: { keySkills: skills.join(",") },
  };
  const result = await fullprofiles(cookies, data);
  if (result.status === 200) {
    return `Updated key skills: ${skills.join(", ")}`;
  }
  return `Error (${result.status}): ${JSON.stringify(result.data)}`;
}
