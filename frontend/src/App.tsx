import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./App.module.scss";
import { fetchMockItems, type ApiItem, type SortMode } from "./api/mockApi";

type Item = ApiItem;

const PAGE_SIZE = 25;

function uid() {
  return crypto.randomUUID();
}

function validateText(nextText: string): string | null {
  const value = nextText.trim();
  if (!value) return null; // empty = no error, just can't submit
  if (value.length < 3) return "Please enter at least 3 characters";
  return null;
}

export default function App() {
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [remoteItems, setRemoteItems] = useState<Item[]>([]);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>("newest");
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [remoteLoaded, setRemoteLoaded] = useState(0);
  const [remoteTotal, setRemoteTotal] = useState<number | null>(null);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false);
  const offsetRef = useRef(0);
  const totalRef = useRef<number | null>(null);

  const items = useMemo(
    () => [...userItems, ...remoteItems],
    [userItems, remoteItems]
  );
  const canSubmit = !isSaving && !error && text.trim().length >= 3;
  const hasMore = remoteTotal === null || remoteLoaded < remoteTotal;

  const visibleItems = useMemo(() => {
    const q = filter.trim().toLowerCase();

    let res = items;
    if (q) {
      res = res.filter((i) => i.text.toLowerCase().includes(q));
    }

    // Sort only for display; do not mutate items.
    return [...res].sort((a, b) => {
      return sort === "newest"
        ? b.createdAt - a.createdAt
        : a.createdAt - b.createdAt;
    });
  }, [items, filter, sort]);

  const loadPage = useCallback(async () => {
    if (isLoadingRef.current) return;

    const offset = offsetRef.current;
    const knownTotal = totalRef.current;
    if (knownTotal !== null && offset >= knownTotal) return;

    isLoadingRef.current = true;
    setIsPageLoading(true);

    try {
      const { items: page, total } = await fetchMockItems({
        offset,
        limit: PAGE_SIZE,
        sort,
      });

      offsetRef.current = offset + page.length;
      totalRef.current = total;
      setRemoteItems((prev) => (offset === 0 ? page : [...prev, ...page]));
      setRemoteLoaded(offsetRef.current);
      setRemoteTotal(total);
      setApiError(null);
    } catch (err) {
      console.error(err);
      setApiError("Failed to load items. Please retry.");
    } finally {
      isLoadingRef.current = false;
      setIsPageLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    offsetRef.current = 0;
    totalRef.current = null;
    setRemoteItems([]);
    setRemoteLoaded(0);
    setRemoteTotal(null);
    setApiError(null);
    void loadPage();
  }, [loadPage]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            void loadPage();
          }
        });
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadPage]);

  function addItem() {
    if (!canSubmit) return;

    const value = text.trim(); // snapshot to avoid changes during "saving"
    setIsSaving(true);

    setTimeout(() => {
      setUserItems((prev) => {
        const seqBase = (totalRef.current ?? 0) + prev.length + 1;
        return [
          { id: uid(), text: value, createdAt: Date.now(), seq: seqBase },
          ...prev,
        ];
      });
      setText("");
      setError(null);
      setIsSaving(false);
    }, 500);
  }

  function removeItem(id: string) {
    setUserItems((prev) => prev.filter((i) => i.id !== id));
    setRemoteItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Live Coding Playground</h1>

      <div className={styles.row}>
        <input
          className={styles.input}
          value={text}
          onChange={(e) => {
            const next = e.target.value;
            setText(next);
            setError(validateText(next));
          }}
          placeholder="Add item..."
          onKeyDown={(e) => {
            if (e.key === "Enter") addItem();
          }}
        />

        <button
          className={styles.button}
          onClick={addItem}
          disabled={!canSubmit}
        >
          {isSaving ? "Saving..." : "Add"}
        </button>

        <button
          className={styles.button}
          onClick={() => setSort((s) => (s === "newest" ? "oldest" : "newest"))}
        >
          Sort: {sort === "newest" ? "Newest" : "Oldest"}
        </button>

        <button
          className={styles.button}
          onClick={() => void loadPage()}
          disabled={!hasMore || isPageLoading}
        >
          {isPageLoading ? "Loading..." : hasMore ? "Load more" : "All loaded"}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {apiError && <div className={styles.error}>{apiError}</div>}

      <div className={styles.row}>
        <input
          className={styles.input}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter..."
        />
      </div>

      <div className={styles.meta}>
        Showing {visibleItems.length} / {items.length} (loaded {remoteLoaded}
        {remoteTotal !== null ? ` of ${remoteTotal}` : ""} from mock API)
      </div>

      <div className={styles.listContainer}>
        <ul className={styles.list}>
          {visibleItems.map((i) => (
            <li key={i.id} className={styles.listItem}>
              <span className={styles.badge}>#{i.seq}</span>
              <span className={styles.listText}>{i.text}</span>
              <button
                className={styles.button}
                onClick={() => removeItem(i.id)}
              >
                remove
              </button>
            </li>
          ))}
        </ul>
        <div ref={loadMoreRef} className={styles.loader}>
          {isPageLoading
            ? "Loading more..."
            : hasMore
            ? "Scroll for more items"
            : "Reached the end of the mock list"}
        </div>
      </div>
    </div>
  );
}
