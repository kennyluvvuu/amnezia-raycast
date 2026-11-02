# 0001. Control AmneziaWG through `scutil --nc`

- Status: Accepted
- Date: 2026-11-03

## Context

The extension must connect and disconnect existing AmneziaWG VPN profiles from Raycast. The ways to reach AmneziaWG on macOS were investigated:

- `AmneziaWG.app` ships no command-line tool, no URL scheme and no deep link.
- Its App Group container is not readable, and profile configurations live in NetworkExtension preferences and the Keychain. Handling private keys from an extension would be both fragile and unnecessary.
- `scutil --nc` exposes NetworkExtension VPN services; `list` and `status` work without privileges, and a live spike confirmed that `start` and `stop` also work without root, without launching the app, and without an authorization prompt.

## Decision

Shell out to `/usr/sbin/scutil --nc list|status|start|stop` using `execFile` with an argument array. Parse the undocumented textual output in-process.

## Consequences

- Works with the app closed and needs no helper, sudo, Keychain access or private-key handling.
- Depends on undocumented `scutil` output; parsing is isolated in `src/lib/parse.ts` and covered by fixtures.
- Only service-level operations are available: no endpoint, throughput or handshake details.
- The approach is compatible with Raycast Store review rules (calling known system binaries is explicitly allowed).
