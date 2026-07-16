"use client";

import { Button } from "@/components/ui/Button";
import { useDataMode } from "@/features/data-mode/DataModeProvider";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import styles from "./UserSessionControl.module.css";

const roleLabels = {
  ADMIN: "Admin",
  TECHNICIAN: "Teknisi",
  VIEWER: "Viewer"
} as const;

export function UserSessionControl({ showModeSwitch = true }: { showModeSwitch?: boolean }) {
  const { user, isLoading, logout } = useCurrentUser();
  const { mode, ready, changeMode, resourceStatus } = useDataMode();

  const nextMode = mode === "dummy" ? "live" : "dummy";
  const modeState = mode === "dummy"
    ? "dummy"
    : resourceStatus.error
      ? "error"
      : resourceStatus.stale || resourceStatus.fromCache
        ? "stale"
        : resourceStatus.source === "live"
          ? "connected"
          : "pending";
  const modeButton = (
    <button
      aria-label={`Sumber data ${mode === "dummy" ? "Dummy" : "API"}. Klik untuk beralih ke mode ${nextMode === "dummy" ? "Dummy" : "API"}.`}
      aria-pressed={mode === "live"}
      className={`${styles.modeSwitch} ${styles[modeState]}`}
      disabled={!ready}
      onClick={() => changeMode(nextMode)}
      title={`Beralih ke Mode ${nextMode === "dummy" ? "Dummy" : "API"}`}
      type="button"
    >
      Mode {mode === "dummy" ? "Dummy" : "API"}
    </button>
  );

  if (isLoading) return <div className={styles.control}>{showModeSwitch ? modeButton : null}<span className={styles.demo}>Memuat sesi</span></div>;
  if (!user) return showModeSwitch ? modeButton : null;

  return (
    <div className={styles.control}>
      {showModeSwitch ? modeButton : null}
      <span className={styles.identity}>
        <strong title={user.name}>{user.name}</strong>
        <span>{roleLabels[user.role]}</span>
      </span>
      <Button className={styles.logout} onClick={() => void logout()} variant="ghost">Keluar</Button>
    </div>
  );
}
