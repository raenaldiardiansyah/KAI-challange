import { InsightWorkspace } from "@/features/insight/InsightWorkspace";
import { getInsights } from "@/services/insightService";

export default async function InsightAnalyticPage() {
  const insights = await getInsights();

  return <InsightWorkspace insights={insights} />;
}
