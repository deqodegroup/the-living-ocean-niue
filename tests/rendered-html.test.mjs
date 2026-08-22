import assert from "node:assert/strict";
import test from "node:test";

test("renders production metadata without Sites preview authentication", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();

  assert.match(html, /<title>The Living Ocean — Niue<\/title>/);
  assert.match(
    html,
    /<meta(?=[^>]*\bname=["']description["'])(?=[^>]*\bcontent=["']An interactive journey through Niue&#x27;s climate risk, people and resilience data\.["'])[^>]*>/i,
  );
  assert.doesNotMatch(
    html,
    /codex-preview|chatgpt\.site|signin-with-chatgpt|oai-authenticated/i,
  );
});
