---
name: review
description: Strict Staff Engineer review of the current changes against main (committed, staged, unstaged, and untracked). Outputs architecture, security/edge cases, performance, and refactoring suggestions in the project's style. Read-only.
argument-hint: "[optional paths or focus area]"
disable-model-invocation: true
---

# /review

Review the current changes like a strict Staff Engineer. This skill is **read-only**: do not edit,
stage, commit, or format anything. Optional focus from the user: $ARGUMENTS

## 1. Collect the diff against main

Run these and review the union of the changes:

1. `git fetch origin main --quiet` (skip silently if offline).
2. Base: `git merge-base HEAD origin/main` (fall back to `main` if `origin/main` is missing).
3. Committed changes on this branch: `git diff <base>...HEAD`.
   If the current branch is `main`, use unpushed commits instead: `git diff origin/main...HEAD`.
4. Uncommitted changes: `git diff HEAD` (staged and unstaged).
5. New files: `git ls-files --others --exclude-standard`; read them in full.

Start with `--stat` to size the change. For large diffs, review file by file. Skip lockfiles,
generated output (`dist/`, `bin/`, `obj/`, `.angular/`), and binaries, but flag unexpected lockfile
churn. If the user gave paths or a focus area, limit the review to that.

If there are no changes, say so and stop.

## 2. Learn the project's style before judging

For every changed file, read its surrounding code and at least one neighboring file in the same
area. Match the conventions you find, starting with:

- `.editorconfig` (indentation, line endings), `README.md`, and `.claude/rules/`.
- **Frontend (Angular 22, TypeScript 6):** standalone components, `inject()` over constructor
  injection, signals and `toSignal`, built-in control flow (`@if`, `@for` with `track`),
  `provideHttpClient(withFetch())`, relative `/api/...` URLs through the dev proxy, Angular Material
  components, SCSS.
- **Backend (ASP.NET Core 10, C# 14, EF Core 10):** minimal APIs in `Program.cs`, file-scoped
  namespaces, primary constructors, nullable reference types on, warnings as errors, config from
  `appsettings.json` with secrets from user-secrets or environment variables.
- **Collector (Python 3.13):** `src/` layout, type hints, `pytest` tests in `collector/tests`.

Refactoring suggestions must be written in these conventions, not generic best practice.

## 3. Review standards

- Every finding cites `path:line` and explains the concrete failure: which input or state causes
  what wrong result.
- Rank by severity: **Blocker** (must fix before merge), **Major** (should fix), **Minor** (nice
  to have). Use Nit only for style, and sparingly.
- No vague advice ("consider adding tests"). Name the exact case that is missing.
- Do not invent problems to fill a section. If a section has nothing real, write
  "No issues found" and the one-line reason.
- Verify before reporting: re-read the code to confirm the issue exists in this diff, not in code
  you assumed.

### What to look for

**Security & edge cases**
- Race conditions: shared mutable state, async calls without awaiting, concurrent writes without
  concurrency tokens, check-then-act on the database.
- Nulls: `!` null-forgiving operators, unchecked `FirstOrDefault`, missing config values, optional
  chaining that hides errors, uninitialized signals or inputs.
- Memory and resource leaks: RxJS subscriptions without `takeUntilDestroyed` or `async`/`toSignal`,
  event listeners or timers never removed, `IDisposable`/`DbContext` held beyond scope,
  singletons capturing scoped services.
- Injection and data exposure: `FromSqlRaw`/`ExecuteSqlRaw` with concatenation, unvalidated input,
  `[innerHTML]`/`bypassSecurityTrust*`, secrets in code or config, overly broad CORS, error
  responses leaking internals.

**Performance**
- Frontend re-renders: function calls or heavy getters in templates, `@for` without a stable
  `track`, signals or computed values rebuilt per change, missing `OnPush` where default change
  detection causes churn.
- Algorithms: O(N²) nested loops or repeated `.find`/`.filter`/`.Contains` over lists where a
  `Set`/`Map`/`HashSet`/`Dictionary` fits, repeated work inside loops.
- Database: N+1 queries (queries inside loops, lazy navigation access), missing `Include`/projection,
  `ToList()` before filtering, missing `AsNoTracking()` on read-only queries, unbounded result
  sets, missing indexes for new query patterns, synchronous EF calls.

## 4. Output format

Return exactly this markdown structure:

~~~~markdown
# Code Review: <branch> vs main

**Scope:** <N files, +X/-Y lines; commits and uncommitted changes reviewed>
**Verdict:** Approve | Approve with comments | Request changes

## Summary of Architectural Changes
<What changed structurally: new modules, endpoints, data flow, dependencies, and whether the
design fits the existing architecture. Call out coupling, layering violations, or decisions that
will be hard to reverse.>

## Security & Edge Cases
| Severity | Location | Issue | Failure scenario |
| --- | --- | --- | --- |

## Performance
| Severity | Location | Issue | Impact |
| --- | --- | --- | --- |

## Refactoring Suggestions
### <short title> (`path:line`)
<Why, in one or two sentences.>
```<language>
<suggested code in the project's exact style>
```

## Must-fix before merge
<Numbered list of Blocker and Major items, or "None".>
~~~~
