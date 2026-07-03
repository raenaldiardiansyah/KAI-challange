type Bar = { label: string; value: number };

export function BarChart({ bars }: { bars: Bar[] }) {
  const max = Math.max(...bars.map((bar) => bar.value), 1);

  return (
    <div className="bar-chart">
      {bars.map((bar) => (
        <div className="bar-row" key={bar.label}>
          <span>{bar.label}</span>
          <div><span style={{ width: `${(bar.value / max) * 100}%` }} /></div>
          <strong>{bar.value}</strong>
        </div>
      ))}
    </div>
  );
}
