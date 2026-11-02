# 0004. One List command, state-only status, refresh on action

- Status: Accepted
- Date: 2026-11-03

## Context

The primary scenario is a quick toggle: open Raycast, pick a profile, press Enter. A menu-bar command, deep status details and continuous polling were considered. `scutil --nc status` exposes an `Extended Status` dictionary, but its shape is undocumented. Raycast stops a command once the action handler returns, so any waiting must happen inside the handler.

## Decision

- Ship one List command in the MVP; no menu-bar command. (ADR-0007 later adds a second, no-view toggle command; the list remains the only UI.)
- Show connection state only: `Connected`, `Connecting`, `Disconnected`, `Disconnecting`, `Invalid`.
- Refresh on command open, on ⌘R and after each action. No background polling.
- After `start`/`stop`, poll `status` every 500 ms until the settled state, for at most 15 seconds, and await that inside the action.

## Consequences

- The UI never gets stuck in `Connecting` after an action, while staying idle when nothing happens.
- An action can take up to 15 seconds before it reports; the animated toast covers it.
- Details such as endpoint and throughput are out of scope; adding them later means parsing `Extended Status` and accepting its fragility.
