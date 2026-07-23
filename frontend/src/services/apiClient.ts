/**
 * Compatibility entry point. Production RAMS calls must use the authenticated
 * BFF client; direct NEXT_PUBLIC_API_URL requests are intentionally removed.
 */
export { requestRams, mapRamsResult } from "./api/ramsApiClient";
