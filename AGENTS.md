# AGENTS.md — naukri-mcp

MCP server for Naukri.com profile management via reverse-engineered internal API.

## Commands

| Command          | What it does                |
| ---------------- | --------------------------- |
| `npm run build`  | `tsc` — compile to `dist/`  |
| `npm run lint`   | `tsc --noEmit` — type-check only |
| `npm run dev`    | `tsc --watch`               |
| `npm start`      | `node dist/index.js`        |

No test framework or test files exist. `lint` = `tsc --noEmit` (no ESLint, no Prettier).

## Architecture

```
src/index.ts          — MCP server entry, registers all tools via @modelcontextprotocol/sdk
src/auth.ts           — cookie parsing (name=value; …, Netscape format, validation)
src/naukri-client.ts  — HTTP client: fetch wrapper, endpoint constants, profile-page scraper
src/tools/
  profile.ts          — summary update, AI suggestions, full profile scrape
  employment.ts       — add/update/delete/list employments
  skills.ts           — tech skills, key skills
  basic-details.ts    — experience, city, salary, notice period, dept/industry/role
```

## Key facts

- **ESM only**: `"type": "module"`, `Node16` module resolution. Imports must use `.js` extension (`import ... from "./auth.js"`).
- **No bundler** — plain `tsc` emits into `dist/`. `dist/` is gitignored; run `npm run build` before first run.
- **Reverse-engineered API**: All mutations go through a single `POST .../fullprofiles` endpoint with `fieldMasks: ["*"]`. See `API.md` for the reverse-engineering notes and JS bundle sources. If Naukri changes this endpoint, everything breaks.
- **Cookies are NOT stored**: Every MCP tool takes a `cookies` string param. `nauk_at` is the only required cookie.
- **profileId is scraped**, not fetched from a dedicated API — it's extracted from `self.__next_f.push()` RSC chunks in the `/mnjuser/profile` page HTML. The regex can break if Naukri changes its Next.js streaming format.
- **Fullprofiles is a partial update**: Only send the profile sections you want to change inside the `data` object. The backend infers which fields to update from the presence of keys.
- **No CI, no tests** — verify changes with `npm run lint && npm run build`, then start the server and exercise tools via an MCP client.
