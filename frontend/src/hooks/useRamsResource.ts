"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDataMode } from "@/features/data-mode/DataModeProvider";
import type { RamsApiResult } from "@/services/api/ramsApiClient";

export type DataSource = "dummy" | "live" | "cache" | "empty";

type ResourceState<T> = {
  data: T | null;
  source: DataSource;
  stale: boolean;
  fetchedAt: string | null;
  loading: boolean;
  error: string | null;
};

export function useRamsResource<T>(
  dummyData: T,
  loader: (signal: AbortSignal) => Promise<RamsApiResult<T>>,
  refreshIntervalMs?: number
) {
  const { mode, ready, reportResourceStatus } = useDataMode();
  const requestSequence = useRef(0);
  const [retrySequence, setRetrySequence] = useState(0);
  const [state, setState] = useState<ResourceState<T>>({
    data: null,
    source: "empty",
    stale: false,
    fetchedAt: null,
    loading: true,
    error: null
  });

  const retry = useCallback(() => setRetrySequence((value) => value + 1), []);

  useEffect(() => {
    if (!ready) return;
    if (mode === "dummy") {
      setState({
        data: dummyData,
        source: "dummy",
        stale: false,
        fetchedAt: null,
        loading: false,
        error: null
      });
      reportResourceStatus({ source: "dummy", stale: false, fetchedAt: null, error: null });
      return;
    }

    const controller = new AbortController();
    const sequence = ++requestSequence.current;

    const load = async (background = false) => {
      if (document.visibilityState === "hidden") return;
      if (!background) setState((current) => ({ ...current, loading: true, error: null }));
      try {
        const result = await loader(controller.signal);
        if (sequence !== requestSequence.current || controller.signal.aborted) return;
        setState({
          data: result.data,
          source: result.source,
          stale: result.stale,
          fetchedAt: result.fetchedAt,
          loading: false,
          error: null
        });
        reportResourceStatus({ source: result.source, stale: result.stale, fetchedAt: result.fetchedAt, error: null });
      } catch (error) {
        if (sequence !== requestSequence.current || controller.signal.aborted) return;
        setState({
          data: null,
          source: "empty",
          stale: false,
          fetchedAt: null,
          loading: false,
          error: error instanceof Error ? error.message : "Data RAMS belum tersedia."
        });
        reportResourceStatus({
          source: "empty",
          stale: false,
          fetchedAt: null,
          error: error instanceof Error ? error.message : "Data RAMS belum tersedia."
        });
      }
    };

    void load();
    const interval = refreshIntervalMs
      ? window.setInterval(() => void load(true), refreshIntervalMs)
      : null;

    return () => {
      controller.abort();
      if (interval) window.clearInterval(interval);
    };
  }, [dummyData, loader, mode, ready, refreshIntervalMs, reportResourceStatus, retrySequence]);

  return { ...state, mode, ready, retry };
}
