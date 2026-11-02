# 0005. Switch profiles silently

- Status: Accepted
- Date: 2026-11-03

## Context

AmneziaWG keeps a single tunnel at a time. A spike showed that starting one profile disconnects the other, so connecting a second profile always terminates the current session. A confirmation dialog, or blocking the switch, would protect the user from an unexpected disconnect but adds friction to the main scenario.

## Decision

Connecting a profile does not ask for confirmation. The previous tunnel drops because the system enforces a single active tunnel; the extension reports the outcome with a HUD and reloads the list.

## Consequences

- The quick toggle stays a single keystroke.
- Users may lose an active session by pressing Enter on another profile; the list immediately reflects the new state.
- macOS may leave the old service in `Disconnecting` after the tunnel has moved. Because the single-tunnel rule is enforced by the system, such a row is rendered as `Disconnected` while another profile is `Connected`.
- If AmneziaWG ever supports concurrent tunnels, this ADR must be revisited.
