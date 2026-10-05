---
name: gitstage
description: Stage changes for the next commit (all changes, or only the paths the user names), after a secret check. Does not commit or push.
argument-hint: "[optional paths or description of what to stage]"
disable-model-invocation: true
---

# /gitstage

Stage changes without committing. Read and follow `.claude/skills/git-safety.md` first.

User input: $ARGUMENTS

## Steps

1. Run `git status --short` and `git diff --stat` to see what changed.
2. Decide what to stage:
   - No input: all modified, deleted, and untracked (non-ignored) files.
   - Input given: only the matching paths or the files that match the description. If it is
     ambiguous, ask which files.
3. Run the **secret check** and **large-file check** from the safety rules on those files.
   Exclude anything blocked and tell the user why.
4. Stage the remaining files by explicit path with `git add -- <paths>`.
5. Report the result with `git status --short`: what is staged, what was skipped and why, and
   what is still unstaged.

Do not commit or push. Mention that `/gitpush` will commit and push what is staged.
