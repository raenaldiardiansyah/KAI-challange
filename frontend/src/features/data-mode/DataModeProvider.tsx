"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore
} from "react";
import {
  type DataMode,
  getDataMode,
  getDefaultDataMode,
  setDataMode,
  subscribeDataMode
} from "@/services/api/dataMode";

type DataModeContextValue = {
  mode: DataMode;
  ready: boolean;
  changeMode: (mode: DataMode) => void;
  resourceStatus: { source: "dummy" | "live" | "cache" | "empty"; stale: boolean; fetchedAt: string | null; error: string | null };
  reportResourceStatus: (status: DataModeContextValue["resourceStatus"]) => void;
};

const DataModeContext = createContext<DataModeContextValue | null>(null);

export function DataModeProvider({ children }: { children: ReactNode }) {
  const mode = useSyncExternalStore(subscribeDataMode, getDataMode, getDefaultDataMode);
  const [ready, setReady] = useState(false);
  const [resourceStatus, setResourceStatus] = useState<DataModeContextValue["resourceStatus"]>({
    source: "dummy",
    stale: false,
    fetchedAt: null,
    error: null
  });

  useEffect(() => setReady(true), []);

  const reportResourceStatus = useCallback((status: DataModeContextValue["resourceStatus"]) => setResourceStatus(status), []);
  const value = useMemo(
    () => ({ mode, ready, changeMode: setDataMode, resourceStatus, reportResourceStatus }),
    [mode, ready, reportResourceStatus, resourceStatus]
  );

  return <DataModeContext.Provider value={value}>{children}</DataModeContext.Provider>;
}

export function useDataMode() {
  const value = useContext(DataModeContext);
  if (!value) throw new Error("useDataMode must be used inside DataModeProvider");
  return value;
}
