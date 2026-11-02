import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { defaultExec } from "./scutil";
import type { ExecFn } from "./types";

export const AMNEZIAWG_BUNDLE_ID = "org.amnezia.awg";
export const AMNEZIAWG_APP_STORE_URL = "https://apps.apple.com/us/app/amneziawg/id6478942365";

const APP_PATHS = ["/Applications/AmneziaWG.app", join(homedir(), "Applications", "AmneziaWG.app")];

export function isAmneziaWGInstalled(): boolean {
  return APP_PATHS.some((path) => existsSync(path));
}

/** Launches the app by bundle id; rejects if the app is not installed. */
export async function openAmneziaWG(exec: ExecFn = defaultExec): Promise<void> {
  await exec("/usr/bin/open", ["-b", AMNEZIAWG_BUNDLE_ID]);
}
