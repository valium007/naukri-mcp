# Naukri API — Reverse Engineering Notes

All endpoints discovered by reading Naukri.com's Next.js JavaScript bundles
(JSONP chunks with predictable naming patterns) and examining network traffic
during the profile-editing session.

## JS Bundles Analyzed

```
_base: https://static.naukimg.com/s/9/1950/_next/static/chunks/

EditProfileWrapper.1bb3c4af0618dff3.js      → deleteEmployment endpoint, fieldMasks schema
RenderEmploymentForm.bc510f4b07fb998a.js    → employment add/update payload structure
EditProfileSummary.36ca65c4011a1ff7.js      → summary update, AI suggestions endpoint
EditTechSkills.8f2273b4b2ece9f0.js          → itskills payload, autocomplete API
EditBasicDetails.7c849ce830e0cbbf.js        → basic details payload structure
EditPreferences.beab46c63620a5cb.js         → key findings: module 21313 reveals the ONE mutation endpoint
```

## Key Finding: Single Mutation Endpoint

Module `21313` from `EditPreferences.beab46c63620a5cb.js`:

```js
// The URL builder (simplified):
function o(e) {
  var n = "";
  return e && typeof e === "object" && (n = e.query),
    "https://www.naukri.com/cloudgateway-aurus/aurus-jobseeker-profile-wrapper/v0/jobseeker/users/self/update/fullprofiles" + n;
}

// The endpoint definition:
var c = i.Ry({ data: i.IM(i.Z_(), i.Yj()), fieldMasks: i.IX(i.Z_()) });

var l = function () {
  var e = a.bl.createEndpoint({ method: "POST", urlFn: o, bodySchema: c });
  return e(...arguments);
};
```

- `i.Z_()` = `profileId: z.string()` (required)
- `i.IX()` = `fieldMasks: z.array(z.string())`
- `i.IM()` = union schema allowing any profile section
- `i.Yj()` = huge zod schema covering all profile fields

## API Endpoints

### 1. Profile Mutation (everything)

```
POST https://www.naukri.com/cloudgateway-aurus/aurus-jobseeker-profile-wrapper/v0/jobseeker/users/self/update/fullprofiles
```

**Headers:** `Content-Type: application/json`, `appid: 109`, `systemid: 109`

**Body format:**
```json
{
  "data": {
    "profileId": "f1c713fb5a87342e5592922fa3c4b33d..."
  },
  "fieldMasks": ["*"]
}
```

**Sub-payloads** (all go inside `data`):

#### a. Profile summary
```json
{
  "profileId": "...",
  "profile": {
    "summary": "New summary text (50-1000 chars)"
  }
}
```
_Source: EditProfileSummary.js line ~140_

#### b. Employment (add/update)
```json
{
  "profileId": "...",
  "employments": [{
    "employmentId": "",
    "experienceType": "Full Time",
    "designation": "Senior Software Engineer",
    "designationId": "",
    "organization": "Magic Factory Tech Pvt Ltd",
    "organizationId": "99999",
    "employmentType": "previous",
    "startDate": "2023-04-01",
    "endDate": "2023-07-01",
    "jobDescription": "Built QuickBooks sync platform..."
  }],
  "profile": {
    "city": {"id": "...", "value": "Bangalore"},
    "absoluteCtc": "5000000",
    "currency": "INR"
  },
  "profileAdditional": {
    "salaryDDId": 1,
    "fixedCtc": "4000000"
  }
}
```
_Source: RenderEmploymentForm.js - `eW` function (the submit handler)_

For current employment, `keySkills` is a comma-separated string on the employment object.

#### c. IT Skills (tech skills)
```json
{
  "profileId": "...",
  "itskills": [{
    "sid": -1,
    "entitySkillId": null,
    "entitySkill": "TypeScript",
    "skill": "TypeScript",
    "experienceTime": { "year": 5, "month": 3 }
  }]
}
```
_Source: EditTechSkills.js - `eN` function_

`sid` = -1 for new skill, existing skillId for updates.

