---
name: gitpush
description: Commit the currently staged changes with a Conventional Commits message (shown to the user for approval first), then push. Leaves unstaged changes alone.
argument-hint: "[optional hint for the commit message]"
disable-model-invocation: true
---

# /gitpush

Commit what is already staged, then push. Read and follow `.claude/skills/git-safety.md` first.

User input (optional hint for the message): $ARGUMENTS

## Steps

1. Run `git diff --cached --stat`.
   - If nothing is staged but there are unpushed commits (`git log @{u}..` or no upstream yet),
     skip to step 5 and push them.
   - If nothing is staged and nothing is unpushed, say so and stop. Suggest `/gitstage` or `/gitship`.
2. Run the **secret check** on `git diff --cached`. Stop if anything matches.
3. Read the staged diff and draft a Conventional Commits message per the safety file, using the
   user's hint if given.
4. Show the message and the staged file list, then **wait for approval**. Apply any edits the user
   asks for and show it again. On cancel, stop and leave everything staged.
5. After approval, commit (`git commit -m <subject> -m <body> -m <trailer>`), then push following the
   push-safety rules.
6. Report the commit hash, branch, and remote. Mention any unstaged changes that were left out.
