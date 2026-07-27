import { NextResponse } from "next/server";
import type { WorkOrderTelegramPayload } from "@/types/telegramNotification";

export const runtime = "nodejs";

const chatIdsBySubsystem: Record<string, Array<string | undefined>> = {
  "brake system": [process.env.TELEGRAM_CHAT_ID_BRAKE],
  pneumatic: [process.env.TELEGRAM_CHAT_ID_BRAKE],
  electrical: [process.env.TELEGRAM_CHAT_ID_ELECTRICAL]
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function getRecipientChatIds(subsystem: string) {
  const configured = chatIdsBySubsystem[subsystem.trim().toLowerCase()] ?? [
    process.env.TELEGRAM_CHAT_ID_DEFAULT
  ];

  return [...new Set(configured.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))];
}

function isValidPayload(value: unknown): value is WorkOrderTelegramPayload {
  if (!value || typeof value !== "object") return false;

  const payload = value as Partial<WorkOrderTelegramPayload>;
  return Boolean(
    payload.spkId?.trim() &&
    payload.trainsetId?.trim() &&
    Number.isInteger(payload.carNumber) &&
    payload.subsystem?.trim() &&
    payload.task?.trim() &&
    Array.isArray(payload.evidence)
  );
}

function buildMessage(payload: WorkOrderTelegramPayload) {
  return [
    "<b>SPK MAINTENANCE BARU</b>",
    "",
    `<b>Nomor SPK:</b> ${escapeHtml(payload.spkId)}`,
    `<b>Trainset:</b> ${escapeHtml(payload.trainsetId)}`,
    `<b>Gerbong:</b> C${escapeHtml(payload.carNumber)}`,
    `<b>Subsistem:</b> ${escapeHtml(payload.subsystem)}`,
    `<b>Prioritas:</b> ${escapeHtml(payload.priority)}`,
    `<b>Deadline:</b> ${escapeHtml(payload.deadline)}`,
    "",
    `<b>Tugas:</b> ${escapeHtml(payload.task)}`,
    "",
    "<b>Bukti anomali:</b>",
    ...payload.evidence.map((item) => `- ${escapeHtml(item)}`),
    "",
    `<b>Rekomendasi:</b> ${escapeHtml(payload.recommendation)}`,
    "",
    `<b>Pesan operator:</b> ${escapeHtml(payload.operatorMessage || "-")}`
  ].join("\n");
}

export async function GET(request: Request) {
  const subsystem = new URL(request.url).searchParams.get("subsystem")?.trim() ?? "";
  const hasToken = Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim());
  const hasRecipient = subsystem
    ? getRecipientChatIds(subsystem).length > 0
    : Boolean(process.env.TELEGRAM_CHAT_ID_DEFAULT?.trim());

  if (!hasToken) {
    return NextResponse.json({
      isConfigured: false,
      reason: "Token bot Telegram belum dikonfigurasi di server."
    });
  }

  if (!hasRecipient) {
    return NextResponse.json({
      isConfigured: false,
      reason: `Chat ID Telegram untuk ${subsystem || "penerima default"} belum dikonfigurasi.`
    });
  }

  return NextResponse.json({
    isConfigured: true,
    reason: "Telegram siap mengirim notifikasi SPK."
  });
}

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();

  if (!token) {
    return NextResponse.json(
      { success: false, message: "TELEGRAM_BOT_TOKEN belum dikonfigurasi." },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Payload Telegram bukan JSON yang valid." },
      { status: 400 }
    );
  }

  if (!isValidPayload(body)) {
    return NextResponse.json(
      { success: false, message: "Data SPK untuk Telegram belum lengkap." },
      { status: 400 }
    );
  }

  const chatIds = getRecipientChatIds(body.subsystem);
  if (chatIds.length === 0) {
    return NextResponse.json(
      {
        success: false,
        message: `Chat ID Telegram untuk subsistem ${body.subsystem} belum dikonfigurasi.`
      },
      { status: 400 }
    );
  }

  const text = buildMessage(body);
  const results = await Promise.allSettled(
    chatIds.map(async (chatId) => {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true
        })
      });

      const result = (await response.json()) as {
        ok?: boolean;
        description?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(result.description ?? `Telegram API error ${response.status}`);
      }
    })
  );

  const sent = results.filter((result) => result.status === "fulfilled").length;
  const failed = results
    .filter((result): result is PromiseRejectedResult => result.status === "rejected")
    .map((result) => result.reason instanceof Error ? result.reason.message : "Telegram gagal mengirim pesan.");

  return NextResponse.json(
    {
      success: failed.length === 0,
      sent,
      failed,
      message: failed.length === 0
        ? `Telegram terkirim ke ${sent} chat.`
        : `Telegram terkirim ke ${sent} chat, ${failed.length} gagal.`
    },
    { status: sent > 0 ? 200 : 502 }
  );
}
