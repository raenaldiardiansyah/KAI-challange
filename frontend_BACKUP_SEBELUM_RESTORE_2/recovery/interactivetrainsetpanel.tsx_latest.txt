"use client";

import { useState } from "react";
import { TrainComposition } from "./TrainComposition";
import { PriorityInsightCard } from "./PriorityInsightCard";
import type { Insight } from "@/types/insight";

export function InteractiveTrainsetPanel({ carInsights }: { carInsights: Insight[] }) {
  // Initial state: choose the car with the highest severity. 
  // In our dummy data, Car 5 has "High" severity.
  const defaultCar = carInsights.find(c => c.severity === "High") || carInsights[0];
  const [selectedCarNum, setSelectedCarNum] = useState(defaultCar.carNumber);

  const selectedInsight = carInsights.find(c => c.carNumber === selectedCarNum) || defaultCar;

  return (
    <>
      <TrainComposition
        totalCars={carInsights.length}
        selectedCar={selectedCarNum}
        onSelectCar={setSelectedCarNum}
        carsInsights={carInsights}
      />
      <PriorityInsightCard insight={selectedInsight} />
    </>
  );
}
