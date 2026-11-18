import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 4173);
const basePath = String(process.env.BASE_PATH || "").trim().replace(/^\/+|\/+$/g, "");
const basePrefix = basePath ? "/" + basePath : "";
if (basePath.split("/").some(segment => segment === "." || segment === "..")) {
  throw new Error("BASE_PATH cannot contain dot segments.");
}
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

const server = http.createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end("Method not allowed");
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url || "/", `http://${host}:${port}`).pathname);
  } catch {
    response.writeHead(400).end("Bad request");
    return;
  }

  if (basePrefix) {
    if (pathname === basePrefix) {
      response.writeHead(308, { Location: basePrefix + "/" }).end();
      return;
    }
    if (pathname !== basePrefix + "/" && !pathname.startsWith(basePrefix + "/")) {
      response.writeHead(404).end("Not found");
      return;
    }
    pathname = pathname === basePrefix + "/" ? "/" : pathname.slice(basePrefix.length);
  }

  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = path.resolve(root, relativePath);
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": types[path.extname(filePath)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache"
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch (error) {
    response.writeHead(error.code === "ENOENT" ? 404 : 500).end(error.code === "ENOENT" ? "Not found" : "Server error");
  }
});

server.listen(port, host, () => {
  process.stdout.write(`Networth development server running at http://${host}:${port}\n`);
});
