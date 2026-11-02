# 0007. No-view toggle command with a last-used profile

- Status: Accepted
- Date: 2026-11-03

## Context

A single hotkey that turns the VPN on or off is faster than opening the list. A no-view Raycast command has no UI, so it must decide which profile to connect when nothing is active. Raycast offers `LocalStorage` for extension state; the profile name is not a secret and does not belong in the Keychain.

Connects made in AmneziaWG or System Settings cannot be observed, so "last used" can only mean "last connected through this extension".

## Decision

- Add the no-view command `toggle-connection`.
- If any profile is `connected` or `connecting`, disconnect it.
- Otherwise connect the last used profile stored under `last-used-profile` in `LocalStorage`. The list command updates the same key after a successful connect.
- If the stored name is missing, renamed or deleted, fall back to the first enabled profile alphabetically.
- Close the Raycast window immediately and report progress and the result through floating HUDs outside the window, never through in-window toasts.

## Consequences

- One keystroke toggles the VPN, with the same 15-second settle window as the list.
- The first run has no memory and uses the alphabetical fallback; a user with several profiles may need to connect the intended one from the list once.
- Connects made outside the extension are not remembered, but they are still detected and disconnected.
- The remembered name is local to this Mac and survives extension updates; it is a convenience cache, not configuration.
