import type { ComponentType } from "react";
import {
  ChartDonut,
  Train,
  TrainRegional,
  Lightbulb,
  Wrench,
  Broadcast,
  Warning,
  ClipboardText,
  FileText,
  GearSix,
} from "@phosphor-icons/react/dist/ssr";

export type Route = {
  href: string;
  label: string;
  shortLabel?: string;
  icon: ComponentType<any>;
};

export const routes: Route[] = [
  { href: "/overview", label: "Ringkasan", shortLabel: "Ringkas", icon: ChartDonut },
  { href: "/trainset", label: "Armada", shortLabel: "Armada", icon: Train },
  { href: "/car-detail", label: "Gerbong", shortLabel: "Gerbong", icon: TrainRegional },
  { href: "/insight-analytic", label: "Insight", shortLabel: "Insight", icon: Lightbulb },
  { href: "/predictive-maintenance", label: "Prediktif", shortLabel: "Predik", icon: Wrench },
  { href: "/live-monitoring", label: "Pantauan", shortLabel: "Pantau", icon: Broadcast },
  { href: "/alarm-center", label: "Alarm", shortLabel: "Alarm", icon: Warning },
  { href: "/work-order", label: "SPK", shortLabel: "SPK", icon: ClipboardText },
  { href: "/report-analytics", label: "Laporan", shortLabel: "Laporan", icon: FileText },
  { href: "/settings", label: "Pengaturan", shortLabel: "Atur", icon: GearSix },
];
