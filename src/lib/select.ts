import type { Profile } from "./types";

/**
 * Picks the profile to connect from the toggle command: the last used one when it
 * still exists, otherwise the first enabled profile alphabetically.
 */
export function selectTargetProfile(profiles: Profile[], lastUsedName?: string): Profile | undefined {
  if (lastUsedName) {
    const remembered = profiles.find((profile) => profile.name === lastUsedName);
    if (remembered) return remembered;
  }

  const enabled = profiles.filter((profile) => profile.enabled).sort(compareProfiles);

  return enabled[0] ?? [...profiles].sort(compareProfiles)[0];
}

function compareProfiles(a: Profile, b: Profile): number {
  return a.name.localeCompare(b.name, "en", { sensitivity: "base" }) || a.id.localeCompare(b.id);
}
