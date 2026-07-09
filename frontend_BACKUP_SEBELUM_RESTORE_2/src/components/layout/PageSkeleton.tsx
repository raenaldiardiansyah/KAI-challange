import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

function SkeletonCard() {
  return (
    <Card>
      <div className="skeleton-card-content">
        <Skeleton className="skeleton-icon" />
        <div>
          <Skeleton className="skeleton-line skeleton-line-md" />
          <Skeleton className="skeleton-line skeleton-line-sm" />
        </div>
      </div>
    </Card>
  );
}

function SkeletonTable() {
  return (
    <Card title="Memuat Data" eyebrow="Menyiapkan tabel">
      <div className="skeleton-table">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="skeleton-table-row">
            <Skeleton className="skeleton-line" />
            <Skeleton className="skeleton-line skeleton-line-sm" />
            <Skeleton className="skeleton-pill" />
            <Skeleton className="skeleton-line skeleton-line-md" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function PageSkeleton() {
  return (
    <div className="page-grid page-skeleton">
      <section className="summary-grid">
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </section>

      <section className="skeleton-main-grid">
        <Card title="Memuat Panel Utama" eyebrow="Menyiapkan visualisasi">
          <Skeleton className="skeleton-toolbar" />
          <Skeleton className="skeleton-chart" />
          <div className="skeleton-caption-row">
            <Skeleton className="skeleton-pill" />
            <Skeleton className="skeleton-pill" />
            <Skeleton className="skeleton-pill" />
          </div>
        </Card>

        <Card title="Memuat Detail" eyebrow="Menyiapkan informasi">
          <div className="skeleton-stack">
            <Skeleton className="skeleton-line skeleton-line-lg" />
            <Skeleton className="skeleton-line" />
            <Skeleton className="skeleton-line skeleton-line-md" />
            <Skeleton className="skeleton-panel" />
          </div>
        </Card>
      </section>

      <SkeletonTable />
    </div>
  );
}
