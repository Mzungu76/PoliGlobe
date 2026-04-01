Quei due URL in 404 confermano che il base URL è giusto ma gli asset non sono stati copiati nel deploy.

File da mettere nel repo:
- package.json
- scripts/copy-cesium-assets.mjs

Poi:
1. aggiorna package-lock.json con npm install oppure eliminalo
2. fai commit
3. rilancia il deploy

Nel log build devi vedere:
Copied Cesium static assets to public/cesium
