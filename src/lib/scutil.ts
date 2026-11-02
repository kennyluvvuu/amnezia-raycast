import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { parseProfileList, parseStatus } from "./parse";
import type { ExecFn, Profile, VpnState } from "./types";

export const SCUTIL_PATH = "/usr/sbin/scutil";

const COMMAND_TIMEOUT_MS = 10_000;
const DEFAULT_WAIT_TIMEOUT_MS = 15_000;
const DEFAULT_WAIT_INTERVAL_MS = 500;

const execFileAsync = promisify(execFile);

export const defaultExec: ExecFn = async (file, args) => {
  const { stdout } = await execFileAsync(file, args, {
    timeout: COMMAND_TIMEOUT_MS,
    maxBuffer: 1024 * 1024,
  });

  return stdout;
};

export interface WaitOptions {
  timeoutMs?: number;
  intervalMs?: number;
}

export interface Scutil {
  listProfiles(): Promise<Profile[]>;
  getStatus(name: string): Promise<VpnState>;
  start(name: string): Promise<void>;
  stop(name: string): Promise<void>;
  /** Polls the service until it reaches `expected`, fails fast on `invalid`, or times out. */
  waitForSettledState(name: string, expected: "connected" | "disconnected", options?: WaitOptions): Promise<VpnState>;
}

export function createScutil(exec: ExecFn = defaultExec): Scutil {
  const getStatus = async (name: string) => parseStatus(await exec(SCUTIL_PATH, ["--nc", "status", name]));

  return {
    async listProfiles() {
      return parseProfileList(await exec(SCUTIL_PATH, ["--nc", "list"]));
    },
    getStatus,
    async start(name: string) {
      await exec(SCUTIL_PATH, ["--nc", "start", name]);
    },
    async stop(name: string) {
      await exec(SCUTIL_PATH, ["--nc", "stop", name]);
    },
    async waitForSettledState(
      name: string,
      expected: "connected" | "disconnected",
      { timeoutMs = DEFAULT_WAIT_TIMEOUT_MS, intervalMs = DEFAULT_WAIT_INTERVAL_MS }: WaitOptions = {},
    ) {
      const deadline = Date.now() + timeoutMs;
      let last: VpnState = "unknown";

      while (true) {
        last = await getStatus(name);

        if (last === expected) return last;
        if (last === "invalid") throw new Error(`"${name}" has an invalid configuration.`);
        if (Date.now() >= deadline) {
          throw new Error(`Timed out waiting for "${name}" to become ${expected} (last state: ${last}).`);
        }

        await sleep(intervalMs);
      }
    },
  };
}

export const scutil = createScutil();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