#### d. Basic details
```json
{
  "profileId": "...",
  "profile": {
    "experience": {"year": 10, "month": 6},
    "city": {"id": "123", "value": "Mumbai"},
    "absoluteCtc": "5000000",
    "currency": "INR",
    "noticePeriod": {"id": 30, "value": "30"},
    "entityDepartment": {"id": "...", "value": "IT"},
    "entityIndustryTypeId": {"id": "...", "value": "Software"},
    "entityRoleCategory": {"id": "...", "value": "Development"},
    "entityRole": {"id": "...", "value": "Full Stack Developer"}
  },
  "profileAdditional": {
    "profileId": "...",
    "salaryDDId": 2,
    "fixedCtc": "4000000",
    "variableCtc": "1000000"
  },
  "noticePeriod": [{
    "noticeEndDate": "2024-03-15"
  }]
}
```
_Source: EditBasicDetails.js - `G`, `U` functions_

#### e. Key skills
```json
{
  "profileId": "...",
  "profile": {
    "keySkills": "Node.js,TypeScript,AWS,React,PostgreSQL"
  }
}
```
_Source: Inferred from profile structure_

### 2. Delete Employment

```
POST https://www.naukri.com/cloudgateway-aurus/aurus-jobseeker-profile-wrapper/v0/jobseeker/users/self/profile/deleteEmployment
```

```json
{
  "profileId": "f1c713fb...",
  "employmentId": "725aa412...",
  "fieldMasks": ["*"]
}
```
_Source: EditProfileWrapper.js - extracted endpoint string_

### 3. AI Summary Suggestions

```
GET https://www.naukri.com/cloudgateway-aurus/aurus-ai-services/v0/naukri/user/self/suggested/summary
```

Response: `{ data: { summaries: [{ type: "Professional", content: "..." }, ...] } }`

_Source: EditProfileSummary.js - `d` endpoint definition_

### 4. Autocomplete

```
GET https://www.naukri.com/cloudgateway-aurus/.../autosuggest?category={category}&query={query}
```

Categories: `skill`, `designation`, `company`, `currentLocation`, `state`, `country`, `departmentRole`, `industry`

_Source: EditTechSkills.js imports `(0,v.B)` from module 38287; RenderEmploymentForm uses `category:"designation"` etc._

### 5. Resume Upload

```
POST https://www.naukri.com/cloudgateway-aurus/aurus-profile-upload-service/v0/profile/uploadResume
```

Multipart form-data with file field `resume`.

_Source: Inferred from profile page upload behavior_

### 6. Category Lookup Data

```
GET .../category?category=salaryBreakDown
```

Returns lookup values for dropdowns: `NOTICE_PERIOD`, `EXPERIENCE_YEAR`, `EXPERIENCE_MONTH`, `salaryBreakDown`, `careerBreak`.

_Source: EditBasicDetails.js imports `(0,h.c)` from module 36715_

## Authentication

Naukri uses standard HTTP cookies:
- `nauk_at` — the primary auth token (required)
- `nauk_a` — auxiliary auth cookie
- `__cf_bm` — Cloudflare bot management
- `naukri_ats_session` — session tracking

All cookies must be sent as a `Cookie` header on every request.

## ProfileId Extraction

The profileId is embedded in the Next.js RSC (React Server Components) streaming
payload in the `/mnjuser/profile` page HTML:

```js
// In page source:
self.__next_f.push([1,"...profileId...":"f1c713fb5a87342e5592922fa3c4b33d00239396e5ae923d...","...])
```

Regex: `/self\.__next_f\.push\(\[1,(.+?)\]\)/g` — extract all chunks, join them, then find `"profileId":"([a-f0-9]+)"`.

## Notes

- All mutations use `fieldMasks: ["*"]` — Naukri's backend determines which fields
  to update based on which keys are present in `data`
- The `fullprofiles` endpoint is a "partial update" — you only send the sections
  you want to change
- Profile data is also returned in the page HTML as a huge serialized JSON in the
  Next.js streaming payload
- Naukri's React UI adds significant client-side validation (character limits,
  regex patterns for special chars, etc.) — this MCP server does minimal validation
