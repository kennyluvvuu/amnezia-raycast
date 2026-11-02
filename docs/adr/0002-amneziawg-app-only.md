# 0002. Support AmneziaWG.app only

- Status: Accepted
- Date: 2026-11-03

## Context

Two Amnezia clients are installed: `AmneziaWG.app` (bundle `org.amnezia.awg`) and `AmneziaVPN.app`. They register different VPN service types and use different storage and lifecycle models. Supporting both would double the parsing, error handling and testing surface.

## Decision

Target services of type `org.amnezia.awg` exclusively. Every other VPN service reported by `scutil --nc list` is filtered out.

## Consequences

- The list contains only AmneziaWG profiles; PPP and third-party VPN services never appear.
- `AmneziaVPN.app` users are out of scope. Adding support later means a second adapter and a second set of fixtures, not a rewrite of the UI.
- Filtering by the service type in parentheses, not by substring matching the line, keeps similarly named services out.
