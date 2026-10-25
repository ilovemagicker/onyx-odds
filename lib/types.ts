export type Option = { id: number; label: string };

export type TrackMode = "outcome" | "bet";

export type TemplateId =
  | "baccarat"
  | "dragon-tiger"
  | "european-roulette"
  | "sic-bo";

/** One recorded round: non-empty list of option ids. */
export type Round = number[];

export type PayoutRow = {
  label: string;
  payout: string;
  probability?: string;
  houseEdge?: string;
  note?: string;
};

export type GameTemplate = {
  id: TemplateId;
  nameZh: string;
  nameEn: string;
  outcomeOptions: Option[];
  betOptions: Option[];
  payoutRows: PayoutRow[];
};

export type OddsState = {
  templateId: TemplateId | null;
  trackMode: TrackMode;
  options: Option[];
  rounds: Round[];
  updatedAt: number;
};
