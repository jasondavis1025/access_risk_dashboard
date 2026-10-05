---
name: gitship
description: Stage all changes, commit with a Conventional Commits message, and push. Confirms the file list with the user before staging and the message before committing.
argument-hint: "[optional hint for the commit message]"
disable-model-invocation: true
---

# /gitship

Stage everything, commit, and push, with two approval points. Read and follow
`.claude/skills/git-safety.md` first.

User input (optional hint for the message): $ARGUMENTS

## Steps

1. Run `git status --short` and `git diff --stat`. If there are no changes, say so and stop
   (mention `/gitpush` if there are unpushed commits).
2. Run the **secret check** and **large-file check** on all changed and untracked files. Mark any
   blocked file as excluded.
3. **Approval 1 (before staging):** show the full list of files to be staged (new, modified,
   deleted), the excluded files and why, and any files that were already staged, following the
   safety file's "Approval prompts" rule. Wait for the user
   to confirm. They may remove files from the list. On cancel, stop without staging anything.
4. Stage the confirmed files by explicit path with `git add -- <paths>`.
5. Run the secret check again on `git diff --cached`. Stop if anything matches.
6. Draft a Conventional Commits message from the staged diff per the safety file, using the user's
   hint if given. The subject must be `<type>(<optional scope>): <summary>`, using only these types:

   | Type       | Use for                                                   |
   | ---------- | --------------------------------------------------------- |
   | `feat`     | a new feature or capability                               |
   | `fix`      | a bug fix                                                 |
   | `docs`     | documentation only                                        |
   | `style`    | formatting or whitespace, no behavior change              |
   | `refactor` | code restructuring with no behavior change                |
   | `perf`     | a performance improvement                                 |
   | `test`     | adding or changing tests                                  |
   | `build`    | build system, dependencies, or packaging                  |
   | `ci`       | CI configuration and pipelines                            |
   | `chore`    | maintenance and tooling, including `.claude/` changes     |
   | `revert`   | reverting an earlier commit                               |

   Scope is optional. If used, it must be a project area: `frontend`, `backend`, `collector`, `db`,
   or `docker`. Never use `claude` as a scope; write `chore: ...` with no scope instead.
7. **Approval 2 (before committing):** show the commit subject line in a code block, plus the list
   of files it covers, and ask the user to approve, edit, or cancel. End the turn and wait; never
   commit in the same turn the subject is shown. Apply any edits and show the subject again. On
   cancel, stop and tell the user the files remain staged.
8. Commit (`git commit -m <subject> -m <body> -m <trailer>`), then push following the push-safety
   rules.
9. Report the commit hash, branch, and remote.
