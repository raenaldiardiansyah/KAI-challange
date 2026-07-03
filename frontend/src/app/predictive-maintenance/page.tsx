import { MaintenanceActionButton } from "@/features/predictive-maintenance/MaintenanceActionButton";
import { RiskSummary } from "@/features/predictive-maintenance/RiskSummary";
import { RiskRanking } from "@/features/predictive-maintenance/RiskRanking";
import { RiskTrendChart } from "@/features/predictive-maintenance/RiskTrendChart";
import { MaintenanceTable } from "@/features/predictive-maintenance/MaintenanceTable";
import { getMaintenanceRisks } from "@/services/maintenanceService";

export default async function PredictiveMaintenancePage() {
  const risks = await getMaintenanceRisks();

  return (
    <div className="page-grid predictive-command-layout">
      <header className="section-action">
        <MaintenanceActionButton />
      </header>
      
      <section>
        <RiskSummary risks={risks} />
      </section>

      <section className="risk-command-grid">
        <RiskRanking />
        <RiskTrendChart />
      </section>

      <section>
        <MaintenanceTable risks={risks} />
      </section>
    </div>
  );
}
