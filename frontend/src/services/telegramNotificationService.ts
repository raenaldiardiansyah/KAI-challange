import type {
  TelegramNotificationResult,
  WorkOrderTelegramPayload
} from "@/types/telegramNotification";

export type TelegramConfigStatus = {
  isConfigured: boolean;
  reason: string;
};

export async function getTelegramNotificationConfigStatus(
  subsystem: string
): Promise<TelegramConfigStatus> {
  try {
    const response = await fetch(
      `/api/notifications/telegram?subsystem=${encodeURIComponent(subsystem)}`,
      { method: "GET" }
    );
    const result = (await response.json()) as TelegramConfigStatus;

    if (!response.ok) {
      return {
        isConfigured: false,
        reason: result.reason ?? "Status Telegram tidak dapat diperiksa."
      };
    }

    return result;
  } catch {
    return {
      isConfigured: false,
      reason: "Tidak dapat terhubung ke konfigurasi Telegram."
    };
  }
}

export async function sendWorkOrderTelegram(
  payload: WorkOrderTelegramPayload
): Promise<TelegramNotificationResult> {
  try {
    const response = await fetch("/api/notifications/telegram", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = (await response.json()) as TelegramNotificationResult;

    if (!response.ok) {
      return {
        success: false,
        message: result.message ?? "Notifikasi Telegram gagal dikirim.",
        failed: result.failed
      };
    }

    return result;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Tidak dapat terhubung ke layanan Telegram."
    };
  }
}
