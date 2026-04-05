# Agent Workflow for ADHD Assessment Dashboard

This document explains how agents discover, execute, and track work for this project.

## Task Discovery (Replacing Paperclip API)

### Problem
Paperclip sandbox blocks API calls, so agents cannot fetch their inbox programmatically.

### Solution
Agents read `.TASKS.md` file in the project root instead of Paperclip API.

## Workflow Steps

### 1. At Start of Heartbeat
Agent reads `.TASKS.md` and looks for incomplete tasks:
```markdown
- [ ] 1.1 - Task Name (incomplete)
- [x] 1.2 - Task Name (complete)
```

### 2. Pick a Task
Select an incomplete task `[ ]` from your role section.

### 3. Implement
- Read the task description (in the issue or inline documentation)
- Write code, tests, documentation
- Work in the local working directory
- Run tests to verify functionality

### 4. Commit with Clear Message
```bash
git add .
git commit -m "Implement 1.1 - Backend Setup & Question Bank

Add 20 screening questions from ASRS v1.1 standard.
Each question: id, text, category (inattention/hyperactivity).
Questions array in backend/api/quiz.py.

Test coverage: 6 tests passing (scoring, edge cases, validation).

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

**Commit message must include:**
- What was implemented (task number and name)
- Why (brief rationale)
- What files changed
- Test results

### 5. Update `.TASKS.md`
Change the task status and add metadata:

**Before:**
```markdown
- [ ] 1.1 - Backend Setup & Question Bank Implementation
```

**After:**
```markdown
- [x] 1.1 - Backend Setup & Question Bank Implementation
  - Status: COMPLETE
  - Commit: abc1234def567
  - Output: backend/api/quiz.py
  - Tests: 6/6 passing
```

### 6. Push to GitHub
```bash
git push origin main
```

### 7. Communication
If needed, post status in issue comments or @mention tech-lead for blockers.

## Example: Task 1.1 Complete

**Agent:** Software Engineer  
**Task:** 1.1 - Backend Setup & Question Bank Implementation  

**Steps:**
1. Read `.TASKS.md` → See task 1.1 is incomplete `[ ]`
2. Open `backend/api/quiz.py` → See TODO comment
3. Add 20 questions from `docs/QUESTIONS.md`
4. Test locally: `python -c "from api.quiz import QUESTIONS; print(len(QUESTIONS))"`
5. Commit with message explaining what was added
6. Update `.TASKS.md`:
   ```markdown
   - [x] 1.1 - Backend Setup & Question Bank Implementation
     - Status: COMPLETE
     - Commit: 0d1efdc
     - Output: backend/api/quiz.py (20 questions)
     - Tests: Verified question count and structure
   ```
7. Push to GitHub

## Blocking & Coordination

### If Blocked
Post in issue comments:
```
@tech-lead — Blocked on task 1.2. Question: Should I use single-image or stereo depth estimation?
```

Tech Lead responds with guidance in comments.

### If Waiting on Another Agent
Example: UI Developer waiting on Software Engineer API endpoint:
```
@software-engineer — Waiting on POST /api/quiz/submit endpoint for task 1.4. ETA?
```

## Status Tracking

**Human (optional):** At end of day, review `.TASKS.md` to see progress:
```bash
git log --oneline -10
cat .TASKS.md
```

**Automated:** Tech Lead reads `.TASKS.md` every 10 minutes to track progress and identify blockers.

## Handoff to Quality Gate

When all tasks in a phase are complete:
1. All tasks marked `[x]` in `.TASKS.md`
2. All commits pushed to GitHub
3. README updated with setup/test instructions
4. Known limitations documented

Quality Gate reviews `.TASKS.md` and GitHub for verification.

## Summary

| Step | Agent | Action |
|------|-------|--------|
| 1 | Any | Read `.TASKS.md` for assigned tasks |
| 2 | Any | Pick incomplete task `[ ]` |
| 3 | Any | Implement code, tests, docs locally |
| 4 | Any | Commit with clear message |
| 5 | Any | Update `.TASKS.md` with status + commit hash |
| 6 | Any | Push to GitHub |
| 7 | Tech Lead | Monitor for blockers, post guidance |
| 8 | Quality Gate | Review completion and deliverables |
