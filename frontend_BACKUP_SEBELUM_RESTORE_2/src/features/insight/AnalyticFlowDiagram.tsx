"use client";

import { Card } from "@/components/ui/Card";

export function AnalyticFlowDiagram() {
  const steps = [
    { label: "Data Sensor", desc: "Brake Pipe & Brake Cylinder mentah" },
    { label: "Rule Base", desc: "Validasi threshold" },
    { label: "Deteksi Event", desc: "Deviasi lokal" },
    { label: "JSON Insight", desc: "Output terstruktur" },
    { label: "LLM Engine", desc: "Penerjemahan konteks" },
    { label: "Natural Insight", desc: "Insight akhir" }
  ];

  return (
    <Card title="Alur Pemrosesan Insight" eyebrow="Arsitektur Backend">
      <div className="analytic-flow">
        {steps.map((step, idx) => (
          <div className="analytic-flow-item" key={step.label}>
            <div className={idx === steps.length - 1 ? "analytic-step final" : "analytic-step"}>
              <strong>{step.label}</strong>
              <span>{step.desc}</span>
            </div>
            {idx < steps.length - 1 ? (
              <div className="analytic-connector">
                <span className="analytic-badge">{idx + 1}</span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
