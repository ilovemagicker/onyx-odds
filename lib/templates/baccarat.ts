import type { GameTemplate } from "@/lib/types";

export const baccaratTemplate: GameTemplate = {
  id: "baccarat",
  nameZh: "百家樂",
  nameEn: "Baccarat",
  outcomeOptions: [
    { id: 0, label: "莊" },
    { id: 1, label: "閑" },
    { id: 2, label: "和" },
  ],
  betOptions: [
    { id: 0, label: "莊" },
    { id: 1, label: "閑" },
    { id: 2, label: "和" },
    { id: 3, label: "莊對" },
    { id: 4, label: "閑對" },
  ],
  payoutRows: [
    {
      label: "莊",
      payout: "0.95:1",
      probability: "45.86%",
      houseEdge: "1.06%",
      note: "抽水制常見；免佣莊另計",
    },
    {
      label: "閑",
      payout: "1:1",
      probability: "44.62%",
      houseEdge: "1.24%",
    },
    {
      label: "和",
      payout: "8:1",
      probability: "9.52%",
      houseEdge: "14.36%",
      note: "部分桌 9:1",
    },
    {
      label: "莊對",
      payout: "11:1",
      probability: "7.47%",
      houseEdge: "10.36%",
    },
    {
      label: "閑對",
      payout: "11:1",
      probability: "7.47%",
      houseEdge: "10.36%",
    },
  ],
};
