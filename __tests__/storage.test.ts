import { describe, expect, it } from "vitest";
import { loadState, saveState, STORAGE_KEY } from "@/lib/storage";
import type { OddsState } from "@/lib/types";

class MemoryStorage implements Storage {
  store = new Map<string, string>();
  get length() { return this.store.size; }
  clear() { this.store.clear(); }
  getItem(k: string) { return this.store.has(k) ? this.store.get(k)! : null; }
  key(i: number) { return [...this.store.keys()][i] ?? null; }
  removeItem(k: string) { this.store.delete(k); }
  setItem(k: string, v: string) { this.store.set(k, v); }
}

describe("storage", () => {
  it("round-trips state", () => {
    const mem = new MemoryStorage();
    const state: OddsState = {
      options: [
        { id: 0, label: "A" },
        { id: 1, label: "B" },
      ],
      results: [0, 1],
      updatedAt: 1,
    };
    saveState(state, mem);
    expect(mem.getItem(STORAGE_KEY)).toBeTruthy();
    expect(loadState(mem)).toEqual(state);
  });

  it("falls back on corrupt JSON", () => {
    const mem = new MemoryStorage();
    mem.setItem(STORAGE_KEY, "{not-json");
    const s = loadState(mem);
    expect(s.options).toHaveLength(2);
    expect(s.results).toEqual([]);
  });
});
