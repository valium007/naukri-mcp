# naukri-mcp

MCP (Model Context Protocol) server for **Naukri.com** profile management via reverse-engineered API.

Lets AI coding assistants (Claude Code, Cursor, etc.) read and edit your
Naukri profile — update summary, add/delete employments, manage skills,
change salary details, and more — without touching the Naukri UI.

## Installation

```bash
git clone <repo-url> naukri-mcp
cd naukri-mcp/naukri-mcp
npm install
npm run build
```

## Setup

1. **Get your Naukri cookies:**
   - Log into [naukri.com](https://www.naukri.com) in Chrome
   - Open DevTools → Application → Cookies → `naukri.com`
   - Copy all cookie names and values as `name=value; name2=value2; ...`
   - The `nauk_at` cookie is required (it's the auth token)

2. **Add to your MCP client:**
   
   **Claude Code** (`~/.config/claude/claude_desktop_config.json`):
   ```json
   {
     "mcpServers": {
       "naukri": {
         "command": "node",
         "args": ["/absolute/path/to/naukri-mcp/dist/index.js"]
       }
     }
   }
   ```

   **opencode** (`.opencode/config.json` or `~/.config/opencode/opencode.json`):
   ```json
   {
     "mcpServers": {
       "naukri": {
         "command": "node",
         "args": ["/absolute/path/to/naukri-mcp/dist/index.js"]
       }
     }
   }
   ```

## Tools

| Tool | Description |
|---|---|
| `naukri_get_profile` | Get profile overview (ID, name, headline, employments, skills) |
| `naukri_get_profile_id` | Extract your profileId (needed for all update operations) |
| `naukri_update_summary` | Update the profile summary text |
| `naukri_get_ai_suggestions` | Get AI-generated summary suggestions from Naukri |
| `naukri_list_employments` | List all employments with dates and IDs |
| `naukri_add_employment` | Add a new employment entry |
| `naukri_delete_employment` | Delete an employment by ID |
| `naukri_add_tech_skill` | Add/update a tech skill with experience |
| `naukri_update_key_skills` | Update the key skills tags |
| `naukri_update_basic_details` | Update professional details (experience, salary, city, notice period, etc.) |

Every tool takes a `cookies` parameter — paste your full Naukri cookie string.

## Architecture

```
naukri-mcp/
├── src/
│   ├── index.ts           # MCP server entry point — registers all tools
│   ├── auth.ts            # Cookie parsing & validation
│   ├── naukri-client.ts   # HTTP client for Naukri's internal API
│   └── tools/
│       ├── employment.ts  # Add/update/delete/list employments
│       ├── profile.ts     # Summary, AI suggestions, full profile
│       ├── skills.ts      # Tech skills, key skills
│       └── basic-details.ts # Experience, salary, city, notice period
├── dist/                  # Compiled JS output
├── package.json
├── tsconfig.json
└── README.md
```

## How it works

Naukri.com is a Next.js SPA. Its profile editing UI uses a single internal
mutation endpoint for ALL profile changes:

```
POST https://www.naukri.com/cloudgateway-aurus/aurus-jobseeker-profile-wrapper/
     v0/jobseeker/users/self/update/fullprofiles
```

The body accepts `{ data: { profileId, employments, profile, itskills, ... }, fieldMasks: ["*"] }`.

This MCP server calls that endpoint directly, bypassing the React UI entirely.
See [API.md](API.md) for the full reverse-engineering documentation.

## Security

- Your Naukri cookies are passed to each tool call — they are **not stored**
  by the MCP server
- All API calls go directly to Naukri's servers over HTTPS
- The server runs locally and communicates over stdio

## License

MIT
