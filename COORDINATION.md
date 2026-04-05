# Agent Coordination & Workflow

## The Constraint

Paperclip sandbox blocks authenticated API calls needed for autonomous agent coordination:
- CEO cannot create subtasks via API
- Tech Lead cannot fetch inbox via API
- Agents cannot programmatically update task status

**Decision:** Accept human-managed task creation + agent execution.

This removes the coordination bottleneck (API calls) and keeps agents focused on what they do best: **execution**.

---

## Phase 1 Workflow (5 Days)

### Day 1: Setup (10 minutes)

**Human creates 7 Phase 1 issues in Paperclip UI:**
1. 1.1 - GLB Mesh Format & glTF 2.0 Validation
2. 1.2 - Integrate MiDaS Depth Estimation Model
3. 1.3 - Implement Poisson Mesh Generation
4. 1.4 - Add Celery Async Job Queue
5. 1.5 - Implement SQLite Persistence Layer
6. 1.6 - Add Basic Auth & Rate Limiting
7. 1.7 - Document Deployment & Scaling

**Human assigns to builders:**
- Tasks 1.1, 1.4, 1.5, 1.6 → Software Engineer
- Tasks 1.2, 1.3 → ML Engineer
- Task 1.7 → UI Developer

**Total setup time:** 5 minutes (create) + 2 minutes (assign) = **7 minutes**

---

### Days 2-3: Execution (Autonomous)

**Each builder:**
1. Reads issue description from Paperclip
2. Runs tests locally
3. Writes code and implements solution
4. Commits with clear messages explaining "why"
5. Posts progress updates in issue comments
6. Posts blockers or questions as **@tech-lead** mentions

**Tech Lead (every 10 minutes):**
1. Checks for @mentions from builders
2. Reads blocker or question in comment
3. Posts technical guidance as response comment
4. Posts proactive architectural guidance if needed
5. Identifies and flags dependencies between tasks

**Human (async monitoring, 1-2 hours over 2 days):**
- Monitors Paperclip for progress
- Reads builder comments
- Reads Tech Lead responses
- Steps in if Tech Lead unavailable (rare)

**What builders see:**
```
Issue 1.2: Integrate MiDaS Depth Model

Description: Integrate MiDaS depth estimation model...

Comments:
[ML Engineer 10:30am]: Starting work on this. Reading MiDaS v3 docs.
[ML Engineer 10:45am]: @tech-lead - Should I use single-image mode or stereo? 
[Tech Lead 10:50am]: Single-image for MVP. See notes above re: performance.
[ML Engineer 11:00am]: Got it, proceeding with single-image approach.
[ML Engineer 2:30pm]: Model integration done. Running benchmarks. ETA 1 hour.
[ML Engineer 4:00pm]: Ready for review. Tests passing. Commit: abc1234
```

---

### Day 4: Quality Review

**Builder marks "ready-for-review" in issue comment**

**Quality Gate:**
1. Wakes up (triggered by "ready-for-review")
2. Checks delivery gate (README, tests, commit clarity, limitations, discoverability)
3. Posts review comment:
   - If approved: "✅ APPROVED FOR RELEASE"
   - If gaps: Lists specific gaps and asks for fixes

**If revision needed:**
- Builder fixes gaps
- Marks "ready-for-review" again
- Quality Gate verifies fixes
- Max 2 revision cycles per feature (enforced)

---

### Day 5: Release

**Human:**
1. Merges all approved PRs
2. Tags release (1.0.0-phase1)
3. Deploys

**Total human overhead for Phase 1:**
- Setup: 7 minutes
- Monitoring (async): 1-2 hours
- Review (async): 1 hour
- Release: 30 minutes
- **Total: ~3 hours**

---

## Key Principles

### 1. Humans Manage Task Creation (Low Friction)
- Create tasks once in Paperclip UI
- Assign to appropriate builder
- Exit
- No ongoing API calls, no polling, no automation complexity

### 2. Builders Execute Autonomously
- Read issue description
- Implement solution
- Commit and test
- Post progress in comments
- No waiting on CEO delegation or inbox checks

### 3. Tech Lead Provides Async Guidance
- Watches for @mentions and blockers
- Posts response within 10 minutes
- Saves builders from waiting on synchronous decisions
- Works without API (just comments)

### 4. Quality Gate Reviews on Demand
- Only wakes when code is ready
- Triggered manually, not polled
- Binary approve/reject
- Max 2 cycles (forces quality discipline)

### 5. No Infinite Coordination Loops
- 5-day timeline is fixed
- Revision cycles capped at 2
- Humans unblock if needed
- Move forward, don't optimize endlessly

