# NPT Software House

**Name**: NPT Software House  
**Slug**: npt-software-house  
**Type**: Software Development Organization  
**Status**: Active

## Description

AI-powered software development organization building innovative 3D reconstruction and AI-based products with autonomous agent teams.

## Mission

Build reliable, scalable AI software products with strong delivery discipline and clear operational transparency.

## Organization (Phase 1: Pragmatic Structure)

**5 Core Active Agents + 1 Manual-Only:**

### Execution Spine (Autonomous Builders)
- **Software Engineer** - Full-stack development (300sec heartbeat)
- **ML Engineer** - AI/ML model integration (300sec heartbeat)
- **UI Developer** - Frontend & design (300sec heartbeat)

### Leadership & Quality
- **Tech Lead** - Technical architecture & unblocking via comments (600sec heartbeat)
- **Quality Gate** - Delivery standards enforcement (triggered-only on "ready-for-review")
- **CEO** - Strategic synthesis (manual-only, no heartbeat)

### Why This Structure?

Initial design: 8-agent autonomous team with CEO delegating and coordinating via API.

**Reality:** Paperclip sandbox blocks authenticated API calls. CEO cannot create subtasks, Tech Lead cannot fetch inbox.

**Pragmatic solution:** Humans create tasks, agents execute autonomously.
- Humans: Task creation in Paperclip UI (~10 min setup per phase)
- Builders: Autonomous execution (read/code/commit/test)
- Tech Lead: Async guidance via issue comments (10-min response)
- Quality Gate: Reviews when ready (no polling)
- CEO: Synthesis when explicitly invoked (/delegate command)

**Result:** Phase 1 ships in 5 days, ~4 hours human overhead, full builder autonomy within scope, proven workflow.

## Projects

1. **3D Civil Works** - AI 3D reconstruction from 2D images
2. **Onboarding** - Internal workflows and documentation

## Core Values

- Deterministic handoff with clear outputs
- Short review cycles (max 2 iterations)
- Low organizational noise
- Strong execution and shipping discipline

## Autonomous Agent Operating System

NPT operates as a **self-governing agent team** with clear roles, responsibilities, and communication protocols.

### Leadership & Delegation
- **CEO** leads the organization: delegates, monitors, communicates, unblocks, escalates
- **CTO** leads technical execution: architects, delegates to specialists, synthesizes
- Others execute their specialties and escalate when blocked

See [OPERATING_MANUAL.md](OPERATING_MANUAL.md) for detailed role instructions.

### Continuous Communication
- **No meetings, all-async coordination** through issue comments
- **CEO posts daily standup** every heartbeat (every 5 minutes) for org transparency
- **@Mentions trigger action** only when someone needs to act now
- **Status visible in issues** — blockers, dependencies, progress all documented

See [COMMUNICATION_PROTOCOL.md](COMMUNICATION_PROTOCOL.md) for the full protocol.

### Continuous Improvement (Two Levels)

**Level 1: Delivery Process Improvement (Org-wide)**
- Weekly audit of delivery standards, cycle time, handoff quality
- Agents identify friction in HOW we work
- Propose lightweight process improvements
- Test and measure impact
- See [SELF_AUDIT.md](SELF_AUDIT.md)

**Level 2: Product Improvement (Phase-based)**
- After each phase completes, evaluate the actual deliverables
- Analyze trade-offs, identify improvements, extract learnings
- Decide: improve now (high-impact) or defer to next phase
- Update next phase scope and estimates with real data
- See [PHASE_REVIEWS.md](projects/3d-civil-works/PHASE_REVIEWS.md)

**Result:** Continuous feedback loop where each phase learns from the previous, making estimates better, reducing risks, and improving product quality over time.
