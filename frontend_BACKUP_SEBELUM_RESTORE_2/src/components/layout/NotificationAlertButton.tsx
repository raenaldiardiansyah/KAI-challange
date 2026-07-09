"use client";

import { Bell, WarningCircle } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/Button";

type NotificationState = "unsupported" | NotificationPermission;

function getNotificationState(): NotificationState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}

function showSystemNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  new Notification(title, {
    body,
    tag: "kai-operational-alert"
  });
}

export function NotificationAlertButton() {
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationState>("default");

  useEffect(() => {
    const handleOperationalNotification = (event: Event) => {
      const detail = (event as CustomEvent<{ title?: string; body?: string }>).detail;
      showSystemNotification(
        detail?.title ?? "Peringatan Operasional",
        detail?.body ?? "Ada anomali atau data telemetry baru yang perlu ditinjau."
      );
    };

    window.addEventListener("kai:anomaly-detected", handleOperationalNotification);
    window.addEventListener("kai:data-incoming", handleOperationalNotification);

    return () => {
      window.removeEventListener("kai:anomaly-detected", handleOperationalNotification);
      window.removeEventListener("kai:data-incoming", handleOperationalNotification);
    };
  }, []);

  const statusText = useMemo(() => {
    switch (permission) {
      case "granted":
        return "Notifikasi web aktif";
      case "denied":
        return "Notifikasi diblokir oleh browser";
      case "unsupported":
        return "Browser belum mendukung notifikasi web";
      default:
        return "Notifikasi belum diaktifkan";
    }
  }, [permission]);

  const handleEnableNotification = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    const nextPermission = await Notification.requestPermission();
    setPermission(nextPermission);

    if (nextPermission === "granted") {
      window.localStorage.setItem("kai-notification-enabled", "true");
      showSystemNotification(
        "Notifikasi RAMS aktif",
        "Pemberitahuan akan muncul saat anomali terdeteksi atau data telemetry baru masuk."
      );
      setOpen(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setPermission(getNotificationState());
    }

    setOpen(nextOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" icon={<Bell size={18} />} aria-label="Aktifkan notifikasi" />
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <div className="alert-dialog-media">
            <WarningCircle size={24} weight="fill" />
          </div>
          <AlertDialogTitle>Aktifkan Notifikasi Web</AlertDialogTitle>
          <AlertDialogDescription>
            Izinkan browser menampilkan pemberitahuan saat sistem menerima data baru atau mendeteksi anomali operasional.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="notification-alert-panel">
          <strong>{statusText}</strong>
          <span>
            Notifikasi akan dipakai untuk alarm anomali, telemetry masuk, dan perubahan status yang perlu segera ditinjau.
          </span>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleEnableNotification} disabled={permission === "unsupported"}>
            Aktifkan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
