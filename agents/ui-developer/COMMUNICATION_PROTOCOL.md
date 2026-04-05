# Communication Protocol

How agents in NPT Software House communicate, coordinate, and stay transparent.

---

## Principle: Async-First, Issues Are The Source Of Truth

- **Issue comments** are the primary communication channel
- **No direct agent-to-agent messaging** (agents communicate through issues)
- **CEO is the hub** — CEO reads all comments and keeps org aligned
- **Transparency by default** — all decisions, blockers, status visible in issues
- **Mentions trigger action** — use `@Name` sparingly when someone needs to act now

---

## Issue Comment Format

Every issue comment should follow this structure:

```
## [Status/Action]

[1-2 sentence summary of what changed]

- Bullet 1: specific detail
- Bullet 2: specific detail
- Bullet 3: what's next?

[Links to related issues if applicable]

[Mention next owner if needed: @OwnerName]
```

### Example (Good)

```
## Status: Unblocked

ML framework decision made: using PyTorch. You can now proceed with architecture.

- Decision: PyTorch (best ecosystem for our use case)
- Docs: See [DECISION.md](#) for trade-off analysis
- Next: Complete ml-architecture.md by next heartbeat
- Blockers: None

@MLEngineer you're unblocked, go ahead.
```

### Example (Bad)

```
Still working on research.
```

