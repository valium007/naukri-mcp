import type { NaukriCookieJar } from "../auth.js";
export interface EmploymentInput {
    employmentId?: string;
    experienceType: string;
    designation: string;
    organization: string;
    organizationId?: string;
    employmentType?: "current" | "previous";
    startDate: {
        month: string;
        year: string;
    };
    endDate?: {
        month: string;
        year: string;
    };
    jobDescription?: string;
    keySkills?: string[];
    location?: string;
    noticePeriod?: number;
    noticeEndDate?: string;
    absoluteCtc?: string;
    currency?: string;
    salaryBreakdown?: {
        id: number;
        fixedCtc?: string;
        variableCtc?: string;
    };
    department?: string;
    roleCategory?: string;
    role?: string;
    salary?: string;
    projectDetails?: string;
    projectURL?: string;
}
export declare function addOrUpdateEmployment(cookies: NaukriCookieJar, profileId: string, input: EmploymentInput): Promise<string>;
export declare function removeEmployment(cookies: NaukriCookieJar, profileId: string, employmentId: string): Promise<string>;
export declare function listEmployments(cookies: NaukriCookieJar): Promise<string>;
