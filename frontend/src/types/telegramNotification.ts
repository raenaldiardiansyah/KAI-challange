export type WorkOrderTelegramPayload = {
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

export type TelegramNotificationResult = {
  success: boolean;
  sent?: number;
  message?: string;
  failed?: string[];
};
