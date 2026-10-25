import type { GameTemplate, Option, PayoutRow } from "@/lib/types";

const outcomeOptions: Option[] = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  label: String(i + 3),
}));

const betOptions: Option[] = [
  { id: 0, label: "大" },
  { id: 1, label: "小" },
  { id: 2, label: "單" },
  { id: 3, label: "雙" },
  ...Array.from({ length: 16 }, (_, i) => ({
    id: 4 + i,
    label: `總點${i + 3}`,
  })),
  { id: 20, label: "任意圍骰" },
  ...Array.from({ length: 6 }, (_, i) => ({
    id: 21 + i,
    label: `圍骰${i + 1}`,
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    id: 27 + i,
    label: `雙骰${i + 1}`,
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    id: 33 + i,
    label: `單骰${i + 1}`,
  })),
]; // length 39

const totalPayouts: {
  n: number;
  payout: string;
  probability: string;
  houseEdge: string;
}[] = [
  { n: 3, payout: "180:1", probability: "0.46%", houseEdge: "16.20%" },
  { n: 4, payout: "60:1", probability: "1.39%", houseEdge: "15.28%" },
  { n: 5, payout: "30:1", probability: "2.78%", houseEdge: "13.89%" },
  { n: 6, payout: "18:1", probability: "4.63%", houseEdge: "11.57%" },
  { n: 7, payout: "12:1", probability: "6.94%", houseEdge: "9.72%" },
  { n: 8, payout: "8:1", probability: "9.72%", houseEdge: "12.50%" },
  { n: 9, payout: "6:1", probability: "11.57%", houseEdge: "18.98%" },
  { n: 10, payout: "6:1", probability: "12.50%", houseEdge: "12.50%" },
  { n: 11, payout: "6:1", probability: "12.50%", houseEdge: "12.50%" },
  { n: 12, payout: "6:1", probability: "11.57%", houseEdge: "18.98%" },
  { n: 13, payout: "8:1", probability: "9.72%", houseEdge: "12.50%" },
  { n: 14, payout: "12:1", probability: "6.94%", houseEdge: "9.72%" },
  { n: 15, payout: "18:1", probability: "4.63%", houseEdge: "11.57%" },
  { n: 16, payout: "30:1", probability: "2.78%", houseEdge: "13.89%" },
  { n: 17, payout: "60:1", probability: "1.39%", houseEdge: "15.28%" },
  { n: 18, payout: "180:1", probability: "0.46%", houseEdge: "16.20%" },
];

const payoutRows: PayoutRow[] = [
  {
    label: "大",
    payout: "1:1",
    probability: "48.61%",
    houseEdge: "2.78%",
    note: "11–17；圍骰通殺常見",
  },
  {
    label: "小",
    payout: "1:1",
    probability: "48.61%",
    houseEdge: "2.78%",
    note: "4–10；圍骰通殺常見",
  },
  {
    label: "單",
    payout: "1:1",
    probability: "48.61%",
    houseEdge: "2.78%",
    note: "常見規則；圍骰處理視賭場",
  },
  {
    label: "雙",
    payout: "1:1",
    probability: "48.61%",
    houseEdge: "2.78%",
  },
  ...totalPayouts.map((t) => ({
    label: `總點${t.n}`,
    payout: t.payout,
    probability: t.probability,
    houseEdge: t.houseEdge,
  })),
  {
    label: "任意圍骰",
    payout: "30:1",
    probability: "2.78%",
    houseEdge: "13.89%",
  },
  {
    label: "指定圍骰",
    payout: "150:1",
    probability: "0.46%",
    houseEdge: "30.09%",
    note: "部分桌 180:1",
  },
  {
    label: "指定雙骰",
    payout: "8:1",
    probability: "7.41%",
    houseEdge: "33.33%",
    note: "常見 8:1 或 10:1",
  },
  {
    label: "指定單骰（一骰）",
    payout: "1:1",
    probability: "34.72%",
    houseEdge: "7.87%",
    note: "出現一次",
  },
  {
    label: "指定單骰（兩骰）",
    payout: "2:1",
    note: "出現兩次；機率／優勢視規則",
  },
  {
    label: "指定單骰（三骰）",
    payout: "3:1",
    note: "出現三次；機率／優勢視規則",
  },
];

export const sicBoTemplate: GameTemplate = {
  id: "sic-bo",
  nameZh: "骰寶",
  nameEn: "Sic Bo",
  outcomeOptions,
  betOptions,
  payoutRows,
};