---

## Comparison: Autonomous vs Pragmatic

| Aspect | Desired Autonomous | Pragmatic (Current) |
|--------|------------------|-------------------|
| Task creation | CEO creates via API | Human creates in UI |
| Task assignment | CEO assigns via API | Human assigns in UI |
| Builder execution | Autonomous | Autonomous ✅ |
| Tech guidance | Tech Lead fetches inbox, posts | Tech Lead watches mentions, posts ✅ |
| Status tracking | Agents update via API | Builders post in comments |
| Quality review | Triggered on ready | Triggered on ready ✅ |
| Release | Automated | Human merges ✅ |
| **Timeline** | **3-5 days** | **5 days** ✅ |
| **Human overhead** | **~1 hour** | **~3 hours** |
| **Works in sandbox** | ❌ (API blocked) | ✅ (comment-based) |

**Bottom line:** Pragmatic approach delivers same timeline, requires 2 more hours human time, and actually works in the sandbox.

---

## When Builders Block

**Scenario:** Builder @mentions tech-lead with blocker

```
@tech-lead I need guidance on error handling strategy for this service.
How should we handle timeouts?
```

**Tech Lead response (within 10 min):**

```
## Guidance: Timeout Handling

For timeout on depth estimation (currently ~5 sec):
1. Return 504 Gateway Timeout to client
2. Log failure with timestamp
3. Client can retry after 30 sec
4. If still failing, user manually re-uploads

See PR #123 for similar pattern in async queue.

This keeps the service responsive and lets clients retry without creating backpressure.
```

**Result:** Builder unblocked, proceeds, no API call needed, no delay.

---

## When Builders Conflict

**Scenario:** Software Engineer and ML Engineer both need auth token format

```
[Software Engineer]: @tech-lead - What format for auth tokens in requests?
[ML Engineer]: @tech-lead - Also need to understand token format for logging.
```

**Tech Lead:**

```
## Token Format Decision (Coordination)

**Format:** Bearer {session_id}_{timestamp}_{signature}

@software-engineer: Pass in Authorization header. See auth.py example.
@ml-engineer: Extract session_id for logging. Don't log full token.

Both of you: If you run into format mismatches, comment here.
```

**Result:** Builders coordinate without API calls, Tech Lead decides early.

---

## Scaling to Phase 2+

After Phase 1 ships:

**Option A: Stay with Pragmatic (Proven to Work)**
- Continue human task creation
- Same ~3 hours overhead per phase
- Works reliably in sandbox
- Perfectly acceptable for MVP

**Option B: Upgrade to File-Based Coordination**
- Create `.TASKS.json` file in repo
- Tech Lead watches file for changes
- Builders read file for assignments
- Slightly more autonomous, still human-managed
- Requires testing but possible

**Option C: Upgrade to Comment-Based Delegation**
- CEO proposes task breakdown in issue comment
- Human approves
- CEO delegates via @mentions in comment (not API)
- More autonomous but still comment-based
- Test viability in Phase 1

**Decision point:** After Phase 1, evaluate which upgrade is worth the complexity.

---

## What This Achieves

✅ **Phase 1 ships in 5 days** (original goal: same timeline)
✅ **Builders fully autonomous** (read/code/commit/test without waiting)
✅ **Tech Lead provides fast unblock** (10-min response via comments)
✅ **No API dependency** (works in sandbox)
✅ **Humans not bottlenecked** (10 min setup, 2-3 hours monitoring)
✅ **Quality enforced** (2-cycle max, delivery gate clear)
✅ **Design defensible** (pragmatic, not a hack)

---

## Handoff to Teams

When Phase 1 starts:

**Tell Software Engineer:**
"You have 5 issues assigned. Read the descriptions. Implement. Post progress in comments. If you're blocked on a design decision, @mention tech-lead. Tech Lead will respond within 10 minutes. Mark "ready-for-review" when done."

**Tell ML Engineer:**
Same as above.

**Tell UI Developer:**
Same as above.

**Tell Tech Lead:**
"Watch for @mentions from builders. Respond with technical guidance within 10 minutes. Post proactive guidance if you see risks. No need to fetch inbox or manage task state; humans handle that."

**Tell Quality Gate:**
"When a builder marks 'ready-for-review', wake up and check the delivery gate. List gaps or approve. Max 2 revision cycles per feature."

**Tell Human:**
"Create 7 issues in Paperclip. Assign them. Monitor for progress and blockers. Unblock if Tech Lead unavailable. Merge when Quality Gate approves. You'll spend ~3 hours over 5 days."

---

Done. Phase 1 starts tomorrow.
