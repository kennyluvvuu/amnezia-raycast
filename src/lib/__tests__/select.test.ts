import { describe, expect, it } from "vitest";
import { selectTargetProfile } from "../select";
import type { Profile } from "../types";

const profile = (name: string, enabled = true, id = `${name}-id`): Profile => ({ id, name, enabled });

describe("selectTargetProfile", () => {
  it("prefers the last used profile when it still exists", () => {
    const profiles = [profile("alpha"), profile("warp"), profile("zeta")];

    expect(selectTargetProfile(profiles, "warp")?.name).toBe("warp");
  });

  it("falls back to the first enabled profile alphabetically", () => {
    const profiles = [profile("zeta"), profile("warp"), profile("alpha")];

    expect(selectTargetProfile(profiles, "missing")?.name).toBe("alpha");
  });

  it("skips disabled profiles when falling back", () => {
    const profiles = [profile("alpha", false), profile("beta"), profile("gamma")];

    expect(selectTargetProfile(profiles)?.name).toBe("beta");
  });

  it("uses the last used profile even if it is disabled", () => {
    const profiles = [profile("alpha"), profile("beta", false)];

    expect(selectTargetProfile(profiles, "beta")?.name).toBe("beta");
  });

  it("returns the only profile when none are enabled", () => {
    const profiles = [profile("only", false)];

    expect(selectTargetProfile(profiles)?.name).toBe("only");
  });

  it("returns undefined when there are no profiles", () => {
    expect(selectTargetProfile([])).toBeUndefined();
  });
});
