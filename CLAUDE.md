@AGENTS.md

# Claude Code project instructions

## Project purpose

This repository exists to build and ship AI software products with reliable delivery discipline.

For the current project, the main goal is:
- take a user-uploaded 2D image of a civil work or building
- reconstruct a usable 3D model
- expose the result in a clear interactive viewer
- make outputs easy to find, run, test, and review

## Operating philosophy

This repository must optimize for:
- discoverable outputs
- deterministic handoff
- short review loops
- strong execution spine
- low organizational noise

Do not optimize for decorative process, excessive roleplay, or unnecessary coordination.

## Delivery gate

For any implementation task, do not consider the work done unless all of the following are present:

1. exact output location
   - local folder path
   - repo path or GitHub URL if applicable

2. artifact proof
   - commit hash for code work, or equivalent proof if git is not being used
   - changed-file list

3. runnable handoff
   - setup instructions
   - run instructions
   - test instructions

4. documentation
   - README present
   - README explains what was built
   - README explains how to run it
   - README explains limitations

5. honest limitations
   - state known limitations clearly
   - do not pretend a system is production-ready if it is only MVP-ready

If one of these is missing, the task is not done.

## Required completion format

Every implementation completion message must end with this exact structure:

### Output location
- local folder path
- repo path or GitHub URL

### Commit
- commit hash

### Changed files
- explicit list

### How to run
- commands

### How to test
- commands

### README status
- yes/no
- what it contains

### Known limitations
- concise list

## Review policy

Use short, high-value review loops.

Maximum policy:
- first submission
- then at most 2 revision cycles
- after the second revision:
  - approve
  - approve with limitations
  - reject only for a critical missing requirement

Do not create infinite improvement loops.

## Role boundary guidance

When acting as a builder:
- build, test, document, and leave verifiable output

When acting as QA:
- separate critical defects from optional polish

When acting as delivery/release:
- verify artifact existence, output discoverability, and handoff quality

When acting as CEO/CTO/PM:
- delegate, shape work, and preserve org clarity
- do not drift into random implementation if a specialist should do it

## Workspace discipline

Always verify where outputs actually landed.

Do not assume output is in the agent workspace.
Check whether output is in:
- the intended project folder
- the intended repo
- a project-managed workspace
- an unintended fallback location

If output landed in the wrong place, say so explicitly.

## Assignment discipline

Implementation tasks should be assigned to the relevant agent, not to the board user, unless the board user is intentionally reviewing.

## Practical behavior

Prefer:
- direct edits
- explicit commands
- concrete file paths
- short verification steps

Avoid:
- vague success claims
- "done" without proof
- excessive planning when the task is implementation-ready
- decorative organization
