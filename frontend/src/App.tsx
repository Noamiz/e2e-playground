import { useMemo, useState } from "react";
import styles from "./App.module.scss";

type Item = {
  id: string;
  text: string;
  createdAt: number;
};

type SortMode = "newest" | "oldest";

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
  const [items, setItems] = useState<Item[]>([]);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>("newest");

  const canSubmit = !isSaving && !error && text.trim().length >= 3;

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

  function addItem() {
    if (!canSubmit) return;

    const value = text.trim(); // snapshot to avoid changes during "saving"
    setIsSaving(true);

    setTimeout(() => {
      setItems((prev) => [
        { id: uid(), text: value, createdAt: Date.now() },
        ...prev,
      ]);
      setText("");
      setError(null);
      setIsSaving(false);
    }, 500);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
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
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.row}>
        <input
          className={styles.input}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter..."
        />
      </div>

      <div className={styles.meta}>
        Showing {visibleItems.length} / {items.length}
      </div>

      <ul className={styles.list}>
        {visibleItems.map((i) => (
          <li key={i.id} className={styles.listItem}>
            {i.text}{" "}
            <button className={styles.button} onClick={() => removeItem(i.id)}>
              remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
