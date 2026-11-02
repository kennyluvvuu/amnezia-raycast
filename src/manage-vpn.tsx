import {
  Action,
  ActionPanel,
  Color,
  Icon,
  Image,
  Keyboard,
  List,
  Toast,
  closeMainWindow,
  open,
  showHUD,
  showToast,
} from "@raycast/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { errorMessage } from "./lib/errors";
import { rememberLastUsedProfile } from "./lib/last-used";
import { reconcileStates } from "./lib/reconcile";
import { AMNEZIAWG_APP_STORE_URL, isAmneziaWGInstalled, openAmneziaWG } from "./lib/system";
import { scutil } from "./lib/scutil";
import type { Profile, VpnState } from "./lib/types";

interface ProfileRow extends Profile {
  state: VpnState;
}

const ACTIVE_STATES: ReadonlySet<VpnState> = new Set(["connected", "connecting"]);

export default function Command() {
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);

    try {
      const profiles = await scutil.listProfiles();
      const withStates = await Promise.all(
        profiles.map(async (profile): Promise<ProfileRow> => {
          try {
            return { ...profile, state: await scutil.getStatus(profile.name) };
          } catch {
            return { ...profile, state: "unknown" };
          }
        }),
      );

      setRows(reconcileStates(withStates).sort(compareRows));
      setError(null);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = useCallback(
    async (row: ProfileRow) => {
      if (busyId) return;

      const disconnecting = row.state === "connected" || row.state === "connecting";
      setBusyId(row.id);

      const toast = await showToast({
        style: Toast.Style.Animated,
        title: `${disconnecting ? "Disconnecting" : "Connecting"} ${row.name}…`,
      });

      try {
        if (disconnecting) {
          await scutil.stop(row.name);
        } else {
          await scutil.start(row.name);
        }

        await scutil.waitForSettledState(row.name, disconnecting ? "disconnected" : "connected");

        if (!disconnecting) {
          await rememberLastUsedProfile(row.name).catch(() => undefined);
        }

        await toast.hide();
        await showHUD(`${disconnecting ? "Disconnected" : "Connected"}: ${row.name}`);
      } catch (caught) {
        await toast.hide();
        await showToast({
          style: Toast.Style.Failure,
          title: disconnecting ? "Could not disconnect" : "Could not connect",
          message: errorMessage(caught),
        });
      } finally {
        setBusyId(null);
        await load();
      }
    },
    [busyId, load],
  );

  const handleOpenApp = useCallback(async () => {
    try {
      await openAmneziaWG();
      await closeMainWindow();
    } catch (caught) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Could not open AmneziaWG",
        message: errorMessage(caught),
      });
    }
  }, []);

  const duplicateNames = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of rows) counts.set(row.name, (counts.get(row.name) ?? 0) + 1);

    return new Set([...counts].filter(([, count]) => count > 1).map(([name]) => name));
  }, [rows]);

  return (
    <List isLoading={isLoading} navigationTitle="AmneziaWG" searchBarPlaceholder="Search AmneziaWG profiles">
      {error ? (
        <List.EmptyView
          icon={{ source: Icon.Warning, tintColor: Color.Red }}
          title="Could not read AmneziaWG profiles"
          description={error}
          actions={
            <ActionPanel>
              <Action
                title="Reload"
                icon={Icon.ArrowClockwise}
                onAction={load}
                shortcut={Keyboard.Shortcut.Common.Refresh}
              />
            </ActionPanel>
          }
        />
      ) : rows.length === 0 && !isLoading ? (
        <List.EmptyView
          icon={{ source: Icon.Circle, tintColor: Color.SecondaryText }}
          title={isAmneziaWGInstalled() ? "No AmneziaWG profiles found" : "AmneziaWG is not installed"}
          description={
            isAmneziaWGInstalled()
              ? "Create a VPN profile in AmneziaWG, then reload."
              : "Install AmneziaWG and create a VPN profile, then reload."
          }
          actions={
            <ActionPanel>
              {isAmneziaWGInstalled() ? (
                <Action title="Open AmneziaWG" icon={Icon.AppWindow} onAction={handleOpenApp} />
              ) : (
                <Action title="Install AmneziaWG" icon={Icon.Download} onAction={() => open(AMNEZIAWG_APP_STORE_URL)} />
              )}
              <Action
                title="Reload"
                icon={Icon.ArrowClockwise}
                onAction={load}
                shortcut={Keyboard.Shortcut.Common.Refresh}
              />
            </ActionPanel>
          }
        />
      ) : (
        rows.map((row) => {
          const isOn = ACTIVE_STATES.has(row.state);
          const isBusy = busyId === row.id;

          return (
            <List.Item
              key={row.id}
              icon={iconFor(row)}
              title={row.name}
              subtitle={subtitleFor(row, duplicateNames)}
              accessories={
                isBusy
                  ? [{ tag: { value: "Working…", color: Color.Blue } }]
                  : [{ tag: { value: stateLabel(row.state), color: stateColor(row.state) } }]
              }
              actions={
                <ActionPanel>
                  <Action
                    title={isOn ? "Disconnect" : "Connect"}
                    icon={isOn ? Icon.Stop : Icon.Play}
                    onAction={() => toggle(row)}
                  />
                  <Action
                    title="Reload"
                    icon={Icon.ArrowClockwise}
                    onAction={load}
                    shortcut={Keyboard.Shortcut.Common.Refresh}
                  />
                  <ActionPanel.Section>
                    <Action title="Open AmneziaWG" icon={Icon.AppWindow} onAction={handleOpenApp} />
                  </ActionPanel.Section>
                </ActionPanel>
              }
            />
          );
        })
      )}
    </List>
  );
}

function compareRows(a: ProfileRow, b: ProfileRow): number {
  const aActive = ACTIVE_STATES.has(a.state) ? 0 : 1;
  const bActive = ACTIVE_STATES.has(b.state) ? 0 : 1;

  if (aActive !== bActive) return aActive - bActive;

  return a.name.localeCompare(b.name, "en", { sensitivity: "base" }) || a.id.localeCompare(b.id);
}

function stateLabel(state: VpnState): string {
  switch (state) {
    case "connected":
      return "Connected";
    case "connecting":
      return "Connecting";
    case "disconnected":
      return "Disconnected";
    case "disconnecting":
      return "Disconnecting";
    case "invalid":
      return "Invalid configuration";
    default:
      return "Unknown";
  }
}

function stateColor(state: VpnState): Color {
  switch (state) {
    case "connected":
      return Color.Green;
    case "connecting":
    case "disconnecting":
      return Color.Yellow;
    case "disconnected":
      return Color.SecondaryText;
    default:
      return Color.Red;
  }
}

function iconFor(row: ProfileRow): Image.ImageLike {
  if (!row.enabled) {
    return { source: Icon.Circle, tintColor: Color.SecondaryText };
  }

  switch (row.state) {
    case "connected":
      return { source: Icon.CircleFilled, tintColor: Color.Green };
    case "connecting":
    case "disconnecting":
      return { source: Icon.CircleProgress, tintColor: Color.Yellow };
    case "disconnected":
      return { source: Icon.Circle, tintColor: Color.SecondaryText };
    default:
      return { source: Icon.ExclamationMark, tintColor: Color.Red };
  }
}

function subtitleFor(row: ProfileRow, duplicateNames: Set<string>): string {
  const parts = [stateLabel(row.state).toLowerCase()];

  if (!row.enabled) parts.push("disabled in system settings");
  if (duplicateNames.has(row.name)) parts.push(row.id.slice(0, 8));

  return parts.join(" · ");
}
