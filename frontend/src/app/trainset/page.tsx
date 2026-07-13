"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { TrainsetDetailSummary } from "@/features/trainset/TrainsetDetailSummary";
import { TrainsetList } from "@/features/trainset/TrainsetList";
import { TrainsetComposition } from "@/features/trainset/TrainsetComposition";
import { PriorityCars } from "@/features/trainset/PriorityCars";
import { HealthByCarChart } from "@/features/trainset/HealthByCarChart";
import { SubsystemHeatmap } from "@/features/trainset/SubsystemHeatmap";
import { getTrainsetPageData, trainsetPageDummyData, type TrainsetPageData } from "@/services/trainsetService";
import type { Insight } from "@/types/insight";
import type { Trainset } from "@/types/trainset";
import { useRamsResource } from "@/hooks/useRamsResource";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { DataUnavailableState } from "@/components/data/DataUnavailableState";

const TRAINSET_PAGE_SIZE = 3;

function buildTrainsetCarInsights(trainset: Trainset, allInsights: Insight[]) {
  const selectedIssues = allInsights.filter((insight) => insight.trainsetId === trainset.id);
  const normalInsights = allInsights.filter((insight) => insight.trainsetId === "ALL");

  return Array.from({ length: trainset.totalCars }, (_, index) => {
    const carNumber = index + 1;
    const selectedIssue = selectedIssues.find((insight) => insight.carNumber === carNumber);
    const normalInsight = normalInsights.find((insight) => insight.carNumber === carNumber);

    if (selectedIssue) return selectedIssue;

    if (normalInsight) {
      return {
        ...normalInsight,
        id: `${trainset.id}-${normalInsight.id}`,
        trainsetId: trainset.id,
        trainsetName: trainset.name
      };
    }

    return undefined;
  }).filter((insight): insight is Insight => Boolean(insight));
}

export default function TrainsetPage() {
  const searchParams = useSearchParams();
  const loader = useCallback((signal: AbortSignal) => getTrainsetPageData(signal), []);
  const resource = useRamsResource<TrainsetPageData>(trainsetPageDummyData, loader, 30_000);

  if (!resource.ready || resource.loading) return <PageSkeleton />;
  if (!resource.data || resource.data.trainsets.length === 0) {
    return <DataUnavailableState message={resource.error} onRetry={resource.retry} />;
  }

  const { trainsets, carInsights: allCarInsights } = resource.data;
  const selectedTrainset = trainsets.find((trainset) => trainset.id === searchParams.get("trainset")) ?? trainsets[0];
  const totalTrainsetPages = Math.max(1, Math.ceil(trainsets.length / TRAINSET_PAGE_SIZE));
  const selectedIndex = Math.max(0, trainsets.findIndex((trainset) => trainset.id === selectedTrainset.id));
  const trainsetPageParam = searchParams.get("trainsetPage");
  const pageFromQuery = trainsetPageParam ? Number.parseInt(trainsetPageParam, 10) : NaN;
  const defaultPage = Math.floor(selectedIndex / TRAINSET_PAGE_SIZE) + 1;
  const currentTrainsetPage = Number.isFinite(pageFromQuery)
    ? Math.min(Math.max(pageFromQuery, 1), totalTrainsetPages)
    : defaultPage;
  const visibleTrainsets = trainsets.slice(
    (currentTrainsetPage - 1) * TRAINSET_PAGE_SIZE,
    currentTrainsetPage * TRAINSET_PAGE_SIZE
  );
  const carInsights = buildTrainsetCarInsights(selectedTrainset, allCarInsights);

  return (
    <div className="page-grid trainset-master-layout">
      <aside className="master-list-panel">
        <TrainsetList
          trainsets={visibleTrainsets}
          selectedTrainsetId={selectedTrainset.id}
          pagination={{
            currentPage: currentTrainsetPage,
            pageSize: TRAINSET_PAGE_SIZE,
            totalItems: trainsets.length,
            totalPages: totalTrainsetPages
          }}
        />
      </aside>
      <section className="stack detail-workspace">
        <TrainsetDetailSummary trainset={selectedTrainset} />
        
        <TrainsetComposition trainsetId={selectedTrainset.id} totalCars={selectedTrainset.totalCars} carsInsights={carInsights} />
        
        <div className="two-column-grid">
          <PriorityCars carsInsights={carInsights} />
          <HealthByCarChart carsInsights={carInsights} />
        </div>
        
        <SubsystemHeatmap trainsetId={selectedTrainset.id} trainsetName={selectedTrainset.name} totalCars={selectedTrainset.totalCars} carsInsights={carInsights} />
      </section>
    </div>
  );
}
