import type { TechnicianContact } from "@/types/emailNotification";

export const technicianContacts: TechnicianContact[] = [
  {
    id: "TECH-001",
    name: "Teknisi Brake & Pneumatic",
    email: "mr.plankton363@gmail.com",
    specialization: ["Brake System", "Pneumatic"],
    status: "available"
  }
];

export const workOrderEmailCopyRecipients: TechnicianContact[] = [
  {
    id: "OPS-001",
    name: "Operator Control Center",
    email: "raenaldi.ardiansyah30@gmail.com",
    specialization: ["Operations", "Control Center"],
    status: "available"
  },
  {
    id: "OPS-002",
    name: "Operator Maintenance Copy",
    email: "faizahzahraaqilah@gmail.com",
    specialization: ["Operations", "Maintenance"],
    status: "available"
  },
  {
    id: "REV-001",
    name: "Reviewer Maintenance",
    email: "albiang03@gmail.com",
    specialization: ["Review", "Maintenance"],
    status: "available"
  }
];
