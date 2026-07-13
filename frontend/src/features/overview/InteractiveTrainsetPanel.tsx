"use client";

import { useState } from "react";
import { TrainComposition } from "./TrainComposition";
import { PriorityInsightCard } from "./PriorityInsightCard";
import type { Insight } from "@/types/insight";
import type { OverviewData } from "@/services/overviewService";

type TrainsetComposition = OverviewData["trainsetCompositions"][number];

const severityPriority: Record<Insight["severity"], number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
  Normal: 0
};

function getPriorityInsight(composition: TrainsetComposition) {
  return [...composition.carInsights].sort((left, right) => (
    severityPriority[right.severity] - severityPriority[left.severity]
  ))[0];
}

export function InteractiveTrainsetPanel({ compositions }: { compositions: TrainsetComposition[] }) {
  const [selectedTrainsetIndex, setSelectedTrainsetIndex] = useState(0);
  const [selectedCars, setSelectedCars] = useState<Record<string, number>>({});
  const safeIndex = Math.min(selectedTrainsetIndex, Math.max(compositions.length - 1, 0));
  const composition = compositions[safeIndex];

  if (!composition) return null;

  const defaultInsight = getPriorityInsight(composition) ?? composition.carInsights[0];
  if (!defaultInsight) return null;

  const selectedCarNum = selectedCars[composition.trainsetId] ?? defaultInsight.carNumber;
  const selectedInsight = composition.carInsights.find((item) => item.carNumber === selectedCarNum) ?? defaultInsight;

  const selectCar = (carNumber: number) => {
    setSelectedCars((current) => ({ ...current, [composition.trainsetId]: carNumber }));
  };

  const showPreviousTrainset = () => {
    setSelectedTrainsetIndex((current) => (current <= 0 ? compositions.length - 1 : current - 1));
  };

  const showNextTrainset = () => {
    setSelectedTrainsetIndex((current) => (current + 1) % compositions.length);
  };

  return (
    <div className="overview-left-stack">
      <TrainComposition
        totalCars={composition.totalCars}
        selectedCar={selectedCarNum}
        onSelectCar={selectCar}
        carsInsights={composition.carInsights}
        trainsetCode={composition.displayCode}
        trainsetName={composition.displayName}
        currentTrainsetIndex={safeIndex}
        totalTrainsets={compositions.length}
        onPreviousTrainset={showPreviousTrainset}
        onNextTrainset={showNextTrainset}
      />
      <PriorityInsightCard insight={selectedInsight} />
    </div>
  );
}
