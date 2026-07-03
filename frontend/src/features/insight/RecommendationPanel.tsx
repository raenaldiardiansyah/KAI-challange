import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Insight } from "@/types/insight";

export function RecommendationPanel({ insight }: { insight: Insight }) {
  return (
    <Card title="Rekomendasi Tindakan" eyebrow="Saran dari sistem">
      <p className="recommendation">{insight.recommendation}</p>
      <Button icon={<CheckCircle size={16} />}>Buat Draft SPK</Button>
    </Card>
  );
}
