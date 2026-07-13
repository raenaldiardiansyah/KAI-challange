"use client";

import { Button } from "@/components/ui/Button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import styles from "./UserSessionControl.module.css";

const roleLabels = {
  ADMIN: "Admin",
  TECHNICIAN: "Teknisi",
  VIEWER: "Viewer"
} as const;

export function UserSessionControl() {
  const { user, isLoading, logout } = useCurrentUser();

  if (isLoading) return <span className={styles.demo}>Memuat sesi</span>;
  if (!user) return <span className={styles.demo}>Mode Demo</span>;

  return (
    <div className={styles.control}>
      <span className={styles.identity}>
        <strong title={user.name}>{user.name}</strong>
        <span>{roleLabels[user.role]}</span>
      </span>
      <Button className={styles.logout} onClick={() => void logout()} variant="ghost">Keluar</Button>
    </div>
  );
}
