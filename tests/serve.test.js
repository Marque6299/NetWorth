import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import net from "node:net";
function reservePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      const port = typeof address === "object" && address ? address.port : 0;
      probe.close(error => error ? reject(error) : resolve(port));
    });
  });
}
test("development server serves app assets from a configured subpath", async () => {
  const port = await reservePort();
  const child = spawn(process.execPath, ["scripts/serve.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, HOST: "127.0.0.1", PORT: String(port), BASE_PATH: "/NetWorth" },
    stdio: ["ignore", "ignore", "pipe"]
  });
  let stderr = "";
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", chunk => { stderr += chunk; });
  const origin = `http://127.0.0.1:${port}`;
  let ready = false;
  try {
    for (let attempt = 0; attempt < 40; attempt++) {
      if (child.exitCode !== null) throw new Error(`Server exited early: ${stderr}`);
      try { if ((await fetch(`${origin}/NetWorth/`)).status === 200) { ready = true; break; } }
      catch { /* Wait for the server listener. */ }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    assert.equal(ready, true, `Server did not start: ${stderr}`);
    const index = await fetch(`${origin}/NetWorth/`);
    assert.equal(index.status, 200);
    const html = await index.text();
    assert.match(html, /href="\.\/css\/tokens\.css"/);
    assert.match(html, /src="\.\/js\/app\.js"/);
    assert.doesNotMatch(html, /(?:href|src)="\/(?:assets|styles|js)/);
    const css = await fetch(`${origin}/NetWorth/css/tokens.css`);
    assert.equal(css.status, 200);
    assert.match(await css.text(), /--bg-0:\s*#07090d/);
    const module = await fetch(`${origin}/NetWorth/js/app.js`);
    assert.equal(module.status, 200);
    assert.match(await module.text(), /from "\.\/build\.js"/);
    assert.equal((await fetch(`${origin}/`)).status, 404);
    const redirect = await fetch(`${origin}/NetWorth`, { redirect: "manual" });
    assert.equal(redirect.status, 308);
    assert.equal(redirect.headers.get("location"), "/NetWorth/");
  } finally {
    child.kill("SIGTERM");
    if (child.exitCode === null) await new Promise(resolve => child.once("exit", resolve));
  }
});
