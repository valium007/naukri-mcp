/**
 * Naukri API client.
 *
 * Reverse-engineered from Naukri.com's Next.js JS bundles:
 *   - EditProfileWrapper.1bb3c4af0618dff3.js
 *   - RenderEmploymentForm.bc510f4b07fb998a.js
 *   - EditProfileSummary.36ca65c4011a1ff7.js
 *   - EditTechSkills.8f2273b4b2ece9f0.js
 *   - EditBasicDetails.7c849ce830e0cbbf.js
 *   - EditPreferences.beab46c63620a5cb.js
 *
 * One mutation endpoint handles ALL profile updates:
 *   POST https://www.naukri.com/cloudgateway-aurus/aurus-jobseeker-profile-wrapper/
 *        v0/jobseeker/users/self/update/fullprofiles
 *   Body: { data: { profileId, ... }, fieldMasks: ["*"] }
 */
export declare const ENDPOINTS: {
    /** Main mutation endpoint — all profile updates go here */
    readonly fullprofiles: "https://www.naukri.com/cloudgateway-aurus/aurus-jobseeker-profile-wrapper/v0/jobseeker/users/self/update/fullprofiles";
    /** Delete employment by employmentId */
    readonly deleteEmployment: "https://www.naukri.com/cloudgateway-aurus/aurus-jobseeker-profile-wrapper/v0/jobseeker/users/self/profile/deleteEmployment";
    /** AI-generated profile summary suggestions */
    readonly aiSummary: "https://www.naukri.com/cloudgateway-aurus/aurus-ai-services/v0/naukri/user/self/suggested/summary";
    /** Resume upload (multipart form-data) */
    readonly uploadResume: "https://www.naukri.com/cloudgateway-aurus/aurus-profile-upload-service/v0/profile/uploadResume";
    /** Profile page URL (for scraping profileId and full data) */
    readonly profilePage: "https://www.naukri.com/mnjuser/profile";
};
export interface NaukriCookieJar {
    [key: string]: string;
}
export declare function fullprofiles(cookies: NaukriCookieJar, data: Record<string, unknown>, fieldMasks?: string[]): Promise<{
    status: number;
    data: unknown;
}>;
export declare function deleteEmployment(cookies: NaukriCookieJar, profileId: string, employmentId: string): Promise<{
    status: number;
    data: unknown;
}>;
export declare function uploadResume(cookies: NaukriCookieJar, formData: FormData): Promise<{
    status: number;
    data: unknown;
}>;
export declare function fetchAiSummary(cookies: NaukriCookieJar): Promise<{
    status: number;
    data: unknown;
}>;
/**
 * Scrape the Naukri profile page to extract profileId and all RSC payload data.
 * This reads the self.__next_f.push() data from the page HTML.
 */
export declare function scrapeProfilePage(cookies: NaukriCookieJar): Promise<{
    profileId: string | null;
    rawRsc: string;
}>;
