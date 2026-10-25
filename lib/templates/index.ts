import type { GameTemplate, Option, TemplateId, TrackMode } from "@/lib/types";
import { baccaratTemplate } from "./baccarat";
import { dragonTigerTemplate } from "./dragon-tiger";
import { europeanRouletteTemplate } from "./european-roulette";
import { sicBoTemplate } from "./sic-bo";

export const TEMPLATES: Record<TemplateId, GameTemplate> = {
  baccarat: baccaratTemplate,
  "dragon-tiger": dragonTigerTemplate,
  "european-roulette": europeanRouletteTemplate,
  "sic-bo": sicBoTemplate,
};

export const TEMPLATE_PICKER: { id: TemplateId | null; label: string }[] = [
  { id: null, label: "自訂" },
  { id: "baccarat", label: "百家樂" },
  { id: "dragon-tiger", label: "龍虎" },
  { id: "european-roulette", label: "歐式輪盤" },
  { id: "sic-bo", label: "骰寶" },
];

export function getTemplate(id: TemplateId): GameTemplate {
  return TEMPLATES[id];
}

export function optionsForTemplate(
  id: TemplateId,
  mode: TrackMode,
): Option[] {
  const t = TEMPLATES[id];
  const src = mode === "bet" ? t.betOptions : t.outcomeOptions;
  return src.map((o) => ({ ...o }));
}

export function templateDisplayName(id: TemplateId | null): string {
  if (id === null) return "自訂";
  return TEMPLATES[id].nameZh;
}

export {
  baccaratTemplate,
  dragonTigerTemplate,
  europeanRouletteTemplate,
  sicBoTemplate,
};
