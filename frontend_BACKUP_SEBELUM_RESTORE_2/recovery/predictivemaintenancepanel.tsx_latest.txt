"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { MetricDelta } from "@/components/ui/MetricDelta";
import {
  subscribeDashboardScale,
  getInitialDashboardScale,
  getDashboardScaleServerSnapshot
} from "@/lib/dashboardScale";
import type { Insight } from "@/types/insight";
import type { MaintenanceRisk } from "@/types/maintenance";

type PredictiveMaintenancePanelProps = {
  risks: MaintenanceRisk[];
  insights: Insight[];
};

export function PredictiveMaintenancePanel({ risks, insights = [] }: PredictiveMaintenancePanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const dashboardScale = useSyncExternalStore(
    subscribeDashboardScale,
    getInitialDashboardScale,
    getDashboardScaleServerSnapshot
  );

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

  return (
    <Card
      title="Insight LLM Prediktif"
      action={<Link className="button button-secondary table-mini-button" href="/predictive-maintenance">Lihat prediktif</Link>}
    >
      <div className="overview-llm-preview">
        {risks.length > 0 ? (
          <div className="overview-priority-count">
            Menganalisis {risks.length} rekomendasi prediktif aktif
          </div>
        ) : null}

        {insights.length > 0 ? (
          <div className="overview-llm-carousel-container" style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <div 
                className="overview-llm-card-track" 
                style={{ 
                  display: "flex", 
                  width: `${insights.length * 100}%`,
                  transition: "transform 0.5s ease-in-out", 
                  transform: `translateX(-${(currentIndex * 100) / insights.length}%)`,
                  height: "100%"
                }}
              >
                {insights.map((insight, idx) => (
                  <div key={idx} className="overview-llm-card" style={{ width: `${100 / insights.length}%`, flexShrink: 0 }}>
                    <div>
                      <strong>C{insight.carNumber} {insight.subsystem} - {insight.trainsetName}</strong>
                      <p>{insight.naturalInsight}</p>
                    </div>

                    <p className="overview-llm-recommendation">{insight.recommendation}</p>

                    <div className="overview-llm-metrics" aria-label="Metrik LLM prediktif">
                      <span>
                        Akurasi
                        <strong>{insight.confidence}%</strong>
                        <MetricDelta value={insight.confidence} compact />
                      </span>
                      <span>
                        Kesehatan
                        <strong>{insight.healthScore}%</strong>
                        <MetricDelta value={insight.healthScore} compact />
                      </span>
                      <span>{insight.trainsetId} - C{insight.carNumber}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {insights.length > 1 && (
              <>
                <button 
                  onClick={handlePrev} 
                  className="button button-secondary" 
                  style={{ position: 'absolute', left: '-12px', top: '50%', transform: 'translateY(-50%)', padding: '6px', minWidth: 'unset', zIndex: 10 }} 
                  aria-label="Previous insight"
                >
                  <CaretLeft size={16} />
                </button>
                <button 
                  onClick={handleNext} 
                  className="button button-secondary" 
                  style={{ position: 'absolute', right: '-12px', top: '50%', transform: 'translateY(-50%)', padding: '6px', minWidth: 'unset', zIndex: 10 }} 
                  aria-label="Next insight"
                >
                  <CaretRight size={16} />
                </button>
              </>
            )}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
