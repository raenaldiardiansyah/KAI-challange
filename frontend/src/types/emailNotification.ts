export type TechnicianStatus = "available" | "assigned" | "off-duty";

export type TechnicianContact = {
  id: string;
  name: string;
  email: string;
  specialization: string[];
  status: TechnicianStatus;
};

export type WorkOrderEmailPayload = {
  technicianName: string;
  technicianEmail: string;
  operatorName: string;
  operatorEmail: string;
  spkId: string;
  trainsetId: string;
  carNumber: number;
  subsystem: string;
  priority: string;
  deadline: string;
  task: string;
  evidence: string[];
  recommendation: string;
  operatorMessage: string;
};

export type EmailNotificationRecord = {
  id: string;
  workOrderId: string;
  type: "email";
  recipientName: string;
  recipientEmail: string;
  sentBy: string;
  sentAt: string;
  status: "sent" | "failed";
  message?: string;
};

export type EmailNotificationResult =
  | {
      success: true;
      sentAt: string;
      recipient: string;
    }
  | {
      success: false;
      code: "CONFIG_MISSING" | "INVALID_RECIPIENT" | "SEND_FAILED";
      message: string;
    };
