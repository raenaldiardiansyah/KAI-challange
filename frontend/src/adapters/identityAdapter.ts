export type TrainsetIdentity = {
  trainsetId: string;
  displayCode: string;
  displayName: string;
};

export type CarIdentity = {
  carId: string;
  displayCode: string;
  trainsetId: string;
  order: number;
};

const trainsetIdentities: Record<string, Omit<TrainsetIdentity, "trainsetId">> = {
  KA_DATA_DUMMY: { displayCode: "TS-001", displayName: "KA DATA DUMMY" },
  KA_DUMMY_DATA: { displayCode: "TS-002", displayName: "KA DUMMY DATA" },
  "KA-DUMMY-DATA": { displayCode: "TS-002", displayName: "KA DUMMY DATA" }
};

const carIdentities: Record<string, Record<string, Omit<CarIdentity, "carId" | "trainsetId">>> = {
  KA_DATA_DUMMY: {
    M102401: { displayCode: "C1", order: 1 },
    M102402: { displayCode: "C2", order: 2 },
    T102401: { displayCode: "C3", order: 3 }
  },
  KA_DUMMY_DATA: {
    K102401: { displayCode: "C1", order: 1 },
    K102402: { displayCode: "C2", order: 2 },
    K102403: { displayCode: "C3", order: 3 },
    K102404: { displayCode: "C4", order: 4 }
  }
};

export function getTrainsetIdentity(trainsetId: string, backendName?: string | null): TrainsetIdentity {
  const identity = trainsetIdentities[trainsetId];
  return {
    trainsetId,
    displayCode: identity?.displayCode ?? trainsetId,
    displayName: backendName?.trim() || identity?.displayName || trainsetId
  };
}

export function getCarIdentity(trainsetId: string, carId: string): CarIdentity {
  const identity = carIdentities[trainsetId]?.[carId];
  return {
    trainsetId,
    carId,
    displayCode: identity?.displayCode ?? carId,
    order: identity?.order ?? 0
  };
}
