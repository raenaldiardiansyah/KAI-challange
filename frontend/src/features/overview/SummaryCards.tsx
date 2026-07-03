import { Broadcast, Train, Warning, Wrench } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/Card";
import { MetricDelta } from "@/components/ui/MetricDelta";
import type { OverviewData } from "@/services/overviewService";

export function SummaryCards({ summary }: { summary: OverviewData["summary"] }) {
  const items = [
    { label: "Armada Aktif", value: `${summary.onlineTrainsets}/${summary.totalTrainsets}`, icon: <Broadcast size={20} /> },
    { label: "Total Gerbong", value: summary.totalCars, icon: <Train size={20} /> },
    { label: "Kesehatan Global", value: `${summary.globalHealthScore}%`, icon: <Wrench size={20} />, percentValue: summary.globalHealthScore },
    { label: "Alarm Aktif", value: summary.activeAlarms, icon: <Warning size={20} />, alarmDelta: summary.activeAlarms > 2 ? 2 : -1 }
  ];

  return (
    <div className="summary-grid">
      {items.map((item) => (
        <Card key={item.label}>
          <div className="metric-card">
            <span>{item.icon}</span>
            <div>
              <strong>
                {item.percentValue ? (
                  <span className="percent-with-delta">
                    <span>{item.value}</span>
                    <MetricDelta value={item.percentValue} compact />
                  </span>
                ) : item.alarmDelta ? (
                  <span className="percent-with-delta">
                    <span>{item.value}</span>
                    <MetricDelta value={Number(item.value)} delta={item.alarmDelta} inverse compact unit="alarm" label="alarm" />
                  </span>
                ) : item.value}
              </strong>
              <p>{item.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
