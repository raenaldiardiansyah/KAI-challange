export function formatSensorValue(value: number, unit: string) {
  return `${value.toLocaleString("id-ID", { maximumFractionDigits: 2 })} ${unit}`;
}
