import { afterEach, describe, expect, it, vi } from "vitest";
import { createScutil, SCUTIL_PATH } from "../scutil";
import type { ExecFn } from "../types";

const listOutput = [
  '* (Connected)      D8FFD2B2-6405-4137-A47E-7417EA4FB0EE VPN (org.amnezia.awg) "amnezia_for_awg"   [VPN:org.amnezia.awg]',
  '* (Disconnected)   981E021C-CFA0-4FAF-95A6-61E509850FB0 VPN (org.amnezia.awg) "warp"   [VPN:org.amnezia.awg]',
].join("\n");

function sequenceExec(outputs: string[]): ExecFn {
  return vi.fn(async () => outputs.shift() ?? "Disconnected");
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("scutil adapter", () => {
  it("lists profiles through scutil --nc list", async () => {
    const exec = vi.fn(async () => listOutput);
    const profiles = await createScutil(exec).listProfiles();

    expect(exec).toHaveBeenCalledWith(SCUTIL_PATH, ["--nc", "list"]);
    expect(profiles.map((profile) => profile.name)).toEqual(["amnezia_for_awg", "warp"]);
  });

  it("reads status through scutil --nc status", async () => {
    const exec = vi.fn(async () => "Connected\nExtended Status <dictionary> {");
    const state = await createScutil(exec).getStatus("warp");

    expect(exec).toHaveBeenCalledWith(SCUTIL_PATH, ["--nc", "status", "warp"]);
    expect(state).toBe("connected");
  });

  it("starts and stops by service name", async () => {
    const exec = vi.fn(async () => "");
    const client = createScutil(exec);

    await client.start("warp");
    await client.stop("warp");

    expect(exec).toHaveBeenNthCalledWith(1, SCUTIL_PATH, ["--nc", "start", "warp"]);
    expect(exec).toHaveBeenNthCalledWith(2, SCUTIL_PATH, ["--nc", "stop", "warp"]);
  });

  it("waits until the profile reaches the expected state", async () => {
    vi.useFakeTimers();
    const exec = sequenceExec(["Connecting", "Connecting", "Connected"]);
    const client = createScutil(exec);

    const promise = client.waitForSettledState("warp", "connected", { timeoutMs: 5000, intervalMs: 500 });
    await vi.advanceTimersByTimeAsync(1000);

    await expect(promise).resolves.toBe("connected");
    expect(exec).toHaveBeenCalledTimes(3);
  });

  it("fails fast on an invalid configuration", async () => {
    vi.useFakeTimers();
    const client = createScutil(sequenceExec(["Invalid"]));

    await expect(client.waitForSettledState("warp", "connected", { timeoutMs: 5000 })).rejects.toThrow(
      /invalid configuration/,
    );
  });

  it("times out when the state never settles", async () => {
    vi.useFakeTimers();
    const client = createScutil(sequenceExec(["Connecting", "Connecting", "Connecting", "Connecting"]));

    const promise = client.waitForSettledState("warp", "connected", { timeoutMs: 1500, intervalMs: 500 });
    const assertion = expect(promise).rejects.toThrow(/Timed out/);

    await vi.advanceTimersByTimeAsync(2000);
    await assertion;
  });

  it("propagates scutil failures", async () => {
    const exec: ExecFn = vi.fn(async () => {
      throw Object.assign(new Error("Command failed"), { stderr: "No such service" });
    });

    await expect(createScutil(exec).getStatus("missing")).rejects.toThrow("Command failed");
  });
});
