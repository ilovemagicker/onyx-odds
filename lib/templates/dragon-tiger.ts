import type { GameTemplate } from "@/lib/types";

export const dragonTigerTemplate: GameTemplate = {
  id: "dragon-tiger",
  nameZh: "龍虎",
  nameEn: "Dragon Tiger",
  outcomeOptions: [
    { id: 0, label: "龍" },
    { id: 1, label: "虎" },
    { id: 2, label: "和" },
  ],
  betOptions: [
    { id: 0, label: "龍" },
    { id: 1, label: "虎" },
    { id: 2, label: "和" },
  ],
  payoutRows: [
    {
      label: "龍",
      payout: "1:1",
      probability: "48.63%",
      houseEdge: "3.73%",
      note: "和局常見為退半注或全退，視賭場",
    },
    {
      label: "虎",
      payout: "1:1",
      probability: "48.63%",
      houseEdge: "3.73%",
    },
    {
      label: "和",
      payout: "8:1",
      probability: "7.47%",
      houseEdge: "32.77%",
      note: "部分桌 11:1",
    },
  ],
};
