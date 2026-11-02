# 0006. Personal use with Store-safe engineering

- Status: Accepted
- Date: 2026-11-03

## Context

The extension is built for personal use. Store publication is not a goal, but two facts matter: Raycast review allows calling system binaries and depending on installed apps, and the icon chosen for the personal build is taken from `AmneziaWG.app`.

## Decision

Keep the engineering Store-compatible: no root, no privileged helper, no Keychain access, system binaries via `execFile`, a helpful empty state when AmneziaWG is missing, and English UI and documentation. Do not pursue publication. Use the AmneziaWG icon locally and document its provenance.

## Consequences

- The build stays portable and would need only an original icon, README adjustments and metadata work if publication were ever reconsidered.
- The icon is not covered by the repository's MIT license and must not be redistributed or shipped to the Store; the README states this explicitly.
- No private API or entitlement depends on the unsigned/development distribution model.
