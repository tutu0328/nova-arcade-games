import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";

const root = new URL("../", import.meta.url);
const gamePages = [
  "neon-drift.html",
  "echo-protocol.html",
  "tiny-orbit.html",
  "signal-below.html",
  "delta-arena.html",
  "last-cup.html",
  "chinese-chess.html",
];

test("所有已发布游戏页都支持横屏游玩布局", () => {
  for (const page of gamePages) {
    const html = readFileSync(new URL(page, root), "utf8");
    assert.match(html, /<meta name="viewport" content="[^"]*width=device-width[^"]*"/, `${page} 需要移动端 viewport`);
    assert.match(html, /<body data-landscape-ready="true">/, `${page} 需要标记横屏已适配`);
    assert.match(html, /@media\s*\(\s*orientation:\s*landscape\s*\)\s*and\s*\(\s*max-height:\s*620px\s*\)/, `${page} 需要横屏低高度布局`);
  }
});