*(Too vague. What research? Why? How long? What's blocking? Who needs to act?)*

---

## Status Transparency

### Required Status Information

Every task should have visible:

1. **Current status** (todo, in_progress, blocked, done)
2. **Last update** (when? how many runs ago?)
3. **Owner** (who is working on it?)
4. **Blockers** (if blocked: what specifically? who can unblock?)
5. **Dependencies** (waiting on what? unblocks what?)
6. **Next milestone** (what's the next concrete step?)

### Status Labels in Comments

Use these tags in your comment header to make status obvious:

- `## Status: [In Progress]` — actively working, progressing
- `## Status: [Blocked]` — stuck, waiting on someone
- `## Status: [Done]` — completed, deliverable delivered
- `## Status: [Unblocked]` — previously blocked, now can proceed
- `## Status: [Delegated]` — new subtasks created, work assigned
- `## Status: [Escalated]` — human decision needed

---

## Dependency Notation

Use these tags to make dependencies crystal clear:

### Waiting On
```
**Waiting on:** [NPTAAAA-5](/NPTAAAA/issues/NPTAAAA-5) (CTO decision on tech stack)
**Blocked by:** @CTO (need guidance on architecture)
```

### Unblocks
```
**This unblocks:**
- [NPTAAAA-9](/NPTAAAA/issues/NPTAAAA-9) (Software Engineer can now design backend)
- [NPTAAAA-10](/NPTAAAA/issues/NPTAAAA-10) (UI Developer can now select viewer)
```

### Example Task with Dependencies

```
## Status: In Progress

Researching ML approaches for 3D reconstruction.

**Waiting on:** None (research is independent)

**This unblocks:**
- [NPTAAAA-9](/NPTAAAA/issues/NPTAAAA-9) (needs to know which ML framework → backend tech stack choice)
- [NPTAAAA-6](/NPTAAAA/issues/NPTAAAA-6) (CEO synthesis, once all three streams done)

**Progress:**
- Completed NeRF vs SfM comparison
- Decided: Structure-from-Motion best for civil works (faster, lower compute)
- Writing architecture doc now

**Next:** Finish ml-architecture.md by next run. Expected done next heartbeat.
```

---

## Blocker Communication

When you're blocked, **be specific.** Don't say "waiting on research." Say what specifically blocks you and who needs to act.

### Blocker Format

```
## Status: Blocked

[What you're blocked on in 1 sentence]

**Specific blocker:** [exact detail that stops you]
**Who can unblock:** @PersonName or @CEO
**What they need to do:** [explicit action or decision]
**Impact:** [what gets delayed if not unblocked]

Example: "I can't pick a backend framework until I know which ML pipeline we're using."
```

### Good Blocker Example

```
## Status: Blocked

Awaiting ML architecture decision to design backend.

**Specific blocker:** Which ML framework? (PyTorch vs TensorFlow)
**Who can unblock:** @CTO (technical decision)
**What they need to do:** Choose framework + document why
**Impact:** Backend design is blocked. Software Engineer waiting.

@CTO can you decide by next heartbeat?
```

### Bad Blocker Example

```
Waiting on research.
```

*(What research? Who's doing it? When? What specifically do you need?)*

---

## Mention Protocol

`@Mentions` trigger a heartbeat for that agent. Use them sparingly and only when:

1. **Someone needs to act now** (not "FYI")
2. **You're blocked and need their decision**
3. **You're unblocking them and they should proceed**
4. **You need immediate feedback**

### Good Mention Examples

- `@CTO can you decide between PyTorch and TensorFlow? I'm blocked.`
- `@MLEngineer you're unblocked, the architecture doc is ready.`
- `@CEO this task is stuck, can you escalate?`

### Bad Mention Examples

- `@MLEngineer fyi I'm starting my work` (no action needed)
- `@Everyone status check` (lazy, expensive)
- Mentioning someone with no specific ask (vague)

---

## CEO Daily Standup

The CEO posts a **daily standup** (every 5-minute heartbeat minimum) that gives the organization a unified view.

### Standup Format

```
## CEO Daily Standup — [date/time]

### Status Summary
- X tasks completed today
- Y tasks blocked/waiting
- Z new tasks delegated

### Completed This Run
- [NPTAAAA-1](/NPTAAAA/issues/NPTAAAA-1) ✅ (what was done)
- [NPTAAAA-2](/NPTAAAA/issues/NPTAAAA-2) ✅ (what was done)

### In Progress (On Track)
- [NPTAAAA-3](/NPTAAAA/issues/NPTAAAA-3) (CTO, 2/3 subtasks done, on schedule)
- [NPTAAAA-4](/NPTAAAA/issues/NPTAAAA-4) (ML Engineer, progressing well)

### Blocked (Needs Attention)
- [NPTAAAA-5](/NPTAAAA/issues/NPTAAAA-5) (waiting on CEO decision on scope)
  - **Specific blocker:** Product scope question (point clouds OR meshes?)
  - **Action needed:** Human input (business decision)

### Next Priorities
- Synthesize 3D pipeline architecture (all streams will be done next run)
- Unblock scope decision for NPTAAAA-5
- Start UI design once viewer research complete

---
```

### Why Daily Standup?

- **Transparency:** Everyone sees org status without asking
- **Early warning:** Blockers visible before they become critical
- **Accountability:** CEO's job is visible
- **Async coordination:** Agents don't need to wait for meetings, they read standup

---

## Escalation Triggers

CEO escalates to human when:

| Trigger | Escalation Format |
|---------|-------------------|
| Task blocked 2+ runs, no new context | "This task stuck, needs human guidance: [link] [specific question]" |
| Business/product decision needed | "Need scope decision: do we support [A] or [B]? Impact: [X weeks/cost]" |
| Budget overrun | "Task [link] costs $X more than budgeted. Proceed?" |
| Multiple agents interdependent, can't resolve | "CTO and ML Engineer can't decide on [topic]. Needs CEO decision." |
| Policy violation or safety concern | "Immediate escalation: [issue]" |

### Escalation Format

```
## Escalating: [specific decision needed]

This task cannot proceed without human input.

**What's blocked:** [NPTAAAA-X](/NPTAAAA/issues/NPTAAAA-X)
**Specific question:** [1-2 sentence decision needed]
**Context:** [why this matters, impact if delayed]
**Options:** 
- Option A: [pros] [cons]
- Option B: [pros] [cons]

**Recommendation:** Option A (because X)

Please advise. Awaiting your decision.
```

---

## Comment Best Practices

### DO

- ✅ Be specific (name the blocker, name the next step)
- ✅ Post even small updates (shows progress)
- ✅ Link related issues (context matters)
- ✅ Use status tags (`## Status: [...]`)
- ✅ Mention relevant agents once per run max
- ✅ Explain trade-offs when making decisions
- ✅ Update status the moment something changes (don't batch)

### DON'T

- ❌ Post vague status ("working on it")
- ❌ Mention someone without a specific ask
- ❌ Create new blockers without saying who can unblock
- ❌ Batch updates (post when things change, not end of day)
- ❌ Assume someone read your comment (mention them if action needed)
- ❌ Leave tasks idle without update (post status even if no progress)
- ❌ Escalate without specific question (give human the context upfront)

---

## Meeting Notes

Agents do NOT have synchronous meetings. All coordination is async in issues.

**Why?**
- Meetings are expensive (interrupt flow, require everyone awake simultaneously)
- Issues create permanent record (decisions visible forever)
- Async allows agents to work in parallel

**If sync discussion needed:**
- Post issue comment: "Need 5 min discussion on [topic], reply in comments"
- Read replies, decide, post decision in comment
- That's it — no meeting

---

## Frequency

- **Status updates:** Every heartbeat (every 5 minutes) if you took action
- **Blockers:** Immediately when blocked, not at end of day
- **CEO standup:** Every heartbeat (CEO wakes every 5 min)
- **Synthesis:** Immediately when subtasks complete, don't wait
- **Escalations:** As soon as you identify need, don't let issues fester

---

## Example: Full Communication Flow

### Hour 0: Task Delegated
```
CEO: ## Status: Delegated

Delegated 3D pipeline architecture to @CTO.
- [NPTAAAA-3](/NPTAAAA/issues/NPTAAAA-3) assigned to CTO
- Three parallel streams created for ML, backend, UI
- Expect results by end of sprint

@CTO please coordinate and deliver.
```

### Hour 0:30 (5 min later, CTO heartbeat)
```
CTO: ## Status: Delegated to reports

Broke architecture task into 3 parallel streams:
- [NPTAAAA-8](/NPTAAAA/issues/NPTAAAA-8) → @MLEngineer (ML framework decision)
- [NPTAAAA-9](/NPTAAAA/issues/NPTAAAA-9) → @SoftwareEngineer (backend design)
- [NPTAAAA-10](/NPTAAAA/issues/NPTAAAA-10) → @UIDeveloper (viewer selection)

All three are independent. You can work in parallel.

@MLEngineer @SoftwareEngineer @UIDeveloper please start and keep CEO updated.
```

### Hour 1:00 (ML Engineer hits blocker)
```
MLEngineer: ## Status: Blocked

Need framework decision before I finish architecture.

**Specific blocker:** PyTorch vs TensorFlow vs JAX?
**Who can unblock:** @CTO (technical decision)
**What you need:** Framework choice + rationale
**Impact:** Architecture doc blocked, can't proceed

@CTO which framework and why?
```

### Hour 1:05 (CTO responds)
```
CTO: ## Status: Unblocked

Framework decision: PyTorch.

**Why:** Largest ecosystem, best for NeRF/SfM, easiest integration with our tech stack.
**Trade-off:** TensorFlow also good but more enterprise-focused, overkill for us.

You're unblocked. Proceed with architecture.

@MLEngineer finish ml-architecture.md by next heartbeat.
```

### Hour 2:00 (All three streams complete)
```
MLEngineer: ## Status: Done

ml-architecture.md complete.
- File: `/projects/3d-civil-works/docs/ml-architecture.md`
- Selected: Structure-from-Motion (faster, lower compute than NeRF)
- Framework: PyTorch + COLMAP
- Next: Ready for integration once backend/viewer specs done

@CTO please review and proceed with synthesis.
```

```
SoftwareEngineer: ## Status: Done

fullstack-design.md complete.
- File: `/projects/3d-civil-works/docs/fullstack-design.md`
- Tech stack: Flask (backend) + PostgreSQL + S3 (storage)
- API: Image upload, job polling, model retrieval
- Ready for implementation phase

@CTO please review.
```

```
UIDeveloper: ## Status: Done

viewer-spec.md complete.
- File: `/projects/3d-civil-works/docs/viewer-spec.md`
- Selected: Three.js (best for civil works, great performance)
- Features: orbit, zoom, measure, layer toggle, export
- UI: Canvas + sidebar + toolbar layout

@CTO please review.
```

### Hour 2:05 (CEO runs, synthesizes)
```
CEO: ## Status: Synthesized

All three architecture streams complete. Synthesized into unified IMPLEMENTATION.md.

**Completed streams:**
- [NPTAAAA-8](/NPTAAAA/issues/NPTAAAA-8) ✅ ML: PyTorch + COLMAP + SfM
- [NPTAAAA-9](/NPTAAAA/issues/NPTAAAA-9) ✅ Backend: Flask + PostgreSQL + S3
- [NPTAAAA-10](/NPTAAAA/issues/NPTAAAA-10) ✅ UI: Three.js + orbit controls

**Unified architecture:** `/projects/3d-civil-works/IMPLEMENTATION.md`

**Key decisions:**
- Pipeline: image upload → SfM processing → model storage → Three.js viewer
- MVP timeline: 4 weeks (weeks 1-2 backend, weeks 2-3 ML, weeks 3-4 UI)
- Known limitation: single-image models only (research multi-view next phase)

[NPTAAAA-3](/NPTAAAA/issues/NPTAAAA-3) now complete. Ready for implementation phase.

Next: @CTO create implementation issues for each phase.
```

---

This is how an autonomous organization communicates: **clear, transparent, async-first, blockers surfaced immediately, decisions visible forever.**
