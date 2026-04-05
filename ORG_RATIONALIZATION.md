# Organization Rationalization Report

**Date:** April 5, 2026  
**Reason:** Restructure for lean, deterministic delivery of AI software products  
**Scope:** This is a Paperclip company export reorganization. Changes can be re-imported.

---

## Executive Summary

The company was reorganized from 15 agents to 8 active agents. Seven non-core roles were archived without deletion, preserving the option to restore them later.

The new structure prioritizes:
- **Deterministic delivery**: every output has verifiable proof
- **Lean execution**: no generic or overlapping roles
- **Short review loops**: maximum 2 revision cycles for any task
- **Clear role boundaries**: each agent has a specific, sharply differentiated job
- **Strong handoff discipline**: outputs are always discoverable and runnable

---

## Active Agents (8)

These agents form the core execution spine of the company:

### CEO (delegate, don't do)
- **Role:** Strategic direction, organizational leadership, delegation
- **Reports to:** N/A
- **Direct reports:** CTO, Product Manager, QA Critic, Delivery & Release Manager
- **Key behavior:** Delegates all implementation work. Routes requests to the right owner. Keeps org lean.

### CTO (technical leadership, not implementation)
- **Role:** Technical architecture, work decomposition, technical standards
- **Reports to:** CEO
- **Direct reports:** Software Engineer, ML Engineer, UI Developer
- **Key behavior:** Owns technical coherence. Breaks work into subtasks for engineers. Does not do QA or delivery work.

### Product Manager (problem framing, not implementation)
- **Role:** Problem definition, acceptance criteria, scope clarity, delivery sequencing
- **Reports to:** CEO
- **Direct reports:** None (coordinates with CTO and engineers)
- **Key behavior:** Defines what to build before engineering starts. Clarifies scope. Does not write code.

### Software Engineer (backend and integration implementation)
- **Role:** Backend, APIs, integrations, application code
- **Reports to:** CTO
- **Direct reports:** None
- **Key behavior:** Builds clean, tested code with explicit output proof (commit hash, changed files, run/test instructions, README, limitations).

### ML Engineer (model and reconstruction work)
- **Role:** Model development, training, fine-tuning, evaluation, validation
- **Reports to:** CTO
- **Direct reports:** None
- **Key behavior:** Develops and validates models with documented assumptions, clear validation approach, and honest limitations.

