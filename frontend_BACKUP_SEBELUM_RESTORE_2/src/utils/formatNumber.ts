export function formatNumber(value: number, suffix = "") {
  return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(value)}${suffix}`;
}
