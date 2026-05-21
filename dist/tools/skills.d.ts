import type { NaukriCookieJar } from "../auth.js";
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
export declare function addTechSkill(cookies: NaukriCookieJar, profileId: string, skill: {
    name: string;
    years: number;
    months: number;
    skillId?: number;
}): Promise<string>;
export declare function updateKeySkills(cookies: NaukriCookieJar, profileId: string, skills: string[]): Promise<string>;
