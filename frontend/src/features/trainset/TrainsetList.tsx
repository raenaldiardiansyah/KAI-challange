import type { Trainset } from "@/types/trainset";
import Link from "next/link";
import { TrainsetCard } from "./TrainsetCard";

type TrainsetListPagination = {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

type TrainsetListProps = {
  trainsets: Trainset[];
  selectedTrainsetId: string;
  pagination: TrainsetListPagination;
};

function buildTrainsetPageHref(page: number, selectedTrainsetId: string) {
  return `/trainset?trainset=${encodeURIComponent(selectedTrainsetId)}&trainsetPage=${page}`;
}

export function TrainsetList({ trainsets, selectedTrainsetId, pagination }: TrainsetListProps) {
  const showPagination = pagination.totalItems > pagination.pageSize;
  const fromItem = ((pagination.currentPage - 1) * pagination.pageSize) + 1;
  const toItem = Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems);

  return (
    <>
      {showPagination && (
        <div className="trainset-list-pagination" aria-label="Paginasi armada">
          <span>{fromItem}-{toItem} dari {pagination.totalItems}</span>
          <div>
            <Link
              aria-disabled={pagination.currentPage === 1}
              className={pagination.currentPage === 1 ? "disabled" : ""}
              href={buildTrainsetPageHref(Math.max(1, pagination.currentPage - 1), selectedTrainsetId)}
            >
              Sebelumnya
            </Link>
            <Link
              aria-disabled={pagination.currentPage === pagination.totalPages}
              className={pagination.currentPage === pagination.totalPages ? "disabled" : ""}
              href={buildTrainsetPageHref(Math.min(pagination.totalPages, pagination.currentPage + 1), selectedTrainsetId)}
            >
              Berikutnya
            </Link>
          </div>
        </div>
      )}
      <div className="list-grid">
        {trainsets.map((trainset) => (
          <TrainsetCard
            key={trainset.id}
            trainset={trainset}
            active={trainset.id === selectedTrainsetId}
            page={pagination.currentPage}
          />
        ))}
      </div>
    </>
  );
}
