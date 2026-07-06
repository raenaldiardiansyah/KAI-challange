"use client";

import { CheckCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Insight } from "@/types/insight";
import { useRouter } from "next/navigation";

export function RecommendationPanel({ insight }: { insight: Insight }) {
  const router = useRouter();
  return (
    <Card title="Rekomendasi Tindakan" eyebrow="Saran dari sistem">
      <p className="recommendation">{insight.recommendation}</p>
      <Button
        icon={<CheckCircle size={16} />}
        onClick={() => router.push("/work-order")}
        style={{ alignSelf: "flex-start" }}
      >
        Buat Draft SPK
      </Button>
    </Card>
  );
}