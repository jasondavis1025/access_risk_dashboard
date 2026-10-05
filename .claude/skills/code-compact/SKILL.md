---
name: code-compact
description: Generate a highly compressed, token-optimized markdown snapshot of the code architecture (signatures, data shapes as TypeScript types, API surface) for pasting into other LLM sessions. Read-only.
argument-hint: "[paths or directories] [budget=<tokens>]"
disable-model-invocation: true
---

# /code-compact

Produce a dense "context injection snippet" describing the code, optimized for minimum tokens and
maximum fidelity. Read-only: never edit source files.

User input: $ARGUMENTS

## 1. Scope

- **Paths given:** use those files and directories.
- **No paths:** use the file(s) the user has open or selected in the IDE (shown in the conversation
  context). If none, ask which directory to compact and stop.
- **`budget=<n>`:** target at most about n tokens (default: as small as possible without losing
  structure).
- Always skip: `node_modules/`, `bin/`, `obj/`, `dist/`, `.angular/`, `.venv/`, `__pycache__/`,
  lockfiles, binaries, images, generated files, and test fixtures (summarize tests as counts unless
  tests were the target).
- **Never include secrets.** Skip `.env*` (except `.env.example` key names), user-secrets, keys, and
  certificates. Replace any password, token, or connection-string credential with `***`.

## 2. Compression rules

**Remove**
- Comments and docstrings, except non-obvious intent or invariants, rewritten as `// ≤1 line`.
- Imports/usings, access modifiers that are the default, `async` noise, decorator and attribute
  boilerplate (keep only ones that change behavior, such as routes, `[Required]`, `@Input`).
- Method bodies. Keep only a `// →` note for important logic (side effects, queries, calls made).

**Collapse**
- Repeated patterns into one line with a count, e.g. `CRUD×4 (Account, Role, Group, Permission):
  GET/POST/PUT/DELETE /api/<plural>`.
- Standard framework shells (Angular component, ASP.NET minimal-API registration, pytest fixtures)
  into a single line naming only what differs.
- Directory trees into one-line paths, with single-child folders merged (`backend/src/Api/Data/`).

**Represent**
- All data structures as dense TypeScript types, whatever the source language. C# classes,
  records, and EF entities, Python dataclasses, and JSON payloads all become `type X = {...}` with
  `?` for optional, unions for enums, `T[]` for collections, and `// PK`, `// FK→Y`, `// idx`
  annotations for keys and indexes.
- APIs as `METHOD /path (body) → response | errors`.
- Functions as `name(arg: T, ...) → R`, with members grouped under their class/component.
- Config as key names, with values only when non-sensitive and meaningful (ports, URLs, flags).

**Fidelity**
- Every name, signature, route, and type must exist in the code. Never invent or "clean up" names.
- Mark deliberate omissions with `…`.
- Preserve the relationships that matter: who calls whom, data flow, and DI registrations.

## 3. Output format

Print one fenced `markdown` block, and nothing inside it except the snippet, in this structure
(omit empty sections):

````markdown
# CTX: <project or directory> @<git short hash>
legend: →returns/calls ?optional …omitted ×N repeated //PK //FK→T //idx
stack: <languages, frameworks, and key versions on one line>

## tree
<one path per line, collapsed>

## types
<TypeScript type definitions>

## api
<METHOD /path (body) → response | errors>

## modules
<path>: <members as signatures, one per line, indented 1 space>

## flow
<one line per key data or control flow, e.g. ui → GET /api/health → HealthChecks → SqlServer>

## config
<keys and non-sensitive values>
````

Example of the expected density:

````markdown
## api
GET /api/health → {status:"Healthy"|"Degraded"|"Unhealthy", checks:{}}  // liveness, no DB
GET /api/health/ready → same, checks:{database}  // 503 when SqlServer unreachable

## modules
backend/src/AccessRiskDashboard.Api/Program.cs: minimal API; DI: AppDbContext(UseSqlServer(cs+MSSQL_SA_PASSWORD)), HealthChecks.AddDbContextCheck<AppDbContext>[ready]
 WriteHealthResponse(ctx, report) → json{status, checks:{name:status}}
frontend/src/app/app.ts: App (standalone; MatToolbar, MatCard)
 apiStatus: Signal<string> ← toSignal(GET /api/health → .status, catch→"Unreachable")
````

## 4. After the snippet

Below the block, print one stats line:
`~<snippet tokens> tokens (from ~<source tokens>, <ratio>% of source) · <N> files · skipped: <what>`

Estimate tokens as characters ÷ 4. If the snippet is over budget, compress further: drop `// →`
notes first, then collapse modules to class-level only. Offer to save the snippet to a file only if
the user asks.
