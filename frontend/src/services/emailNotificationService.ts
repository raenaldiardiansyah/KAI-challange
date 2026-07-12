import emailjs from "@emailjs/browser";
import type { EmailNotificationResult, WorkOrderEmailPayload } from "@/types/emailNotification";

const emailConfig = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "",
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "",
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? ""
};

function hasEmailConfig() {
  return Boolean(emailConfig.serviceId && emailConfig.templateId && emailConfig.publicKey);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function getEmailNotificationConfigStatus() {
  return {
    isConfigured: hasEmailConfig(),
    serviceId: emailConfig.serviceId,
    templateId: emailConfig.templateId
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
        car_number: `C${payload.carNumber}`,
        subsystem: payload.subsystem,
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
    const message = error instanceof Error ? error.message : "EmailJS tidak berhasil mengirim pesan.";
    return {
      success: false,
      code: "SEND_FAILED",
      message
    };
  }
}
