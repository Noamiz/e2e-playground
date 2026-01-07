export type SortMode = "newest" | "oldest";

export type ApiItem = {
  id: string;
  seq: number;
  text: string;
  createdAt: number;
};

const TOTAL_ITEMS = 200;
const LATENCY_MS = 320;

const MOCK_ITEMS: ApiItem[] = (() => {
  const now = Date.now();
  const start = now - TOTAL_ITEMS * 60_000;

  return Array.from({ length: TOTAL_ITEMS }, (_, idx) => {
    const seq = idx + 1;
    return {
      id: `mock-${seq}`,
      seq,
      text: `Mock item #${seq}`,
      createdAt: start + seq * 60_000,
    };
  });
})();

const SORTED_NEWEST = [...MOCK_ITEMS].sort((a, b) => b.createdAt - a.createdAt);
const SORTED_OLDEST = [...SORTED_NEWEST].reverse();

type FetchItemsParams = {
  offset: number;
  limit: number;
  sort: SortMode;
};

export async function fetchMockItems({
  offset,
  limit,
  sort,
}: FetchItemsParams): Promise<{ items: ApiItem[]; total: number }> {
  const source = sort === "newest" ? SORTED_NEWEST : SORTED_OLDEST;
  const items = source.slice(offset, offset + limit);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ items, total: source.length });
    }, LATENCY_MS);
  });
}
