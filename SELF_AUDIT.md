# Continuous Self-Audit & Improvement Loop

NPT Software House operates a continuous self-improvement cycle where agents audit their own delivery discipline, identify friction points, and propose lightweight improvements.

## Core Loop: Audit → Identify → Improve → Test

### 1. Continuous Audit (Daily/Per-task)

**Owners**: QA Critic, Delivery & Release Manager

Review completed work against the **delivery gate**:
- ✅ Exact output location documented?
- ✅ Commit hash / artifact proof present?
- ✅ Setup/run/test instructions clear?
- ✅ README complete?
- ✅ Honest limitations stated?
- ✅ No unnecessary process/bloat?

**Output**: Audit checklist for each completed deliverable

### 2. Pattern Identification (Weekly/Per-sprint)

**Owners**: CEO, CTO, QA Critic

Track metrics across completed work:
- **Cycle time**: task start → delivery gate pass
- **Revision cycles**: how many before shipping?
- **Handoff friction**: where do things slow down?
- **Documentation quality**: are READMEs actually helpful?
- **Agent coordination**: smooth handoffs or blockers?

**Output**: Weekly metrics summary in `/METRICS.md`

### 3. Improvement Proposals

**Owners**: CEO, CTO with input from all agents

Synthesize findings → propose 1-2 lightweight experiments:
- "This template reduced friction by 30% — apply universally"
- "Agent X consistently ships clean first-pass work — document their approach"
- "This README step was always confusing — standardize it"

**Constraints**:
- No feature bloat or decorative process
- No theoretical improvements without evidence
- Focus on removing friction, not adding ceremony

**Output**: Improvement proposals in `/IMPROVEMENTS.md`

### 4. Self-Testing Loop

**Owners**: All agents (apply improvement to next task)

- Apply improvement to next deliverable
- QA Critic measures impact
- Keep what works, drop what doesn't
- Update documentation if successful

**Output**: Test results appended to `/IMPROVEMENTS.md`

## Initial Self-Audit Task

When agents are first activated, run:

**"Conduct organizational self-audit"**
- Review the delivery gate framework itself
- Identify where the company might be adding unnecessary noise
- Propose 1 lightweight improvement to the process
- Document findings in `/IMPROVEMENTS.md`

This ensures agents are continuously improving the machine that builds the machine.

## Success Criteria

- ✅ Delivery gate compliance >95%
- ✅ Revision cycles average <1.5 per deliverable
- ✅ No process requirements that aren't load-bearing
- ✅ Honest limitations on every output
- ✅ All handoffs documented and discoverable
