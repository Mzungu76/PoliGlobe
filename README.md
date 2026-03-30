# GeoPulse starter

Concrete starter for a 3-step build:

- Step 1: real multi-source ingestion + OpenAI analytical core
- Step 2: strong Cesium UI with Top 5 already interpreted
- Step 3: hardening, scheduling, observability

## Implemented now

- `/api/top5` route
- `/api/system/status` route
- real source connectors for ACLED, World Bank, UN Comtrade, GDELT
- signal normalization and clustering
- OpenAI-driven Top 5 generation with JSON schema output
- fallback mode when OpenAI key is missing
- Cesium/Resium homepage consuming the Top 5

## Environment

Copy `.env.example` to `.env.local` and set keys.

## Important

- ACLED now requires credentials/OAuth-related access in its documented workflow.
- UN Comtrade requires an API key.
- World Bank is public.
- GDELT is public and near-real-time.

## Why these sources

This starter prioritizes sources with public documentation and programmatic access:
- ACLED API docs: https://acleddata.com/acled-api-documentation
- World Bank Indicators API docs: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation
- UN Comtrade portal: https://comtrade.un.org/
- GDELT data docs: https://www.gdeltproject.org/data.html

## Next hardening tasks

- replace coarse spatial clustering with graph-based regional clustering
- add explicit energy chokepoint dataset and pipeline
- persist snapshots to blob/db
- add cron or queue refresh
- tune AI prompts with second-pass critique
