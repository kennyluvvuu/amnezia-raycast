import { describe, expect, it } from "vitest";
import { reconcileStates } from "../reconcile";
import type { VpnState } from "../types";

const row = (state: VpnState) => ({ state });

describe("reconcileStates", () => {
  it("treats a stale disconnecting profile as disconnected when another profile is connected", () => {
    const rows = [row("connected"), row("disconnecting")];

    expect(reconcileStates(rows).map((item) => item.state)).toEqual(["connected", "disconnected"]);
  });

  it("keeps disconnecting while the other profile is only connecting", () => {
    const rows = [row("connecting"), row("disconnecting")];

    expect(reconcileStates(rows).map((item) => item.state)).toEqual(["connecting", "disconnecting"]);
  });

  it("keeps disconnecting when nothing is connected", () => {
    const rows = [row("disconnecting"), row("disconnected")];

    expect(reconcileStates(rows).map((item) => item.state)).toEqual(["disconnecting", "disconnected"]);
  });

  it("does not touch other states", () => {
    const rows = [row("connected"), row("invalid"), row("unknown")];

    expect(reconcileStates(rows).map((item) => item.state)).toEqual(["connected", "invalid", "unknown"]);
  });
});
