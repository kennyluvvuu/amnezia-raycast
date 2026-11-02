# 0003. Manage existing profiles only

- Status: Accepted
- Date: 2026-11-03

## Context

AmneziaWG profiles contain private keys. The app keeps its configuration in a NetworkExtension store and the Keychain, and its App Group container is not readable. Creating, editing, importing or deleting a profile would require writing to that store or driving the GUI, both of which are fragile and involve secrets.

## Decision

The extension only lists existing profiles and toggles them. Profile creation, editing, deletion and `.conf` import stay in `AmneziaWG.app`.

## Consequences

- The extension never reads, writes or stores private keys and needs no Keychain access — a requirement for Raycast Store review.
- Users with no profiles get an empty state that points them to the app and to the App Store listing.
- A profile renamed in the app is picked up on the next reload because the list is read live from `scutil`.
