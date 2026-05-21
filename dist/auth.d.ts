/**
 * Naukri authentication helpers.
 *
 * Naukri uses standard HTTP cookies for session auth.
 * You can obtain cookies by:
 *   1. Logging into naukri.com in a browser
 *   2. Using the "naukri_get_cookies_from_browser" tool with Playwright
 *   3. Manually pasting cookies from browser DevTools
 */
export interface NaukriCookieJar {
    [key: string]: string;
}
/**
 * Parse a cookie header string into a cookie jar object.
 * Accepts either Netscape format or simple "name=value" pairs.
 */
export declare function parseCookieString(raw: string): NaukriCookieJar;
/**
 * Essential Naukri cookies needed for API auth.
 * The caller should provide at minimum the `nauk_at` cookie.
 */
export declare function validateCookies(jar: NaukriCookieJar): string | null;
