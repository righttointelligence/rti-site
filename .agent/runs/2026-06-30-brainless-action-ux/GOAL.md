# Brainless Action UX

Goal ID: `2026-06-30-brainless-action-ux`
Started: 2026-06-30T21:47:21Z
Parent goal: none
Mode: full
Ledger path: `.agent/runs/2026-06-30-brainless-action-ux/`

## Objective

Convert the Free Intelligence/OII state action router into a brainless one-action UX: no user-facing instructions to search/read bills; every selected state shows one chosen best action, one target, one copyable message, one contact button, and secondary sources only.

## Goal Mode Coupling

When creating or updating the matching `/goal`, include this ledger pointer in the goal objective:

`Maintain the agent-owned ledger at /Users/saint/Dev/free-intelligence/.agent/runs/2026-06-30-brainless-action-ux/ and keep implementation-notes.html current at checkpoints, before compaction, and before final handoff. Execute this goal directly: read, design, implement, and validate with your own hands. Keep one continuous trace of the work.`

## Finishing Criteria

- [done] The selected-state card has one primary action, one exact ask, one copyable message, one official contact destination, and one confirmation loop.
- [done] The primary visible flow never asks visitors to search bills, read bills, check current bills, or figure out moving legislation before acting.
- [done] Sources, bill snapshots, extra official links, and provenance still exist, but are secondary and collapsed by default.
- [done] California, Colorado, Texas, and one low-activity state each show a usable official primary contact destination.
- [done] Copy and confirmation logging still work in browser/dev mode.
- [done] `bun run build` passes.
- [done] Keep `implementation-notes.html` current with status, decisions, tradeoffs, changes, validation, and next action.
- [done] Link large proof artifacts from `evidence/` when they are too bulky for the HTML notes.

## Escape Hatch

Pause, ask Saint, or mark a scoped item `[blocked]` / `[incomplete]` if:
- validation contradicts the goal
- the goal requires a scope change
- the agent is looping without measurable progress
- the next step risks deleting or rewriting durable memory
- the PRD and actual repo disagree
- the ledger itself contaminates validation
