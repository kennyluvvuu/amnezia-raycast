/** A VPN service as reported by `scutil --nc list`. */
export interface Profile {
  /** Stable service UUID from `scutil --nc list`; used as a React key. */
  id: string;
  /** Service name accepted by `scutil --nc start|stop|status`. */
  name: string;
  /** False when the service is not in the current network set (no leading `*`). */
  enabled: boolean;
}

export type VpnState = "connected" | "connecting" | "disconnected" | "disconnecting" | "invalid" | "unknown";

/** Runs a binary without a shell and resolves with its stdout. */
export type ExecFn = (file: string, args: string[]) => Promise<string>;
