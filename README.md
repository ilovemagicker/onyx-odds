# Onyx Odds

通用 **N 選項**歷史機率／路單**統計**工具（Onyx Labs）。

設定 2–20 個選項並自訂標籤，用大按鈕或貼上字串記錄結果，即時顯示：

- **頻率（最熱）** — 各選項出現比例
- **該出（距上次）** — 多久沒出現
- 與公平機率 **1/N** 對照

這是**統計參考工具，不是預測保證**。歷史不改變真實下一局機率。

| | |
| --- | --- |
| 網域 | [odds.onyxlab.dev](https://odds.onyxlab.dev) |
| 技術 | Next.js 15、React 19、Tailwind CSS 4、Vitest |
| 資料 | 僅瀏覽器 `localStorage`（`onyx-odds:v1`）；無後端、無錢包、無帳號 |
| 規格 | [docs/superpowers/specs/2026-10-25-onyx-odds-design.md](docs/superpowers/specs/2026-10-25-onyx-odds-design.md) |

## 免責

歷史統計僅供參考，不影響真實下一局機率。本工具不提供賭場賠率或結果保證，亦不鼓勵賭博。

## 本機開發

```bash
npm install
npm run dev      # http://localhost:3000
npm test
npm run build
```

## 授權／品牌

Onyx Labs · [onyxlab.dev](https://onyxlab.dev)