### UI Developer (frontend and viewer implementation)
- **Role:** React components, interactive viewer, upload flow, result UI
- **Reports to:** CTO
- **Direct reports:** None
- **Key behavior:** Implements UI to spec. Does NOT define product/UX (that's Product Manager). Delivers verifiable, tested components.

### QA Critic (quality gatekeeper, not deliverer)
- **Role:** Output review, quality validation, structured feedback
- **Reports to:** CEO
- **Direct reports:** None
- **Key behavior:** Reviews engineer outputs. Separates critical defects from optional polish. Maximum 2 review cycles. Biased toward shipping.

### Delivery & Release Manager (discoverability gatekeeper, not doer)
- **Role:** Output discoverability, artifact verification, delivery gate enforcement
- **Reports to:** CEO
- **Direct reports:** None
- **Key behavior:** Verifies outputs are easy to find and run. Enforces hard delivery gate (location, commit, files, README, run/test steps, limitations).

---

## Archived Agents (7)

These roles were removed from the active company structure to reduce organizational sprawl and eliminate redundancy at the current project stage. They are preserved in `archive/disabled-agents/` and can be restored if needed.

### 1. CHRO (Chief Human Resources Officer)
**Why archived:** Talent management and recruiting are premature at current scale. The company doesn't need dedicated HR infrastructure to run a 3-person technical team. Hiring decisions are handled by CEO and CTO directly.

### 2. DevOps Engineer
**Why archived:** Infrastructure needs are minimal until the product reaches scale. Current work (local development, GitHub repos, simple deployment) doesn't require dedicated DevOps. This can be re-added when production infrastructure becomes complex.

### 3. Insider
**Why archived:** User research and user-voice synthesis are valuable but can be absorbed by Product Manager initially. As the company grows, a dedicated user research role can be restored.

### 4. Legal Assistant
**Why archived:** Compliance review is not urgent at MVP stage. Can be restored when legal/compliance becomes a critical path item. Current focus is on building.

### 5. Prompt Engineer
**Why archived:** Agent instruction writing was consolidating too much work into a single non-technical role. Instead, each agent's instructions are owned by the role owner (CEO for CEO instructions, etc.) and refined by the specialized team. This reduces a hand-off and clarifies responsibility.

### 6. Skills Master
**Why archived:** Skills curation and discovery can be handled ad-hoc by the team based on immediate needs. When the company has more specialized roles or a larger engineering team, this role can be restored to manage a larger skills ecosystem.

### 7. UX Designer
**Why archived:** UX research and design are valuable but can be handled as needed through external consultants or by Product Manager. The distinction between "Product Manager defines what to build" and "UX Designer researches how to build it" was creating unnecessary handoff friction. Current focus is on engineering the MVP.

---

## New Reporting Structure

```
CEO (delegate)
├── CTO (technical leadership)
│   ├── Software Engineer (backend/integration)
│   ├── ML Engineer (model/reconstruction)
│   └── UI Developer (frontend/viewer)
├── Product Manager (problem framing)
├── QA Critic (quality gate)
└── Delivery & Release Manager (discoverability gate)
```

- **No other reporting lines**
- **No dotted lines or matrix reporting**
- **Clear, flat structure below CEO**
- **Direct reports have sharp, non-overlapping responsibilities**

---

## Key Changes

### Heartbeat Policy

Removed aggressive interval polling. All agents keep heartbeat enabled but only wake on actual work (tasks, comments, manual) rather than constant loops.

- ✅ CEO: heartbeat enabled (grace-based wake-up)
- ✅ CTO: heartbeat enabled (no interval)
- ✅ Product Manager: heartbeat enabled (no interval)
- ✅ Software Engineer: heartbeat enabled (no interval)
- ✅ ML Engineer: heartbeat enabled (no interval)
- ✅ UI Developer: heartbeat enabled (no interval)
- ✅ QA Critic: heartbeat enabled (no interval)
- ✅ Delivery & Release Manager: heartbeat enabled (no interval)

**Rationale:** Constant polling creates noise and wasted compute. Work should pull in agents via tasks, comments, or explicit assignment, not timers.

### Role Differentiation

Each agent now has a sharply different job:

| Agent | Implements | Delegates | Reviews | Gates |
|-------|-----------|-----------|---------|-------|
| CEO | Never | Everything | Strategy | Org clarity |
| CTO | Never | Tech tasks | Architecture | Tech coherence |
| Product Manager | Never | Impl. work | Scope | Acceptance criteria |
| Software Engineer | Backend/APIs | — | Code quality (accepts from QA) | — |
| ML Engineer | Models | — | Validation (accepts from QA) | — |
| UI Developer | Frontend | — | UI quality (accepts from QA) | — |
| QA Critic | Never | — | Everything | Quality gate |
| Delivery & Release Manager | Never | — | Proof | Delivery gate |

### Definition of Done

An implementation task is NOT done unless:

1. **Required functionality** is implemented per acceptance criteria
2. **Output exists** in the configured repo or local folder
3. **Artifact proof** is present (commit hash or equivalent)
4. **Commit/artifact list** shows all changed files
5. **README** exists and explains what was built and how to run it
6. **Setup/run/test instructions** are included when relevant
7. **Remaining issues** are non-critical (optional improvements, not missing features)

This definition is enforced by Delivery & Release Manager and stated in the required completion format.

### Delivery Gate Format

Every implementation completion must include:

```
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
```

**Rationale:** Eliminates ambiguity. Proves work is verifiable and runnable. Enables the board to independently find and test outputs.

### QA Critic vs. Delivery & Release Manager

These are now distinct gates:

**QA Critic:**
- Focuses on **quality and correctness**
- Reviews against acceptance criteria
- Identifies defects and improvements
- Maximum 2 review cycles
- Biased toward shipping strong usable output
- Not responsible for discoverability or handoff proof

**Delivery & Release Manager:**
- Focuses on **verifiability and discoverability**
- Checks that all proof is present
- Ensures output is easy to find and run
- Not responsible for code quality or feature completeness
- Strict on proof, pragmatic on perfection

This separation prevents scope creep and keeps review loops short.

### Anti-Infinite-Loop Policy

Both QA Critic and Delivery & Release Manager enforce hard limits on revision cycles:

- **First submission:** Full review
- **Second submission:** Check critical issues only
- **Final decision:** Approve, approve with limitations, or reject only for critical missing requirement

This prevents endless polish loops and bias toward shipping.

---

## Operational Principles

### Principle 1: Delegate, Don't Do
- CEO delegates all implementation work
- CTO delegates all engineering work
- Product Manager never writes code
- Builders (Software Engineer, ML Engineer, UI Developer) focus on execution
- QA and Delivery don't build, only verify

### Principle 2: Output Proof is Non-Negotiable
- Every task must end with verifiable artifacts
- Commit hashes prove code work
- READMEs prove clarity
- Run/test instructions prove reproducibility
- No "done" without proof

### Principle 3: Short Review Loops
- Maximum 2 cycles after first submission
- After second cycle: approve or reject, no endless iterations
- Separate critical from optional
- Bias toward shipping strong usable output

### Principle 4: Role Clarity
- Each agent owns one sharp responsibility
- No overlapping "also responsible for"
- Clear escalation paths
- No generic handoffs

### Principle 5: Lean Over Decorated
- 8 focused agents beat 15 generic ones
- No decorative roles
- No roles that exist "just in case"
- Preserve option to hire later, but don't keep empty seats

---

## Archival and Restoration

Archived agents are preserved in:
```
archive/disabled-agents/<agent-slug>/
```

Each disabled agent folder contains:
- Original AGENTS.md
- Any supporting files
- A note explaining why it was archived

**To restore an archived agent:**
1. Move the folder from `archive/disabled-agents/<agent-slug>/` back to `agents/`
2. Update `.paperclip.yaml` to add the agent back to the agents section
3. Update the sidebar to include the agent
4. Re-import the company into Paperclip

---

## Success Criteria for This Reorganization

This restructuring succeeds if:

- ✅ Every output is easy to find (Delivery & Release Manager's job)
- ✅ Outputs are always verifiable (commit hash, files, run steps, README)
- ✅ Reviews stay short (2 cycles max)
- ✅ Roles don't overlap (clear ownership)
- ✅ No agents are generic ("keep work moving")
- ✅ The board can independently test outputs
- ✅ No "done but where is it?" situations occur
- ✅ Org stays lean (8 agents, not 15)
- ✅ Delivery cycles are fast (days, not weeks)

---

## Summary

The company is now organized around strong delivery discipline. Each agent has a clear job. Outputs are always verifiable. Review loops are short. The organization is lean but sharp.

The archived agents are not deleted, and can be restored later if the company grows or needs change. But for now, the focus is on building and shipping the 3d-civil-works product with operational precision.

**Next step:** Re-import this company into Paperclip and begin using the new role definitions and delivery gates immediately.
