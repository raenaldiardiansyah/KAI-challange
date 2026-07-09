import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ScaledDashboardContent } from "./ScaledDashboardContent";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main>
        <Topbar />
        <ScaledDashboardContent>
          {children}
        </ScaledDashboardContent>
      </main>
    </div>
  );
}
