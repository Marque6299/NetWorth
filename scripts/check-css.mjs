import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "css");
async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const location = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collect(location));
    else if (entry.isFile() && entry.name.endsWith(".css")) files.push(location);
  }
  return files;
}
const files = await collect(root);
const issues = [];
for (const file of files) {
  const relative = path.relative(root, file).split(path.sep).join("/");
  const content = await readFile(file, "utf8");
  if (relative !== "tokens.css" && /#[0-9a-fA-F]{3,8}\b/.test(content)) issues.push(`${relative}: hex colour outside tokens.css`);
  if (relative !== "motion.css" && /!important\b/i.test(content)) issues.push(`${relative}: !important outside motion.css`);
  if (relative !== "tokens.css") for (const match of content.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)px\b/gi)) {
    if (Number(match[1]) < 11) issues.push(`${relative}: font size ${match[1]}px is below 11px`);
  }
}
if (issues.length) {
  process.stderr.write(`CSS checks failed:\n- ${issues.join("\n- ")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`CSS checks passed: ${files.length} files, no hex colours outside tokens.css, no sub-11px text, and no !important outside motion.css.\n`);
}
