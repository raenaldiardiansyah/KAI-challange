import { alarmDummy } from "./alarmDummy";
import { insightDummy, carInsightsDummy } from "./insightDummy";
import { mapDummy } from "./mapDummy";
import { maintenanceDummy } from "./maintenanceDummy";
import { trainsetDummy } from "./trainsetDummy";
import type { OverviewData } from "@/services/overviewService";

export const overviewDummy: OverviewData = {
  summary: {
    onlineTrainsets: trainsetDummy.filter((trainset) => trainset.online).length,
    totalTrainsets: trainsetDummy.length,
    totalCars: trainsetDummy.reduce((sum, trainset) => sum + trainset.totalCars, 0),
    onlineCars: trainsetDummy.filter((trainset) => trainset.online).reduce((sum, trainset) => sum + trainset.totalCars, 0),
    criticalAlarms: alarmDummy.filter((alarm) => alarm.severity === "Critical").length,
    dataAvailabilityPercent: 96.8,
    globalHealthScore: 66,
    activeAlarms: alarmDummy.filter((alarm) => alarm.status === "Open").length,
    predictiveRisks: maintenanceDummy.length,
    insightCount: insightDummy.length,
    showTrends: true
  },
  trainsets: trainsetDummy,
  priorityInsight: insightDummy[0],
  insights: insightDummy,
  carInsights: carInsightsDummy,
  trainsetCompositions: trainsetDummy
    .map((trainset) => ({
      trainsetId: trainset.id,
      displayCode: trainset.id,
      displayName: trainset.name,
      totalCars: trainset.totalCars,
      cars: [],
      carInsights: carInsightsDummy.filter((insight) => insight.trainsetId === trainset.id)
    }))
    .filter((composition) => composition.carInsights.length > 0),
  alarms: alarmDummy,
  maintenance: maintenanceDummy,
  mapPoints: mapDummy
};
