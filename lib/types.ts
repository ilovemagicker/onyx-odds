export type Option = { id: number; label: string };

export type OddsState = {
  options: Option[];
  results: number[];
  updatedAt: number;
};
