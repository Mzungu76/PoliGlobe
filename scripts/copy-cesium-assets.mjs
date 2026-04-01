import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "node_modules", "cesium", "Build", "Cesium");
const target = path.join(root, "public", "cesium");

if (!fs.existsSync(source)) {
  console.error("Cesium source folder not found:", source);
  process.exit(1);
}

fs.mkdirSync(target, { recursive: true });

for (const name of ["Assets", "ThirdParty", "Workers", "Widgets"]) {
  const from = path.join(source, name);
  const to = path.join(target, name);
  if (!fs.existsSync(from)) {
    console.error("Missing Cesium folder:", from);
    process.exit(1);
  }
  fs.cpSync(from, to, { recursive: true, force: true });
}

console.log("Copied Cesium static assets to public/cesium");
