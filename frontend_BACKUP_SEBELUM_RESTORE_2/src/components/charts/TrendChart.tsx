import { LineChart } from "./LineChart";

export function TrendChart({ title, values }: { title: string; values: number[] }) {
  return <LineChart label={title} points={values.map((value, index) => ({ label: `T${index + 1}`, value }))} />;
}
