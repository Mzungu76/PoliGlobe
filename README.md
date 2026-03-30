# GeoPulse starter v2

Base Next.js + Cesium + OpenAI per una app geopolitica con Top 5 interpretativi.

## Cosa fa già

- interroga più fonti reali: ACLED, World Bank, UN Comtrade, GDELT
- normalizza i segnali in uno schema unico
- raggruppa i segnali per cluster geografico/politico
- chiede a OpenAI di produrre 5 risultati interpretativi
- salva un cache snapshot locale in `data/latest-top5.json`
- visualizza i risultati su globo Cesium

## API interne

- `GET /api/top5` → restituisce snapshot corrente
- `POST /api/refresh` → forza rigenerazione
- `GET /api/system/status` → stato fonti + cache

## Avvio

1. copia `.env.example` in `.env.local`
2. inserisci le chiavi disponibili
3. installa dipendenze
4. esegui `npm run dev`

## Note importanti

- senza `OPENAI_API_KEY` l'app va in fallback ranking
- senza chiavi ACLED e UN Comtrade quelle fonti vengono segnate come `missing`
- Cesium qui è integrato come superficie visiva; la parte cruciale resta il motore `/api/top5`
