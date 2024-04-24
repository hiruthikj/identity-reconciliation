// Removes null/undefined and any duplicates
export function normalizeResponse(arr: any[]) {
  const visited = new Set();
  return arr.filter((item: any) => {
    if (item != null && !visited.has(item)) {
      visited.add(item);
      return true;
    }
    return false;
  });
}
