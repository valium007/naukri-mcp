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

const BASE = "https://www.naukri.com";

export const ENDPOINTS = {
  /** Main mutation endpoint — all profile updates go here */
  fullprofiles: `${BASE}/cloudgateway-aurus/aurus-jobseeker-profile-wrapper/v0/jobseeker/users/self/update/fullprofiles`,

  /** Delete employment by employmentId */
  deleteEmployment: `${BASE}/cloudgateway-aurus/aurus-jobseeker-profile-wrapper/v0/jobseeker/users/self/profile/deleteEmployment`,

  /** AI-generated profile summary suggestions */
  aiSummary: `${BASE}/cloudgateway-aurus/aurus-ai-services/v0/naukri/user/self/suggested/summary`,

  /** Resume upload (multipart form-data) */
  uploadResume: `${BASE}/cloudgateway-aurus/aurus-profile-upload-service/v0/profile/uploadResume`,

  /** Profile page URL (for scraping profileId and full data) */
  profilePage: `${BASE}/mnjuser/profile`,
} as const;

export interface NaukriCookieJar {
  [key: string]: string;
}

function cookieString(jar: NaukriCookieJar): string {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

async function request(
  method: string,
  url: string,
  cookies: NaukriCookieJar,
  body?: unknown,
  extraHeaders?: Record<string, string>
): Promise<{ status: number; data: unknown }> {
  const headers: Record<string, string> = {
    Cookie: cookieString(cookies),
    appid: "109",
    systemid: "109",
    "Content-Type": "application/json",
    Accept: "application/json",
    ...extraHeaders,
  };

  const init: RequestInit = { method, headers };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const res = await fetch(url, init);
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

export async function fullprofiles(
  cookies: NaukriCookieJar,
  data: Record<string, unknown>,
  fieldMasks: string[] = ["*"]
): Promise<{ status: number; data: unknown }> {
  return request("POST", ENDPOINTS.fullprofiles, cookies, {
    data,
    fieldMasks,
  });
}

export async function deleteEmployment(
  cookies: NaukriCookieJar,
  profileId: string,
  employmentId: string
): Promise<{ status: number; data: unknown }> {
  return request("POST", ENDPOINTS.deleteEmployment, cookies, {
    profileId,
    employmentId,
    fieldMasks: ["*"],
  });
}

export async function uploadResume(
  cookies: NaukriCookieJar,
  formData: FormData
): Promise<{ status: number; data: unknown }> {
  const headers: Record<string, string> = {
    Cookie: cookieString(cookies),
    appid: "109",
    systemid: "109",
    Accept: "application/json",
  };
  // Let fetch set multipart boundary
  delete headers["Content-Type"];

  const res = await fetch(ENDPOINTS.uploadResume, {
    method: "POST",
    headers,
    body: formData,
  });
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

export async function fetchAiSummary(
  cookies: NaukriCookieJar
): Promise<{ status: number; data: unknown }> {
  return request("GET", ENDPOINTS.aiSummary, cookies);
}

/**
 * Scrape the Naukri profile page to extract profileId and all RSC payload data.
 * This reads the self.__next_f.push() data from the page HTML.
 */
export async function scrapeProfilePage(
  cookies: NaukriCookieJar
): Promise<{ profileId: string | null; rawRsc: string }> {
  const htmlRes = await fetch(ENDPOINTS.profilePage, {
    headers: { Cookie: cookieString(cookies) },
  });
  const html = await htmlRes.text();

  // Extract all self.__next_f.push([1,...]) chunks
  const chunks: string[] = [];
  const regex = /self\.__next_f\.push\(\[1,(.+?)\]\)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1]);
      chunks.push(typeof parsed === "string" ? parsed : JSON.stringify(parsed));
    } catch {
      // skip unparseable chunks
    }
  }
  const rawRsc = chunks.join("");

  // Extract profileId
  const idMatch = rawRsc.match(/"profileId":"([a-f0-9]+)"/);
  const profileId = idMatch ? idMatch[1] : null;

  return { profileId, rawRsc };
}
