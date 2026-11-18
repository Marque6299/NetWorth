import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { VERSION } from "../js/build.js";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const metadata = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
if (metadata.version !== VERSION) {
  process.stderr.write(`Version mismatch: package.json is ${metadata.version}, js/build.js is ${VERSION}.\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Version check passed: package.json and js/build.js both use ${VERSION}.\n`);
}
