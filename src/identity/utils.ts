// Removes null/undefined and any duplicates
export function normalizeResponse(arr: any) {
  return arr.filter((item: any) => item != null);
}
