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
  "KA-DUMMY-DATA": { displayCode: "TS-002", displayName: "KA DUMMY DATA" },
  KA_OFFLINE_DEMO: { displayCode: "TS-003", displayName: "KA OFFLINE DEMO" }
};

const carIdentities: Record<string, Record<string, Omit<CarIdentity, "carId" | "trainsetId">>> = {
  KA_DATA_DUMMY: {
    M102401: { displayCode: "C1", order: 1 },
    M102402: { displayCode: "C2", order: 2 },
    T102401: { displayCode: "C3", order: 3 },
    D102404: { displayCode: "C4", order: 4 },
    D102405: { displayCode: "C5", order: 5 },
    D102406: { displayCode: "C6", order: 6 },
    D102407: { displayCode: "C7", order: 7 },
    D102408: { displayCode: "C8", order: 8 },
    D102409: { displayCode: "C9", order: 9 },
    D102410: { displayCode: "C10", order: 10 }
  },
  KA_DUMMY_DATA: {
    K102401: { displayCode: "C1", order: 1 },
    K102402: { displayCode: "C2", order: 2 },
    K102403: { displayCode: "C3", order: 3 },
    K102404: { displayCode: "C4", order: 4 },
    K102405: { displayCode: "C5", order: 5 },
    K102406: { displayCode: "C6", order: 6 },
    K102407: { displayCode: "C7", order: 7 },
    K102408: { displayCode: "C8", order: 8 },
    K102409: { displayCode: "C9", order: 9 }
  },
  KA_OFFLINE_DEMO: {
    O102401: { displayCode: "C1", order: 1 },
    O102402: { displayCode: "C2", order: 2 },
    O102403: { displayCode: "C3", order: 3 },
    O102404: { displayCode: "C4", order: 4 },
    O102405: { displayCode: "C5", order: 5 },
    O102406: { displayCode: "C6", order: 6 },
    O102407: { displayCode: "C7", order: 7 },
    O102408: { displayCode: "C8", order: 8 }
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

export function resolveTrainsetId(value: string) {
  return Object.entries(trainsetIdentities).find(([, identity]) => identity.displayCode === value)?.[0] ?? value;
}

export function resolveCarId(trainsetId: string, value: string) {
  const normalizedTrainsetId = resolveTrainsetId(trainsetId);
  return Object.entries(carIdentities[normalizedTrainsetId] ?? {}).find(([, identity]) => identity.displayCode === value)?.[0] ?? value;
}
