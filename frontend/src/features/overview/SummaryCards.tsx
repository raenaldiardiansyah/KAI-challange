import { Broadcast, Train, Warning, Wrench, Heartbeat, Brain, TrendUp, TrendDown } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/Card";
import type { OverviewData } from "@/services/overviewService";
import Link from "next/link";

export function SummaryCards({ summary }: { summary: OverviewData["summary"] }) {
  const items = [
    { label: "Armada Aktif", value: `${summary.onlineTrainsets}/${summary.totalTrainsets}`, icon: <Broadcast size={24} weight="fill" color="var(--accent)" />, link: "/live-monitoring" },
    { label: "Total Gerbong", value: summary.totalCars, icon: <Train size={24} weight="fill" color="var(--muted)" />, link: "/trainset" },
    { label: "Kesehatan Global", value: `${summary.globalHealthScore}%`, icon: <Wrench size={24} weight="fill" color="#10b981" />, link: "/predictive-maintenance", delta: "1.2%", dir: "down", deltaColor: "#10b981" },
    { label: "Alarm Aktif", value: summary.activeAlarms, icon: <Warning size={24} weight="fill" color="var(--danger)" />, link: "/alarm-center", delta: "2", dir: "up", deltaColor: "var(--danger)" },
    { label: "Risiko Prediktif", value: 2, icon: <Heartbeat size={24} weight="fill" color="var(--warning)" />, link: "/predictive-maintenance", delta: "1", dir: "up", deltaColor: "var(--danger)" },
    { label: "Insight LLM", value: 3, icon: <Brain size={24} weight="fill" color="#2563eb" />, link: "/insight-analytic", delta: "1", dir: "up", deltaColor: "var(--danger)" }
  ];

  return (
    <div className="summary-grid-6">
      {items.map((item) => (
        <Card key={item.label} className="summary-card-container">
          <Link
            href={item.link}
            className="summary-card"
            title={`${item.value} ${item.label}${item.delta ? `, perubahan ${item.delta}` : ""}`}
          >
            <div className="summary-card-icon">{item.icon}</div>
            <div className="summary-card-content">
              <span className="summary-card-value">{item.value}</span>
              <span className="summary-card-label">{item.label}</span>
            </div>
            {item.delta && (
              <div className="summary-card-delta" style={{ color: item.deltaColor }}>
                {item.dir === "up" ? <TrendUp size={14} weight="bold" /> : <TrendDown size={14} weight="bold" />}
                <span>{item.delta}</span>
              </div>
            )}
          </Link>
        </Card>
      ))}
    </div>
  );
}
