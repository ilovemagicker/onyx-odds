# Onyx Odds deploy notes

## Live (2026-10-25 HKT / Asia/Hong_Kong)
- **Primary**: https://odds.onyxlab.dev
- **Vercel alias**: https://onyx-odds.vercel.app
- **Project**: `onyx-odds` / `prj_ArbCtJjcWsgyKzg4yjNNF3oNR1uZ`
- **Team**: `team_eBuGvhlSHHu9ozaBkA5yAxnt` (ilovemagickers-projects)
- **GitHub**: https://github.com/ilovemagicker/onyx-odds (`main`, public)
- **Framework**: Next.js
- **Cloudflare DNS**: CNAME `odds` → `01bb200931e33660.vercel-dns-017.com` (DNS-only / grey cloud)

## Deploy SHAs
- Production deploy: `dpl_57UGLa9xkzfE3xsXXHq5Atq99XXe`
- Deploy URL: https://onyx-odds-glxa7ld40-ilovemagickers-projects.vercel.app
- Latest commit at first prod: `bf72aeb` (chore: SEO polish and README)

## Protection
- SSO: `all_except_custom_domains` (custom domain public; `*.vercel.app` may require Vercel login depending on session)
- Public product URL: https://odds.onyxlab.dev

## Env
- None required (client-only localStorage stats tool).

## Smoke (post-deploy)
```bash
curl -sI https://odds.onyxlab.dev | head -5
curl -s https://odds.onyxlab.dev | head -c 200
```
