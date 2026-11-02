# Glossary

Terms used across this project, the ADRs and the code. Definitions describe how this extension uses the words, not the general macOS meaning.

**Active profile** — A profile whose state is `connected` or `connecting`. The list sorts active profiles above the rest.

**AmneziaWG** — The macOS app (`org.amnezia.awg`) that provides AmneziaWG VPN profiles as NetworkExtension packet tunnels. It is the only client this extension controls.

**Last used profile** — The profile most recently connected through this extension, remembered in Raycast's extension storage under `last-used-profile`. The toggle command connects it when nothing is active. On a first run, a rename or a deletion it falls back to the first enabled profile alphabetically.

**NetworkExtension** — Apple's framework for VPN and content-filter providers. AmneziaWG registers each profile as a VPN service backed by `org.amnezia.awg.network-extension`, which macOS runs independently of the app process.

**Profile** — A NetworkExtension VPN configuration created in AmneziaWG and visible in System Settings. In code, `Profile` means the service name plus its system UUID and enabled flag.

**Service** — The unit `scutil --nc` operates on. The extension identifies a service by its name (passed to `start`, `stop`, `status`) and by its UUID (React key and duplicate detection).

**Service ID** — The UUID that `scutil --nc list` prints for each service, e.g. `981E021C-CFA0-4FAF-95A6-61E509850FB0`. Stable across launches, used as a list key.

**Settled state** — The terminal state an action waits for: `connected` after `start`, `disconnected` after `stop`. Polled every 500 ms for at most 15 seconds.

**Stale state** — A `disconnecting` status that macOS keeps reporting for a profile whose tunnel is already gone. It is rendered as `disconnected` when another profile is `connected`, since AmneziaWG allows a single tunnel.

**Toggle** — The primary action on a list item: `start` when the profile is not active, `stop` when it is.

**Toggle command** — The no-view Raycast command `toggle-connection`. It disconnects the active profile when there is one, otherwise connects the last used profile.

**Tunnel** — The live VPN connection owned by a profile. AmneziaWG keeps at most one tunnel at a time, so connecting another profile implicitly disconnects the current one.

**VPN state** — The first line of `scutil --nc status`, normalized to `connected`, `connecting`, `disconnected`, `disconnecting`, `invalid` or `unknown`. `unknown` covers unrecognized output and failed status calls.
