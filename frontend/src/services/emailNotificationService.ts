import emailjs from "@emailjs/browser";
import type { EmailNotificationResult, WorkOrderEmailPayload } from "@/types/emailNotification";

const emailConfig = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "",
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "",
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? ""
};

let emailSendQueue: Promise<void> = Promise.resolve();

function waitForEmailRateLimit() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 1100);
  });
}

function getEmailJsErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;

  if (error && typeof error === "object") {
    const response = error as { status?: unknown; text?: unknown };
    const status = typeof response.status === "number" ? `EmailJS ${response.status}` : "EmailJS";
    const text = typeof response.text === "string" ? response.text : "Permintaan email ditolak.";
    return `${status}: ${text}`;
  }

  return "EmailJS tidak berhasil mengirim pesan.";
}

function hasEmailConfig() {
  return Boolean(emailConfig.serviceId && emailConfig.templateId && emailConfig.publicKey);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function getEmailNotificationConfigStatus() {
  const missing: string[] = [];
  if (!emailConfig.serviceId) missing.push("service EmailJS");
  if (!emailConfig.templateId) missing.push("template EmailJS");
  if (!emailConfig.publicKey) missing.push("public key EmailJS");

  return {
    isConfigured: hasEmailConfig(),
    reason: missing.length > 0
      ? `${missing.join(", ")} belum dikonfigurasi.`
      : "EmailJS siap mengirim notifikasi SPK."
  };
}

export async function sendWorkOrderEmail(payload: WorkOrderEmailPayload): Promise<EmailNotificationResult> {
  if (!hasEmailConfig()) {
    return {
      success: false,
      code: "CONFIG_MISSING",
      message: "Konfigurasi EmailJS belum lengkap. Isi service ID, template ID, dan public key."
    };
  }

  if (!isValidEmail(payload.technicianEmail) || !isValidEmail(payload.operatorEmail)) {
    return {
      success: false,
      code: "INVALID_RECIPIENT",
      message: "Alamat email teknisi atau reply-to operator tidak valid."
    };
  }

  const sendRequest = async (): Promise<EmailNotificationResult> => {
    try {
      await emailjs.send(
      emailConfig.serviceId,
      emailConfig.templateId,
      {
        to_name: payload.technicianName,
        to_email: payload.technicianEmail,
        technician_name: payload.technicianName,
        technician_email: payload.technicianEmail,
        operator_name: payload.operatorName,
        operator_email: payload.operatorEmail,
        reply_to: payload.operatorEmail,
        spk_id: payload.spkId,
        trainset_id: payload.trainsetId,
        car_number: payload.carNumber,
        subsystem: payload.subsystem,
        component: payload.task,
        priority: payload.priority,
        deadline: payload.deadline,
        task: payload.task,
        evidence: payload.evidence.join("\n"),
        recommendation: payload.recommendation,
        operator_message: payload.operatorMessage
      },
      {
        publicKey: emailConfig.publicKey
      }
      );

      return {
        success: true,
        recipient: payload.technicianEmail,
        sentAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        code: "SEND_FAILED",
        message: getEmailJsErrorMessage(error)
      };
    }
  };

  const scheduledRequest = emailSendQueue.then(sendRequest, sendRequest);
  emailSendQueue = scheduledRequest.then(waitForEmailRateLimit, waitForEmailRateLimit);
  return scheduledRequest;
}
