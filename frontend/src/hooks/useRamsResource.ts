"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDataMode } from "@/features/data-mode/DataModeProvider";
import type { RamsApiResult } from "@/services/api/ramsApiClient";
import type { DataMode } from "@/services/api/dataMode";
import type { SectionData } from "@/types/data";

type ResourceState<T> = SectionData<T>;

export function useRamsResource<T>(
  loader: (signal: AbortSignal, mode: DataMode) => Promise<RamsApiResult<T>>,
  refreshIntervalMs?: number
) {
  const { mode, ready, reportResourceStatus } = useDataMode();
  const requestSequence = useRef(0);
  const [retrySequence, setRetrySequence] = useState(0);
  const [state, setState] = useState<ResourceState<T>>({
    data: null,
    source: "dummy",
    stale: false,
    fromCache: false,
    generatedAt: null,
    fetchedAt: null,
    loading: true,
    error: null
  });

  const retry = useCallback(() => setRetrySequence((value) => value + 1), []);

  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();
    const sequence = ++requestSequence.current;

    const load = async (background = false) => {
      if (document.visibilityState === "hidden") return;
      if (!background) setState((current) => ({ ...current, loading: true, error: null }));
      try {
        const result = await loader(controller.signal, mode);
        if (sequence !== requestSequence.current || controller.signal.aborted) return;
        setState({
          data: result.data,
          source: result.source,
          stale: result.stale,
          fromCache: result.fromCache,
          generatedAt: result.generatedAt,
          fetchedAt: result.fetchedAt,
          loading: false,
          error: null
        });
        reportResourceStatus({ source: result.source, stale: result.stale, fromCache: result.fromCache, generatedAt: result.generatedAt, fetchedAt: result.fetchedAt, error: null });
      } catch (error) {
        if (sequence !== requestSequence.current || controller.signal.aborted) return;
        setState({
          data: null,
          source: mode,
          stale: false,
          fromCache: false,
          generatedAt: null,
          fetchedAt: null,
          loading: false,
          error: error instanceof Error ? error.message : "Data RAMS belum tersedia."
        });
        reportResourceStatus({
          source: mode,
          stale: false,
          fromCache: false,
          generatedAt: null,
          fetchedAt: null,
          error: error instanceof Error ? error.message : "Data RAMS belum tersedia."
        });
      }
    };

    void load();
    const interval = refreshIntervalMs && mode === "live"
      ? window.setInterval(() => void load(true), refreshIntervalMs)
      : null;

    return () => {
      controller.abort();
      if (interval) window.clearInterval(interval);
    };
  }, [loader, mode, ready, refreshIntervalMs, reportResourceStatus, retrySequence]);

  return { ...state, mode, ready, retry };
}
