import { describe, expect, it } from "vitest";
import {
  loadState,
  saveState,
  STORAGE_KEY,
  STORAGE_KEY_V1,
} from "@/lib/storage";
import type { OddsState } from "@/lib/types";

class MemoryStorage implements Storage {
  store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(k: string) {
    return this.store.has(k) ? this.store.get(k)! : null;
  }
  key(i: number) {
    return [...this.store.keys()][i] ?? null;
  }
  removeItem(k: string) {
    this.store.delete(k);
  }
  setItem(k: string, v: string) {
    this.store.set(k, v);
  }
}

describe("storage v2", () => {
  it("round-trips state", () => {
    const mem = new MemoryStorage();
    const state: OddsState = {
      templateId: null,
      trackMode: "outcome",
      options: [
        { id: 0, label: "A" },
        { id: 1, label: "B" },
      ],
      rounds: [[0], [1]],
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
    expect(s.templateId).toBeNull();
    expect(s.trackMode).toBe("outcome");
    expect(s.options).toHaveLength(2);
    expect(s.rounds).toEqual([]);
  });

  it("falls back when option count > 50", () => {
    const mem = new MemoryStorage();
    const options = Array.from({ length: 51 }, (_, id) => ({
      id,
      label: `X${id}`,
    }));
    mem.setItem(
      STORAGE_KEY,
      JSON.stringify({
        templateId: null,
        trackMode: "outcome",
        options,
        rounds: [],
        updatedAt: 1,
      }),
    );
    const s = loadState(mem);
    expect(s.options).toHaveLength(2);
    expect(s.rounds).toEqual([]);
  });

  it("migrates v1 results into singleton rounds as custom", () => {
    const mem = new MemoryStorage();
    mem.setItem(
      STORAGE_KEY_V1,
      JSON.stringify({
        options: [
          { id: 0, label: "莊" },
          { id: 1, label: "閒" },
        ],
        results: [0, 1, 0],
        updatedAt: 42,
      }),
    );
    const s = loadState(mem);
    expect(s.templateId).toBeNull();
    expect(s.trackMode).toBe("outcome");
    expect(s.options.map((o) => o.label)).toEqual(["莊", "閒"]);
    expect(s.rounds).toEqual([[0], [1], [0]]);
    expect(s.updatedAt).toBe(42);
    expect(mem.getItem(STORAGE_KEY)).toBeTruthy();
    expect(mem.getItem(STORAGE_KEY_V1)).toBeTruthy();
  });
});
