---
name: tdd
description: Test-driven development for a feature. Writes a full unit and integration test suite first, has the user run it and watch it fail, then guides the user step by step through the minimal implementation to make it pass. Never writes the implementation first.
argument-hint: "<feature description>"
disable-model-invocation: true
---

# /tdd

Feature: $ARGUMENTS

If the feature description is empty, ask for it and stop.

## Hard rules

- **Tests first.** Do not write, edit, or scaffold implementation code until the user has run the
  new tests and seen them fail.
- **The user writes the implementation.** In the green phase, explain each step and show the code
  to add, but let the user make the change. Edit implementation files only if the user explicitly
  asks you to.
- **Never weaken a test to make it pass.** If a test looks wrong, explain why and ask before
  changing it.
- Follow `.claude/rules/` (use Context7 for current framework and library docs) and match the
  surrounding code's style.

## Phase 1: Understand

1. Restate the feature as a short list of acceptance criteria. If anything is ambiguous (inputs,
   error behavior, limits, who can call it), ask before writing tests. Do not guess at business
   rules.
2. Explore the project structure and the code the feature will touch. Decide which layers it
   spans: frontend, backend API, database, collector.
3. Identify the test framework and conventions from the project, not from memory:

| Area | How to detect | Expected setup | Test location | Run command |
| --- | --- | --- | --- | --- |
| Frontend | `frontend/package.json`, `angular.json` `test` builder | Vitest via `@angular/build:unit-test`, jsdom, Angular `TestBed` | `*.spec.ts` next to the source file | `cd frontend; npx ng test --watch=false` |
| Backend | `*.Tests.csproj` under `backend/tests/` | xUnit + `WebApplicationFactory` (`Microsoft.AspNetCore.Mvc.Testing`) | `backend/tests/AccessRiskDashboard.Api.Tests/` | `dotnet test backend/AccessRiskDashboard.slnx` |
| Collector | `collector/pyproject.toml` | pytest | `collector/tests/test_*.py` | `collector/.venv/Scripts/python -m pytest collector/tests` |

4. **If a needed test project or package is missing** (for example, no backend test project
   exists yet), stop and propose the exact setup: project path, packages with versions pinned to
   match the project (e.g. `10.0.x` for Microsoft packages), and how it joins the solution and
   lockfile. Create it only after the user approves. Test infrastructure is not implementation code.

## Phase 2: Design the test suite

Present a test plan as a checklist grouped by layer, then write it. Cover:

- **Happy paths:** every acceptance criterion, with realistic data.
- **Edge cases:** empty, null or missing values, boundaries (0, 1, max, max+1), duplicates,
  ordering, Unicode and whitespace, time zones and dates, large inputs.
- **Error paths:** invalid input (HTTP 400 with a problem details body), not found (404),
  conflicts (409), dependency failures (database unavailable), and what the user sees in the UI.
- **Concurrency** where relevant: simultaneous writes, double submits.

Test types:

- **Unit tests:** pure logic, services, components in isolation, with dependencies faked.
- **Integration tests:**
  - Backend: real HTTP calls through `WebApplicationFactory` against SQL Server. Use a dedicated
    test database (e.g. `AccessRiskDashboard_Test`), created and reset by the tests and never the
    dev database. Read the password from user-secrets or `MSSQL_SA_PASSWORD`, never hardcode it.
  - Frontend: components with real templates, `provideHttpClientTesting()` for API calls, and
    Angular Material component harnesses (`@angular/cdk/testing`) for UI interaction.

Write tests that are deterministic (no real clocks, random values, or test-order dependence), have
one clear reason to fail each, and use names that read as behavior, e.g.
`returns_404_when_account_does_not_exist` or `it('shows an error when the API is unreachable')`.

## Phase 3: Red (stop and wait)

1. Save the test files.
2. Tell the user:
   - which files were created, with the number of tests in each;
   - the exact command to run them;
   - what failure to expect. Compile or import errors are expected at first because the feature
     doesn't exist yet. The first green-phase step will add empty skeletons so the failures become
     real assertion failures.
3. **Stop and wait** for the user to run the tests and report back (pasted output, or "run them for
   me").
4. Check the failures: each test must fail for the right reason (missing behavior), not because of
   a mistake in the test. Fix broken tests (with an explanation). Flag any test that unexpectedly
   passes, since it isn't testing new behavior.

## Phase 4: Green (guided, one step at a time)

1. **Skeleton first:** guide the user to add the minimal types, signatures, routes, or component
   shells so everything compiles, with no real logic. Have them rerun: tests should now fail on
   assertions.
2. Then go one test (or one small group of related tests) at a time:
   - name the test(s) being targeted;
   - explain the smallest change that makes them pass, and show the code in the project's style;
   - wait for the user to make the change and rerun;
   - review their change and the result before moving on.
3. Do not add behavior that no test requires. If you notice a missing case, add a test for it
   first (back to red), then implement.

## Phase 5: Refactor

With every test green, suggest refactors (duplication, naming, structure) the user can make while
keeping the tests green, and have them rerun the full suite after each one. Finish with a summary:
tests written, tests passing, and the commands to run the suite.
