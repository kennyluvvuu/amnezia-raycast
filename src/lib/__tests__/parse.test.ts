import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseProfileList, parseStatus } from "../parse";

const fixturesDir = join(process.cwd(), "src", "lib", "__tests__", "fixtures");
const fixture = (name: string) => readFileSync(join(fixturesDir, name), "utf8");

describe("parseProfileList", () => {
  it("keeps only AmneziaWG services from a real scutil list", () => {
    expect(parseProfileList(fixture("list.txt"))).toEqual([
      {
        id: "D8FFD2B2-6405-4137-A47E-7417EA4FB0EE",
        name: "amnezia_for_awg",
        enabled: true,
      },
      {
        id: "981E021C-CFA0-4FAF-95A6-61E509850FB0",
        name: "warp",
        enabled: true,
      },
    ]);
  });

  it("ignores PPP, third-party VPN services and the header line", () => {
    const output = [
      "Available network connection services in the current set (*=enabled):",
      '* (Disconnected)   B6EA6AFC-DB37-4460-9DD9-7BD3E2FF3068 PPP --> MT65xx Preloader "MT65xx Preloader"   [PPP:Modem]',
      '* (Disconnected)   9C61A70D-4637-4FFB-A813-46C689FCE2EB VPN (hossin.asaadi.V2Box) "V2BOX"   [VPN:hossin.asaadi.V2Box]',
    ].join("\n");

    expect(parseProfileList(output)).toEqual([]);
  });

  it("handles spaces and quotes in a profile name", () => {
    const output =
      '* (Disconnected)   981E021C-CFA0-4FAF-95A6-61E509850FB0 VPN (org.amnezia.awg) "my "quoted" profile"   [VPN:org.amnezia.awg]';

    expect(parseProfileList(output)).toEqual([
      {
        id: "981E021C-CFA0-4FAF-95A6-61E509850FB0",
        name: 'my "quoted" profile',
        enabled: true,
      },
    ]);
  });

  it("marks services without the enabled marker as disabled", () => {
    const output =
      '  (Disconnected)   981E021C-CFA0-4FAF-95A6-61E509850FB0 VPN (org.amnezia.awg) "warp"   [VPN:org.amnezia.awg]';

    expect(parseProfileList(output)).toEqual([
      {
        id: "981E021C-CFA0-4FAF-95A6-61E509850FB0",
        name: "warp",
        enabled: false,
      },
    ]);
  });

  it("returns an empty list for empty or malformed output", () => {
    expect(parseProfileList("")).toEqual([]);
    expect(parseProfileList('garbage\nVPN (org.amnezia.awg) "broken"')).toEqual([]);
  });
});

describe("parseStatus", () => {
  it("reads the first line of a connected status", () => {
    expect(parseStatus(fixture("status-connected.txt"))).toBe("connected");
  });

  it("reads a disconnected status", () => {
    expect(parseStatus(fixture("status-disconnected.txt"))).toBe("disconnected");
  });

  it("skips leading blank lines", () => {
    expect(parseStatus("\n\n  Connecting \nExtended Status <dictionary> {")).toBe("connecting");
  });

  it.each([
    ["Connected", "connected"],
    ["Disconnecting", "disconnecting"],
    ["Invalid", "invalid"],
    ["weird-state", "unknown"],
  ])("maps %s to %s", (raw, expected) => {
    expect(parseStatus(raw)).toBe(expected);
  });

  it("returns unknown for empty output", () => {
    expect(parseStatus("")).toBe("unknown");
  });
});
