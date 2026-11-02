import type { VpnState } from "./types";

/**
 * AmneziaWG keeps a single tunnel, so when one profile is `connected` any other
 * profile still reported as `disconnecting` is a stale NetworkExtension state:
 * the tunnel has already moved and the old service is only finishing teardown.
 * Showing it as `disconnected` avoids a permanently hung row.
 */
export function reconcileStates<T extends { state: VpnState }>(rows: T[]): T[] {
  if (!rows.some((row) => row.state === "connected")) return rows;

  return rows.map((row) => (row.state === "disconnecting" ? { ...row, state: "disconnected" as VpnState } : row));
}
