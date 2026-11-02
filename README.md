# AmneziaWG for Raycast

A personal Raycast extension that connects and disconnects [AmneziaWG](https://amnezia.org) VPN profiles on macOS without opening the app.

## Requirements

- macOS with the [AmneziaWG](https://apps.apple.com/us/app/amneziawg/id6478942365) app installed.
- At least one AmneziaWG profile created in the app (the extension does not create profiles).
- Raycast.

## Install (personal build)

```sh
git clone <this repository> amnezia-raycast
cd amnezia-raycast
npm install
npm run dev
```

The extension is registered in Raycast in development mode. Assign a hotkey to **Manage VPN Connections** in Raycast settings.

## Usage

- Open **Manage VPN Connections**. The list shows every `org.amnezia.awg` service reported by the system, with the active profile first.
- Press **Enter** to connect or disconnect the selected profile.
- **⌘R** reloads the list; **Open AmneziaWG** launches the app.
- The status refreshes when the command opens, on ⌘R, and after each connect/disconnect. There is no background polling.
- AmneziaWG keeps a single tunnel at a time. Connecting another profile disconnects the current one; the list reflects this after the action.

## How it works

The extension shells out to `/usr/sbin/scutil`:

- `scutil --nc list` — discover VPN services, filtered to type `org.amnezia.awg`.
- `scutil --nc status <service>` — read `Connected`, `Connecting`, `Disconnected`, `Disconnecting` or `Invalid`.
- `scutil --nc start|stop <service>` — toggle the tunnel.

All calls use `execFile` with an argument array (no shell). No `sudo`, no privileged helper, no Keychain access, and no private keys or configuration files are read.

## Limitations

- Profiles are managed in AmneziaWG; this extension cannot create, edit, delete or import them.
- Only AmneziaWG services are listed. `AmneziaVPN.app` and other VPN clients are out of scope.
- Only connection state is shown — no endpoint, throughput or handshake details.
- Services disabled in System Settings are still listed (marked as disabled); connecting them may fail.
- Duplicate profile names are ambiguous to `scutil`; the extension disambiguates them visually but the system may still reject the call.
- The system output of `scutil` is undocumented and may change between macOS releases.

## Icon and branding

The extension icon is taken from the locally installed `AmneziaWG.app` for personal use. AmneziaWG and its logo belong to their owners; this project is not affiliated with or endorsed by Amnezia. Do not redistribute the icon or publish this build to the Raycast Store without replacing it with original artwork.

## Development

```sh
npm run dev        # develop in Raycast
npm run lint       # ray lint
npm run build      # ray build -e dist
npm test           # unit tests (Vitest)
```

Architecture decisions live in [`docs/adr`](docs/adr); terminology is in [`docs/GLOSSARY.md`](docs/GLOSSARY.md).

## License

Source code is MIT-licensed. The icon is excluded from that license.
