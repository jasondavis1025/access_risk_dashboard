# Git safety rules

Shared by the `gitstage`, `gitpush`, and `gitship` skills. Apply every rule; never skip one to get a
command through.

## 1. Secret check (before staging and again before committing)

**Blocked paths.** Never stage or commit these, even if `.gitignore` misses them:

- `.env` and `.env.*` (except `.env.example`)
- `*.pem`, `*.key`, `*.pfx`, `*.p12`, `*.crt` containing a private key, `id_rsa*`, `id_ed25519*`
- `secrets.json`, `appsettings.*.local.json`, `*.publishsettings`

**Content scan.** Search the diff being staged or committed (`git diff` for unstaged,
`git diff --cached` for staged) for:

- `-----BEGIN ... PRIVATE KEY-----`
- `Password=` / `Pwd=` in connection strings with a real value
- `MSSQL_SA_PASSWORD=` with anything other than the `.env.example` placeholder
- Token shapes: `ghp_`, `github_pat_`, `sk-`, `AKIA`, `xox[bp]-`, `AIza`
- Lines assigning `password`, `secret`, `token`, or `api_key` to a literal value

**If anything matches:** stop. Show the file and line with the value masked (for example `Ar1_****`).
Do not stage or commit it. If it is already staged, unstage it with `git restore --staged <file>` and
tell the user. Proceed only after the user confirms the match is a false positive.

## 2. Push safety

- Never use `--force`, `--force-with-lease`, `--no-verify`, or `--amend` on pushed commits.
- If the branch has no upstream, push with `git push -u origin <branch>`.
- If the push is rejected (remote has commits not present locally): stop, explain, and suggest
  `git pull --rebase`. Do not pull, rebase, or merge without the user's OK.
- If a pre-commit or pre-push hook fails: report the output and stop. Do not bypass it.

## 3. Other checks

- Warn and ask before staging any file over 50 MB (GitHub rejects files over 100 MB).
- Never change git config, remotes, or credentials.
- Stage by explicit path when possible; never stage files that `.gitignore` excludes (no `git add -f`).

## Commit message format (Conventional Commits)

```
<type>(<optional scope>): <summary>

<optional body: what changed and why, wrapped at 72 chars>

Co-Authored-By: <Claude Code's standard attribution trailer>
```

- **type:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- **scope (optional):** the area touched, such as `frontend`, `backend`, `collector`, `db`, `docker`
- **summary:** imperative mood, lowercase, no trailing period, 72 characters or fewer
- **breaking change:** add `!` after the type/scope and a `BREAKING CHANGE:` footer
- If changes span unrelated concerns, say so and offer to split them into separate commits.
- Pick the type from what the diff actually does, not from file names alone.

**Approval:** always show the full proposed message and the list of files it covers, then wait for
the user to approve, edit, or cancel before running `git commit`.

**Committing:** pass the message with separate `-m` flags per paragraph (subject, body, trailer) so
it works in any shell.
