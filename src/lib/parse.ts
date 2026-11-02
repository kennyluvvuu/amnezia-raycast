import type { Profile, VpnState } from "./types";

export const AMNEZIAWG_SERVICE_TYPE = "org.amnezia.awg";

// Example line:
// * (Connected)      D8FFD2B2-6405-4137-A47E-7417EA4FB0EE VPN (org.amnezia.awg) "amnezia_for_awg"   [VPN:org.amnezia.awg]
const SERVICE_LINE =
  /^(\*)?\s*\(([^)]+)\)\s+([0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12})\s+VPN\s+\(([^)]+)\)\s+"(.*)"\s+\[VPN:([^\]]+)\]\s*$/;

const STATE_BY_TOKEN: Record<string, VpnState> = {
  connected: "connected",
  connecting: "connecting",
  disconnected: "disconnected",
  disconnecting: "disconnecting",
  invalid: "invalid",
};

export function normalizeState(raw: string): VpnState {
  return STATE_BY_TOKEN[raw.trim().toLowerCase()] ?? "unknown";
}

/** Parses `scutil --nc list`, keeping only AmneziaWG services. */
export function parseProfileList(output: string): Profile[] {
  const profiles: Profile[] = [];

  for (const line of output.split(/\r?\n/)) {
    const match = SERVICE_LINE.exec(line.trimEnd());
    if (!match) continue;

    const [, enabledMarker, , id, type, name, bracketType] = match;
    if (type !== AMNEZIAWG_SERVICE_TYPE || bracketType !== AMNEZIAWG_SERVICE_TYPE) continue;

    profiles.push({ id, name, enabled: Boolean(enabledMarker) });
  }

  return profiles;
}

/** Parses the first non-empty line of `scutil --nc status`. */
export function parseStatus(output: string): VpnState {
  const firstLine = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  return firstLine ? normalizeState(firstLine) : "unknown";
}
