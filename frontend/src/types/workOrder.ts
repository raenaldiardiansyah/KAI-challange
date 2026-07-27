import type { Severity } from "./common";

export type WorkOrder = {
  id: string;
  trainsetId: string;
  carNumber: number;
  title: string;
  status: "Draft" | "Requested" | "In Progress" | "Completed";
  priority: "Critical" | "High" | "Medium" | "Low";
  assignee: string;
};

export type SpkStatus = "open" | "in-progress" | "completed" | "overdue";

export type SpkRow = {
  id: string;
  source: string;
  eventCode: string;
  asset: string;
  trainsetId: string;
  carNumber: number;
  subsystem: string;
  task: string;
  priority: Severity;
  status: SpkStatus;
  deadline: string;
  assignee: string;
  evidence: string[];
  recommendation: string;
  notes: string;
};
