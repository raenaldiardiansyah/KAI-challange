"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function DataUnavailableState({ message, onRetry }: { message?: string | null; onRetry: () => void }) {
  return (
    <div className="page-grid">
      <Card title="Data RAMS belum tersedia" eyebrow="Live API">
        <div className="stack">
          <p>{message || "Backend belum memberikan data untuk halaman ini."}</p>
          <div><Button onClick={onRetry}>Coba Lagi</Button></div>
        </div>
      </Card>
    </div>
  );
}
