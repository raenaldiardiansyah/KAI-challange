"use client";

import { Card } from "@/components/ui/Card";
import type { Insight } from "@/types/insight";
import { useRouter } from "next/navigation";

export function SubsystemHeatmap({ totalCars, carsInsights }: { totalCars: number, carsInsights: Insight[] }) {
  const router = useRouter();
  const subsystems = ["Brake System", "Door", "HVAC", "Genset", "Speed & GPS"];
  
  // Create dummy statuses for heatmap based on the insights provided
  // In a real app, this would come from a structured subsystem status matrix per car
  const getSubsystemStatus = (carNum: number, sys: string) => {
    const insight = carsInsights.find(c => c.carNumber === carNum);
    if (insight && insight.subsystem === sys && insight.severity !== "Normal") {
      return insight.severity; // High, Medium, dll
    }
    
    if (carNum === 5 && sys === "Brake System") return "Critical"; // Baru/Kritis (Merah pekat)
    if (carNum === 7 && sys === "Door") return "High"; // Merah standar
    if (carNum === 2 && sys === "Genset") return "Medium"; // Merah memudar
    if (carNum === 3 && sys === "HVAC") return "Resolved"; // Selesai (Sangat pudar)
    return "Normal"; // Kosong
  };

  const getColor = (status: string) => {
    switch (status) {
      case "Critical": 
      case "Alarm": return "#b91c1c"; // Merah gelap (paling intens)
      case "High": return "#ef4444"; // Merah terang
      case "Medium":
      case "Warning": return "#fca5a5"; // Merah pudar (sedang proses/menurun)
      case "Low":
      case "Watch":
      case "Resolved": return "#fee2e2"; // Merah sangat pudar (sudah selesai)
      default: return "#f1f5f9"; // Normal (abu-abu/kosong seperti github tanpa aktivitas)
    }
  };

  return (
    <Card title="Peta Risiko Subsistem" eyebrow="Distribusi status">
      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: `120px repeat(${totalCars}, minmax(40px, 1fr))`, gap: "4px", minWidth: "600px" }}>
          {/* Header row */}
          <div style={{ padding: "8px", fontSize: "12px", color: "#64748b", fontWeight: "bold" }}>Subsistem</div>
          {Array.from({ length: totalCars }, (_, i) => (
            <div key={`header-${i}`} style={{ padding: "8px", textAlign: "center", fontSize: "12px", color: "#64748b", fontWeight: "bold" }}>
              C{i + 1}
            </div>
          ))}

          {/* Data rows */}
          {subsystems.map(sys => (
            <div style={{ display: "contents" }} key={sys}>
              <div style={{ padding: "8px", fontSize: "13px", fontWeight: "bold", borderRight: "1px solid #e2e8f0", display: "flex", alignItems: "center" }}>
                {sys}
              </div>
              {Array.from({ length: totalCars }, (_, i) => {
                const status = getSubsystemStatus(i + 1, sys);
                return (
                  <div key={`${sys}-${i}`} style={{ padding: "4px" }}>
                    <div
                      title={`Gerbong ${i + 1} - ${sys}: ${status}`}
                      style={{
                        height: "32px",
                        background: getColor(status),
                        borderRadius: "4px",
                        border: status === "Normal" ? "1px solid var(--line, #e2e8f0)" : "1px solid #fecaca",
                        opacity: status === "Normal" ? 0.72 : 0.95,
                        cursor: "pointer"
                      }}
                      onClick={() => router.push("/car-detail")}
                      onMouseOver={(e) => e.currentTarget.style.opacity = "1"}
                      onMouseOut={(e) => e.currentTarget.style.opacity = "0.9"}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
