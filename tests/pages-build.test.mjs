import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const builtIndex = new URL("../dist-pages/index.html", import.meta.url);

test("Cloudflare Pages build is self-contained and public", async () => {
  const html = await readFile(builtIndex, "utf8");

  assert.match(html, /<title>The Living Ocean — Niue<\/title>/);
  assert.match(html, /\.\/assets\/[^\"']+\.js/);
  assert.doesNotMatch(html, /chatgpt\.site|signin-with-chatgpt|oai-authenticated/i);
});
