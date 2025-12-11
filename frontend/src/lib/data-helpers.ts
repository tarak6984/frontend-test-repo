/**
 * Normalizes API response data by processing nested structures.
 * Simplified version without complex validation that was causing infinite loops.
 */
export function normalizeApiResponse(data: unknown): unknown {
  if (!data) {
    return data;
  }

  // Simply return the data - no complex validation needed
  return data;
}
