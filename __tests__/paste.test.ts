import { describe, expect, it } from "vitest";
import { parsePaste } from "@/lib/paste";
import { defaultOptions } from "@/lib/options";

describe("parsePaste", () => {
  const opts = [
    { id: 0, label: "莊" },
    { id: 1, label: "閒" },
    { id: 2, label: "和" },
  ];

  it("returns empty ok for blank", () => {
    expect(parsePaste("  \n", opts)).toEqual({ ok: true, ids: [] });
  });

  it("parses labels and 1-based indices with mixed separators", () => {
    expect(parsePaste("莊, 閒\n3 1", opts)).toEqual({
      ok: true,
      ids: [0, 1, 2, 0],
    });
  });

  it("rejects unknown token without partial apply", () => {
    const r = parsePaste("莊,X,閒", opts);
    expect(r.ok).toBe(false);
  });

  it("prefers label when label is numeric", () => {
    const numeric = [
      { id: 0, label: "1" },
      { id: 1, label: "2" },
    ];
    expect(parsePaste("1 2", numeric)).toEqual({ ok: true, ids: [0, 1] });
  });

  it("works with default letter labels via index", () => {
    expect(parsePaste("1,2,1", defaultOptions(2))).toEqual({
      ok: true,
      ids: [0, 1, 0],
    });
  });
});
