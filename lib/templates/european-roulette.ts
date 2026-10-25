import type { GameTemplate, Option, PayoutRow } from "@/lib/types";

const outcomeOptions: Option[] = Array.from({ length: 37 }, (_, id) => ({
  id,
  label: String(id),
}));

const betOptions: Option[] = [
  { id: 0, label: "紅" },
  { id: 1, label: "黑" },
  { id: 2, label: "單" },
  { id: 3, label: "雙" },
  { id: 4, label: "小(1–18)" },
  { id: 5, label: "大(19–36)" },
  { id: 6, label: "第一打" },
  { id: 7, label: "第二打" },
  { id: 8, label: "第三打" },
  { id: 9, label: "第一列" },
  { id: 10, label: "第二列" },
  { id: 11, label: "第三列" },
];

const payoutRows: PayoutRow[] = [
  {
    label: "直注",
    payout: "35:1",
    probability: "2.70%",
    houseEdge: "2.70%",
    note: "單一號碼 0–36",
  },
  {
    label: "分注",
    payout: "17:1",
    probability: "5.41%",
    houseEdge: "2.70%",
  },
  {
    label: "街注",
    payout: "11:1",
    probability: "8.11%",
    houseEdge: "2.70%",
  },
  {
    label: "角注",
    payout: "8:1",
    probability: "10.81%",
    houseEdge: "2.70%",
  },
  {
    label: "線注",
    payout: "5:1",
    probability: "16.22%",
    houseEdge: "2.70%",
    note: "六號／雙街",
  },
  {
    label: "列注",
    payout: "2:1",
    probability: "32.43%",
    houseEdge: "2.70%",
  },
  {
    label: "打注",
    payout: "2:1",
    probability: "32.43%",
    houseEdge: "2.70%",
  },
  {
    label: "紅／黑",
    payout: "1:1",
    probability: "48.65%",
    houseEdge: "2.70%",
    note: "歐式單零；美式雙零莊家優勢更高",
  },
  {
    label: "單／雙",
    payout: "1:1",
    probability: "48.65%",
    houseEdge: "2.70%",
  },
  {
    label: "小／大",
    payout: "1:1",
    probability: "48.65%",
    houseEdge: "2.70%",
    note: "小 1–18／大 19–36",
  },
];

export const europeanRouletteTemplate: GameTemplate = {
  id: "european-roulette",
  nameZh: "歐式輪盤",
  nameEn: "European Roulette",
  outcomeOptions,
  betOptions,
  payoutRows,
};
