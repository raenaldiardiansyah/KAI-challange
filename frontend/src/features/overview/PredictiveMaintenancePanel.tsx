"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import type { Insight } from "@/types/insight";
import type { MaintenanceRisk } from "@/types/maintenance";

type PredictiveMaintenancePanelProps = {
  risks: MaintenanceRisk[];
  insights: Insight[];
};

export function PredictiveMaintenancePanel({ risks, insights = [] }: PredictiveMaintenancePanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (insights.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % insights.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [insights.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? insights.length - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % insights.length);
  };

  const insight = insights[currentIndex];

  return (
    <Card 
      title="Insight LLM Prediktif" 
      action={<Link href="/insight-analytic" className="button button-secondary table-mini-button">Lihat Insight</Link>}
      className="llm-insight-card"
    >
      <div className="llm-insight-body">
        {insight ? (
          <>
            <h4 className="llm-insight-title">C{insight.carNumber} {insight.diagnosis} - {insight.trainsetName}</h4>
            <p className="llm-insight-text">{insight.naturalInsight}</p>
            <div className="llm-insight-recommendation">
              <strong style={{ display: "block", marginBottom: "4px" }}>Rekomendasi:</strong>
              {insight.recommendation}
            </div>
            <div className="llm-insight-metrics">
              <span>Akurasi {insight.confidence}%</span>
              <span>Kesehatan {insight.healthScore}%</span>
              <span>{insight.trainsetId} - C{insight.carNumber}</span>
            </div>
          </>
        ) : (
          <div className="overview-empty-state" style={{ margin: "auto" }}>
            <strong>Tidak ada insight</strong>
            <span>Sistem berjalan normal.</span>
          </div>
        )}

        {insights.length > 1 && (
          <>
            <button 
              onClick={handlePrev} 
              style={{ position: 'absolute', left: '-12px', top: '50%', transform: 'translateY(-50%)', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }} 
              aria-label="Previous insight"
            >
              <CaretLeft size={16} />
            </button>
            <button 
              onClick={handleNext} 
              style={{ position: 'absolute', right: '-12px', top: '50%', transform: 'translateY(-50%)', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }} 
              aria-label="Next insight"
            >
              <CaretRight size={16} />
            </button>
          </>
        )}
      </div>
    </Card>
  );
}
