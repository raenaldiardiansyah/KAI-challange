import type { OperatorContact, TechnicianContact } from "@/types/emailNotification";

export const workOrderOperator: OperatorContact = {
  name: "Operator Control Center",
  email: "raenaldi.ardiansyah30@gmail.com"
};

export const technicianContacts: TechnicianContact[] = [
  {
    id: "TECH-001",
    name: "Teknisi Brake & Pneumatic",
    email: "mr.plankton363@gmail.com",
    specialization: ["Brake System", "Pneumatic"],
    status: "available"
  },
  {
    id: "TECH-002",
    name: "Teknisi Operasional & Control Center",
    email: "raenaldi.ardiansyah30@gmail.com",
    specialization: ["Operations", "Control Center", "General"],
    status: "available"
  },
  {
    id: "TECH-003",
    name: "Teknisi Genset & Electrical",
    email: "faizahzahraaqilah@gmail.com",
    specialization: ["Genset", "Electrical"],
    status: "available"
  },
  {
    id: "TECH-004",
    name: "Teknisi Door & HVAC",
    email: "albiang03@gmail.com",
    specialization: ["Door System", "HVAC"],
    status: "available"
  },
  {
    id: "TECH-005",
    name: "Teknisi Inspeksi Maintenance",
    email: "prasd.wibawa@gmail.com",
    specialization: ["Brake System", "HVAC", "Maintenance"],
    status: "available"
  }
];
