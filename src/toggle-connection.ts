import { closeMainWindow, showHUD } from "@raycast/api";
import { errorMessage } from "./lib/errors";
import { getLastUsedProfile, rememberLastUsedProfile } from "./lib/last-used";
import { selectTargetProfile } from "./lib/select";
import { scutil } from "./lib/scutil";
import type { VpnState } from "./lib/types";

const ACTIVE_STATES: ReadonlySet<VpnState> = new Set(["connected", "connecting"]);

export default async function Command() {
  await closeMainWindow().catch(() => undefined);

  try {
    const profiles = await scutil.listProfiles();

    if (profiles.length === 0) {
      await showHUD("No AmneziaWG profiles found");
      return;
    }

    const states = await Promise.all(
      profiles.map((profile) => scutil.getStatus(profile.name).catch((): VpnState => "unknown")),
    );
    const active = profiles.find((_, index) => ACTIVE_STATES.has(states[index]));

    if (active) {
      await showHUD(`Disconnecting ${active.name}…`);
      await scutil.stop(active.name);
      await scutil.waitForSettledState(active.name, "disconnected");
      await showHUD(`Disconnected: ${active.name}`);
      return;
    }

    const target = selectTargetProfile(profiles, await getLastUsedProfile());

    if (!target) {
      await showHUD("No connectable AmneziaWG profile found");
      return;
    }

    await showHUD(`Connecting ${target.name}…`);
    await scutil.start(target.name);
    await scutil.waitForSettledState(target.name, "connected");
    await rememberLastUsedProfile(target.name).catch(() => undefined);
    await showHUD(`Connected: ${target.name}`);
  } catch (caught) {
    await showHUD(`Could not toggle AmneziaWG: ${oneLine(errorMessage(caught))}`);
  }
}

function oneLine(message: string): string {
  return message.replace(/\s+/g, " ").trim().slice(0, 180);
}
