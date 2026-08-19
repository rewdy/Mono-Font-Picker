import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("..", import.meta.url);
const read = (rel: string) => {
  const path = fileURLToPath(new URL(rel, root));
  return { path, text: readFileSync(path, "utf8") };
};

const pkg = JSON.parse(read("package.json").text) as { version: string };
const version = pkg.version;

const cargo = read("src-tauri/Cargo.toml");
const cargoUpdated = cargo.text.replace(
  /(\[package\][\s\S]*?\nversion\s*=\s*")[^"]*(")/,
  `$1${version}$2`,
);
if (cargoUpdated === cargo.text) {
  throw new Error("Could not find [package] version in Cargo.toml");
}
writeFileSync(cargo.path, cargoUpdated);

const conf = read("src-tauri/tauri.conf.json");
const confUpdated = conf.text.replace(
  /("version"\s*:\s*")[^"]*(")/,
  `$1${version}$2`,
);
if (confUpdated === conf.text) {
  throw new Error("Could not find version in tauri.conf.json");
}
writeFileSync(conf.path, confUpdated);

console.log(`Synced version ${version} into Cargo.toml and tauri.conf.json`);
