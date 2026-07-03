import type { Trainset } from "@/types/trainset";
import { TrainsetCard } from "./TrainsetCard";

export function TrainsetList({ trainsets }: { trainsets: Trainset[] }) {
  return <div className="list-grid">{trainsets.map((trainset) => <TrainsetCard key={trainset.id} trainset={trainset} />)}</div>;
}
