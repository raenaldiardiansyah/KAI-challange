import { Card } from "@/components/ui/Card";
import type { Insight } from "@/types/insight";

export function StructuredInsightViewer({ insight }: { insight: Insight }) {
  return (
    <Card title="Structured Insight JSON" eyebrow="Output analitik backend">
      <pre>{JSON.stringify(insight.structuredInsight, null, 2)}</pre>
    </Card>
  );
}
