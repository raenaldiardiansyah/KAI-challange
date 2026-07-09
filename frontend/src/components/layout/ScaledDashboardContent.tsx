"use client";

import type { CSSProperties, ReactNode } from "react";
import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import {
  getDashboardScale,
  subscribeDashboardScale
} from "@/lib/dashboardScale";

function getDensityClass(scale: number, isOverview: boolean): string {
  if (scale === 0.5) {
    return isOverview
      ? "dashboard-density-compact overview-compact-fit"
      : "dashboard-density-compact";
  }
  if (scale === 0.75) return "dashboard-density-balanced";
  return "dashboard-density-normal";
}

export function ScaledDashboardContent({ children }: { children: ReactNode }) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const dashboardScale = useSyncExternalStore(
    subscribeDashboardScale,
    getDashboardScale,
    () => 0.5
  );

  const isOverview = pathname === "/overview";
  const isSettings = pathname === "/settings";
  const shouldScale = !isOverview && !isSettings;

  useLayoutEffect(() => {
    if (!shouldScale) return;

    const shell = shellRef.current;
    const canvas = canvasRef.current;
    if (!shell || !canvas) return;

    const updateShellHeight = () => {
      const visualContentHeight = Math.ceil(canvas.scrollHeight * dashboardScale);
      shell.style.height = `${visualContentHeight}px`;

      if (scrollAreaRef.current) {
        const availableHeight = scrollAreaRef.current.parentElement?.clientHeight ?? window.innerHeight;
        const needsScroll = visualContentHeight > availableHeight + 8;
        scrollAreaRef.current.style.overflowY = needsScroll ? "auto" : "hidden";
      }
    };

    updateShellHeight();
    const observer = new ResizeObserver(updateShellHeight);
    observer.observe(canvas);
    window.addEventListener("resize", updateShellHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateShellHeight);
    };
  }, [dashboardScale, shouldScale]);

  // Settings page: no scaling at all
  if (isSettings) {
    return <div className="content-scroll-area" style={{ overflowY: "auto" }}>{children}</div>;
  }

  // Overview page: density mode via CSS classes, no raw transform scale
  if (isOverview) {
    const densityClass = getDensityClass(dashboardScale, isOverview);
    const isOverviewCompact = isOverview && dashboardScale === 0.5;

    if (isOverviewCompact) {
      return (
        <div className="content-scroll-area overview-presentation-scroll" data-overview-compact="true">
          <div className="overview-presentation-viewport">
            <div className="overview-presentation-canvas">
              {children}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="content-scroll-area">
        <div className={densityClass}>
          {children}
        </div>
      </div>
    );
  }

  // All other pages: raw transform scale (existing behavior)
  return (
    <div ref={scrollAreaRef} className="content-scroll-area">
      <div ref={shellRef} className="scaled-dashboard-shell">
        <div
          ref={canvasRef}
          className="scaled-dashboard-wrapper"
          style={{ "--dashboard-scale": dashboardScale } as CSSProperties}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
