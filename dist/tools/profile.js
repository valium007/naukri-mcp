import { fullprofiles, fetchAiSummary, scrapeProfilePage } from "../naukri-client.js";
export async function updateSummary(cookies, profileId, summary) {
    const data = {
        profileId,
        profile: { summary: summary.trim() },
    };
    const result = await fullprofiles(cookies, data);
    if (result.status === 200) {
        return "Profile summary updated";
    }
    return `Error (${result.status}): ${JSON.stringify(result.data)}`;
}
export async function getAiSuggestions(cookies) {
    const result = await fetchAiSummary(cookies);
    if (result.status !== 200) {
        return `Error (${result.status}): ${JSON.stringify(result.data)}`;
    }
    const d = result.data;
    const summaries = d?.data?.summaries;
    if (Array.isArray(summaries)) {
        return summaries
            .map((s, i) => `${i + 1}. [${s.type}] ${s.content}`)
            .join("\n\n");
    }
    return JSON.stringify(result.data, null, 2);
}
export async function getFullProfile(cookies) {
    const { rawRsc, profileId } = await scrapeProfilePage(cookies);
    if (!profileId)
        return "Could not extract profileId. Check your cookies.";
    // Extract key sections
    const extract = (key) => {
        const idx = rawRsc.indexOf(`"${key}"`);
        if (idx === -1)
            return "N/A";
        const end = rawRsc.indexOf('"', idx + key.length + 4);
        return rawRsc.slice(idx + key.length + 4, end > 0 ? end : idx + key.length + 100);
    };
    const name = extract("name");
    const title = extract("headline");
    const summary = rawRsc.includes('"summary"') ? "Present" : "Missing";
    // Count employments
    const empMatches = rawRsc.match(/"organization":"/g);
    const skillsMatches = rawRsc.match(/"skill":"([^"]+)"/g);
    const skills = skillsMatches
        ? [...new Set(skillsMatches.map(m => m.slice(9, -1)))].slice(0, 15)
        : [];
    return [
        `Profile ID: ${profileId}`,
        `Name: ${name}`,
        `Headline: ${title}`,
        `Summary: ${summary}`,
        `Employments: ${empMatches?.length ?? 0}`,
        `Skills (first 15): ${skills.join(", ") || "N/A"}`,
    ].join("\n");
}
