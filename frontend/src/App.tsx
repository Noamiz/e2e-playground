import { useMemo, useState } from "react";
import styles from "./App.module.scss";

type Item = {
  id: string;
  text: string;
  createdAt: number;
};

function uid() {
  return crypto.randomUUID();
}

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.text.toLowerCase().includes(q));
  }, [items, filter]);

  function addItem() {
    const value = text.trim();
    if (!value) return;
    setItems((prev) => [
      { id: uid(), text: value, createdAt: Date.now() },
      ...prev,
    ]);
    setText("");
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
          onChange={(e) => setText(e.target.value)}
          placeholder="Add item..."
          onKeyDown={(e) => {
            if (e.key === "Enter") addItem();
          }}
        />
        <button className={styles.button} onClick={addItem}>
          Add
        </button>
      </div>

      <div className={styles.row}>
        <input
          className={styles.input}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter..."
        />
      </div>

      <div className={styles.meta}>
        Showing {filtered.length} / {items.length}
      </div>

      <ul className={styles.list}>
        {filtered.map((i) => (
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
