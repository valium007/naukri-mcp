#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { parseCookieString, validateCookies } from "./auth.js";
import { scrapeProfilePage } from "./naukri-client.js";
import { updateSummary, getAiSuggestions, getFullProfile } from "./tools/profile.js";
import { addOrUpdateEmployment, removeEmployment, listEmployments } from "./tools/employment.js";
import { addTechSkill, updateKeySkills } from "./tools/skills.js";
import { updateBasicDetails } from "./tools/basic-details.js";
// ── Shared cookie schema ────────────────────────────────────────────────
const CookieJarSchema = z.string().describe("Naukri cookies. Paste the full cookie string from browser DevTools " +
    "(Application > Cookies > naukri.com). Must include 'nauk_at'.");
function getCookies(raw) {
    const jar = parseCookieString(raw);
    const err = validateCookies(jar);
    if (err)
        throw new Error(err);
    return jar;
}
async function getProfileId(cookies) {
    const { profileId } = await scrapeProfilePage(cookies);
    if (!profileId)
        throw new Error("Could not extract profileId from profile page. Check cookies.");
    return profileId;
}
// ── MCP Server ───────────────────────────────────────────────────────────
const server = new McpServer({
    name: "naukri-mcp",
    version: "0.1.0",
});
// ── Profile ──────────────────────────────────────────────────────────────
server.tool("naukri_get_profile", "Get full Naukri profile overview (profileId, name, headline, employment count, skills)", { cookies: CookieJarSchema }, async ({ cookies: raw }) => {
    const cookies = getCookies(raw);
    const text = await getFullProfile(cookies);
    return { content: [{ type: "text", text }] };
});
server.tool("naukri_get_profile_id", "Extract the profileId from Naukri profile page. Needed for all update operations.", { cookies: CookieJarSchema }, async ({ cookies: raw }) => {
    const cookies = getCookies(raw);
    const { profileId } = await scrapeProfilePage(cookies);
    if (!profileId)
        return { content: [{ type: "text", text: "Could not extract profileId. Check your cookies." }] };
    return { content: [{ type: "text", text: `Profile ID: ${profileId}` }] };
});
server.tool("naukri_update_summary", "Update the profile summary/headline text. Accepts plain text or HTML.", {
    cookies: CookieJarSchema,
    summary: z.string().describe("The new profile summary text (50-1000 characters)"),
}, async ({ cookies: raw, summary }) => {
    const cookies = getCookies(raw);
    const profileId = await getProfileId(cookies);
    const text = await updateSummary(cookies, profileId, summary);
    return { content: [{ type: "text", text }] };
});
server.tool("naukri_get_ai_suggestions", "Get AI-generated profile summary suggestions from Naukri.", { cookies: CookieJarSchema }, async ({ cookies: raw }) => {
    const cookies = getCookies(raw);
    const text = await getAiSuggestions(cookies);
    return { content: [{ type: "text", text }] };
});
// ── Employment ───────────────────────────────────────────────────────────
server.tool("naukri_list_employments", "List all employments on the Naukri profile with dates and IDs.", { cookies: CookieJarSchema }, async ({ cookies: raw }) => {
    const cookies = getCookies(raw);
    const text = await listEmployments(cookies);
    return { content: [{ type: "text", text }] };
});
server.tool("naukri_add_employment", "Add a new employment entry to the Naukri profile. Uses the fullprofiles mutation endpoint.", {
    cookies: CookieJarSchema,
    designation: z.string().describe("Job designation/title (e.g. 'Senior Software Engineer')"),
    organization: z.string().describe("Company name (e.g. 'Acme Corp')"),
    experienceType: z.enum(["Full Time", "Internship", "Contractual", "Part Time"]).describe("Employment type"),
    currentCompany: z.boolean().default(false).describe("Mark as current company?"),
    startMonth: z.string().describe("Start month (e.g. 'Jan', 'Apr', or '01')"),
    startYear: z.string().describe("Start year (e.g. '2023')"),
    endMonth: z.string().optional().describe("End month (omit if current company)"),
    endYear: z.string().optional().describe("End year (omit if current company)"),
    jobDescription: z.string().optional().describe("Job profile / description text"),
    keySkills: z.array(z.string()).optional().describe("Skills used (for current employment)"),
    location: z.string().optional().describe("Location (for current employment or internship)"),
    absoluteCtc: z.string().optional().describe("Current annual salary (for current employment, e.g. '5000000')"),
    currency: z.string().optional().default("INR").describe("Currency code (INR, USD, etc.)"),
}, async ({ cookies: raw, designation, organization, experienceType, currentCompany, startMonth, startYear, endMonth, endYear, jobDescription, keySkills, location, absoluteCtc, currency }) => {
    const cookies = getCookies(raw);
    const profileId = await getProfileId(cookies);
    const text = await addOrUpdateEmployment(cookies, profileId, {
        designation,
        organization,
        experienceType,
        employmentType: currentCompany ? "current" : "previous",
        startDate: { month: startMonth, year: startYear },
        endDate: endMonth && endYear ? { month: endMonth, year: endYear } : undefined,
        jobDescription: jobDescription ?? "",
        keySkills,
        location,
        absoluteCtc,
        currency,
    });
    return { content: [{ type: "text", text }] };
});
server.tool("naukri_delete_employment", "Delete an employment entry by its employmentId (use naukri_list_employments to get IDs).", {
    cookies: CookieJarSchema,
    employmentId: z.string().describe("Full 64-char employmentId from naukri_list_employments"),
}, async ({ cookies: raw, employmentId }) => {
    const cookies = getCookies(raw);
    const profileId = await getProfileId(cookies);
    const text = await removeEmployment(cookies, profileId, employmentId);
    return { content: [{ type: "text", text }] };
});
// ── Skills ───────────────────────────────────────────────────────────────
server.tool("naukri_add_tech_skill", "Add or update a tech skill (IT skill) with years/months of experience.", {
    cookies: CookieJarSchema,
    skillName: z.string().describe("Skill name (e.g. 'TypeScript', 'AWS Lambda')"),
    years: z.number().min(0).max(30).describe("Years of experience"),
    months: z.number().min(0).max(11).describe("Additional months of experience"),
    skillId: z.number().optional().describe("Skill ID for updates (-1 for new)"),
}, async ({ cookies: raw, skillName, years, months, skillId }) => {
    const cookies = getCookies(raw);
    const profileId = await getProfileId(cookies);
    const text = await addTechSkill(cookies, profileId, {
        name: skillName,
        years,
        months,
        skillId,
    });
    return { content: [{ type: "text", text }] };
});
server.tool("naukri_update_key_skills", "Update the key skills/tags section of the profile.", {
    cookies: CookieJarSchema,
    skills: z.array(z.string()).describe("List of key skill strings (e.g. ['Node.js', 'TypeScript', 'AWS'])"),
}, async ({ cookies: raw, skills }) => {
    const cookies = getCookies(raw);
    const profileId = await getProfileId(cookies);
    const text = await updateKeySkills(cookies, profileId, skills);
    return { content: [{ type: "text", text }] };
});
// ── Basic Details ────────────────────────────────────────────────────────
server.tool("naukri_update_basic_details", "Update professional details: experience, city, salary, notice period, department/industry/role.", {
    cookies: CookieJarSchema,
    totalExperienceYears: z.number().optional().describe("Total years of experience"),
    totalExperienceMonths: z.number().optional().describe("Additional months of experience"),
    currentCity: z.string().optional().describe("Current city name"),
    outsideIndia: z.boolean().optional().describe("Is the city outside India?"),
    currentCountry: z.string().optional().describe("Current country (if outside India)"),
    annualSalary: z.string().optional().describe("Current annual salary amount (e.g. '5000000')"),
    salaryCurrency: z.string().optional().default("INR").describe("Salary currency"),
    salaryDDId: z.number().optional().describe("Salary breakdown ID (1=fixed only, 2=fixed+var, 3=fixed+var+stocks)"),
    fixedCtc: z.string().optional().describe("Fixed salary component"),
    variableCtc: z.string().optional().describe("Variable salary component"),
    noticePeriod: z.number().optional().describe("Notice period in days (1, 15, 30, 60, 90)"),
    noticeEndDate: z.string().optional().describe("Last working day (YYYY-MM-DD, if notice period = 90+)"),
    department: z.string().optional().describe("Current department"),
    industry: z.string().optional().describe("Current industry"),
    roleCategory: z.string().optional().describe("Role category"),
    jobRole: z.string().optional().describe("Job role"),
}, async ({ cookies: raw, totalExperienceYears, totalExperienceMonths, currentCity, outsideIndia, currentCountry, annualSalary, salaryCurrency, salaryDDId, fixedCtc, variableCtc, noticePeriod, noticeEndDate, department, industry, roleCategory, jobRole }) => {
    const cookies = getCookies(raw);
    const profileId = await getProfileId(cookies);
    const text = await updateBasicDetails(cookies, profileId, {
        experienceYears: totalExperienceYears,
        experienceMonths: totalExperienceMonths,
        city: currentCity,
        outsideIndia,
        country: currentCountry,
        absoluteCtc: annualSalary,
        currency: salaryCurrency,
        salaryDDId,
        fixedCtc,
        variableCtc,
        noticePeriod,
        noticeEndDate,
        entityDepartment: department,
        entityIndustry: industry,
        entityRoleCategory: roleCategory,
        entityRole: jobRole,
    });
    return { content: [{ type: "text", text }] };
});
// ── Start server ─────────────────────────────────────────────────────────
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("naukri-mcp server started (stdio)");
}
main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
});
