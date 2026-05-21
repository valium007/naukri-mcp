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
export function parseCookieString(raw: string): NaukriCookieJar {
  const jar: NaukriCookieJar = {};
  for (const line of raw.split(/[\n;]/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Netscape cookie file format: domain flag path secure expiration name value
    const netscapeFields = trimmed.split("\t");
    if (netscapeFields.length >= 7) {
      const name = netscapeFields[5];
      const value = netscapeFields[6];
      if (name) jar[name] = value;
      continue;
    }

    // Simple name=value format
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      jar[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
    }
  }
  return jar;
}

/**
 * Essential Naukri cookies needed for API auth.
 * The caller should provide at minimum the `nauk_at` cookie.
 */
export function validateCookies(jar: NaukriCookieJar): string | null {
  if (!jar["nauk_at"]) return "Missing required cookie: nauk_at";
  return null;
}
