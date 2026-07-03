type Point = { label: string; value: number };

export function LineChart({ points, label }: { points: Point[]; label: string }) {
  const max = Math.max(...points.map((point) => point.value), 1);
  const width = 320;
  const height = 120;
  const path = points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width;
      const y = height - (point.value / max) * (height - 12) - 6;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="chart" aria-label={label}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        <path d={path} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <div className="chart-labels">
        {points.map((point) => <span key={point.label}>{point.label}</span>)}
      </div>
    </div>
  );
}
