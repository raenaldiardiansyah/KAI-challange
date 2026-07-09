export type WorkOrder = {
  id: string;
  trainsetId: string;
  carNumber: number;
  title: string;
  status: "Draft" | "Requested" | "In Progress" | "Completed";
  priority: "Critical" | "High" | "Medium" | "Low";
  assignee: string;
};
