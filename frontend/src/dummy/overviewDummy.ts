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
  alarms: alarmDummy,
  maintenance: maintenanceDummy,
  mapPoints: mapDummy
};
