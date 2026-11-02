import { LocalStorage } from "@raycast/api";

const KEY = "last-used-profile";

export function getLastUsedProfile(): Promise<string | undefined> {
  return LocalStorage.getItem<string>(KEY);
}

export function rememberLastUsedProfile(name: string): Promise<void> {
  return LocalStorage.setItem(KEY, name);
}
