# Archived Agents

This directory contains agents that were removed from the active company organization during the April 2026 org rationalization.

## Why They Were Archived

The company was restructured to prioritize lean, deterministic delivery of AI software products. The active 8-agent structure focuses on:
- CEO: strategic direction and delegation
- CTO: technical architecture and work decomposition  
- Product Manager: problem framing and acceptance criteria
- Software Engineer: backend/integration implementation
- ML Engineer: model/reconstruction work
- UI Developer: frontend/viewer implementation
- QA Critic: quality gate and structured review
- Delivery & Release Manager: output discoverability and delivery gate enforcement

The following roles were archived because they created organizational sprawl at the current project stage without adding critical execution value:

- **chro**: Talent and HR work is premature at current scale
- **devops-engineer**: Infrastructure needs are minimal until scale-up phase
- **insider**: User research is valuable but can be absorbed by Product Manager initially
- **legal-assistant**: Compliance review will be added when needed
- **prompt-engineer**: Agent instruction writing is handled by the specialized rewrite
- **skills-master**: Skills curation is handled on-demand
- **ux-designer**: Design is distinct from product definition and can be resource-based when needed

## Restoration

If any of these roles are needed in the future, move the corresponding folder from `archive/disabled-agents/<agent-slug>/` back to `agents/` and update `.paperclip.yaml` to restore them.
