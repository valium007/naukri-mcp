import { fullprofiles, deleteEmployment, scrapeProfilePage } from "../naukri-client.js";
/** Months in Naukri's expected format (MM) */
const MONTHS = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};
function toMonth(month) {
    const m = month.toLowerCase().slice(0, 3);
    return MONTHS[m] ?? month.padStart(2, "0");
}
function toDate(monthStr, yearStr) {
    const m = toMonth(monthStr);
    const y = String(yearStr).padStart(4, "20");
    return `${y}-${m}-01`;
}
function buildEmploymentPayload(profileId, input) {
    const startDate = toDate(input.startDate.month, input.startDate.year);
    const endDate = input.endDate
        ? toDate(input.endDate.month, input.endDate.year)
        : "";
    const emp = {
        employmentId: input.employmentId ?? "",
        experienceType: input.experienceType,
        designation: input.designation,
        designationId: "",
        organization: input.organization,
        organizationId: input.organizationId ?? "99999",
        employmentType: input.employmentType ?? "previous",
        startDate,
        endDate: input.employmentType === "current" ? "" : endDate,
        jobDescription: input.jobDescription ?? "",
    };
    const extras = {};
    const profileAdditional = {};
    if (input.employmentType === "current") {
        emp.keySkills = (input.keySkills ?? []).join(",");
        if (input.absoluteCtc) {
            extras.absoluteCtc = input.absoluteCtc;
            extras.currency = input.currency ?? "INR";
        }
        if (input.location) {
            extras.city = { id: input.location, value: input.location };
        }
    }
    if (input.salaryBreakdown) {
        profileAdditional.salaryDDId = input.salaryBreakdown.id;
        profileAdditional.profileId = profileId;
        if (input.salaryBreakdown.fixedCtc) {
            profileAdditional.fixedCtc = input.salaryBreakdown.fixedCtc;
        }
        if (input.salaryBreakdown.variableCtc) {
            profileAdditional.variableCtc = input.salaryBreakdown.variableCtc;
        }
    }
    if (input.noticePeriod) {
        extras.noticePeriod = input.noticePeriod;
    }
    if (input.noticeEndDate) {
        const np = { noticeEndDate: input.noticeEndDate };
        // Pass noticePeriod wrapper
    }
    const body = {
        profileId,
        employments: [emp],
    };
    if (Object.keys(extras).length > 0) {
        body.profile = extras;
    }
    if (Object.keys(profileAdditional).length > 1) {
        body.profileAdditional = profileAdditional;
    }
    return body;
}
export async function addOrUpdateEmployment(cookies, profileId, input) {
    const body = buildEmploymentPayload(profileId, input);
    const action = input.employmentId ? "Updated" : "Added";
    const result = await fullprofiles(cookies, body);
    if (result.status === 200) {
        return `${action} employment at ${input.organization} as ${input.designation}`;
    }
    return `Error (${result.status}): ${JSON.stringify(result.data)}`;
}
export async function removeEmployment(cookies, profileId, employmentId) {
    const result = await deleteEmployment(cookies, profileId, employmentId);
    if (result.status === 200) {
        return `Deleted employment ${employmentId}`;
    }
    return `Error (${result.status}): ${JSON.stringify(result.data)}`;
}
export async function listEmployments(cookies) {
    const { rawRsc, profileId } = await scrapeProfilePage(cookies);
    if (!profileId)
        return "Could not find profileId in page";
    const empIdx = rawRsc.indexOf('"employments"');
    if (empIdx === -1)
        return "No employments found in profile data";
    let depth = 0;
    let endIdx = empIdx;
    for (let i = empIdx; i < rawRsc.length; i++) {
        if (rawRsc[i] === "[")
            depth++;
        if (rawRsc[i] === "]") {
            depth--;
            if (depth === 0) {
                endIdx = i + 1;
                break;
            }
        }
    }
    const section = rawRsc.slice(empIdx + 13, endIdx);
    const lines = [];
    const orgRegex = /"organization":"([^"]+)"/g;
    const desRegex = /"designation":"([^"]+)"/g;
    const idRegex = /"employmentId":"([^"]+)"/g;
    const sdRegex = /"startDate":"([^"]+)"/g;
    const edRegex = /"endDate":"([^"]+)"/g;
    const orgs = [...section.matchAll(orgRegex)].map(m => m[1]);
    const dess = [...section.matchAll(desRegex)].map(m => m[1]);
    const ids = [...section.matchAll(idRegex)].map(m => m[1]);
    const sds = [...section.matchAll(sdRegex)].map(m => m[1]);
    const eds = [...section.matchAll(edRegex)].map(m => m[1]);
    for (let i = 0; i < orgs.length; i++) {
        const sd = sds[i]?.slice(0, 7) ?? "?";
        const ed = eds[i]?.slice(0, 7) ?? "Present";
        const eid = (ids[i] ?? "?").slice(0, 12) + "...";
        lines.push(`${i + 1}. ${dess[i]} at ${orgs[i]} (${sd} – ${ed})  id:${eid}`);
    }
    return `Profile ID: ${profileId}\n` + lines.join("\n");
}
