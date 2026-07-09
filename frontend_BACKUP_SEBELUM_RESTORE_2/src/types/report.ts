export type Report = {
  id: string;
  title: string;
  period: string;
  generatedAt: string;
  summary: string;
  type: "Insight" | "Alarm" | "Maintenance";
};
