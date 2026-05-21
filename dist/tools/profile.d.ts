import type { NaukriCookieJar } from "../auth.js";
export declare function updateSummary(cookies: NaukriCookieJar, profileId: string, summary: string): Promise<string>;
export declare function getAiSuggestions(cookies: NaukriCookieJar): Promise<string>;
export declare function getFullProfile(cookies: NaukriCookieJar): Promise<string>;
