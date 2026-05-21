import type { NaukriCookieJar } from "../auth.js";
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
export declare function updateBasicDetails(cookies: NaukriCookieJar, profileId: string, input: BasicDetailsInput): Promise<string>;
