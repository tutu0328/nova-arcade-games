import assert from "node:assert/strict";
import {existsSync, readFileSync} from "node:fs";
import {test} from "node:test";

const root = new URL("../", import.meta.url);
const game = readFileSync(new URL("chinese-chess.html", root), "utf8");
const index = readFileSync(new URL("index.html", root), "utf8");
const script = game.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? "";

test("游戏库可以进入《星河象棋》", () => {
  assert.ok(existsSync(new URL("chinese-chess.html", root)));
  assert.match(index, /href:'chinese-chess\.html'/);
  assert.match(index, /title:'星河象棋'/);
});

test("象棋页面脚本语法有效", () => {
  assert.doesNotThrow(() => new Function(script));
});

test("支持双人对战和人机对战", () => {
  assert.match(game, /data-mode="ai"/);
  assert.match(game, /data-mode="local"/);
  assert.match(game, /mode==="ai"&&turn===BLACK/);
  assert.match(game, /双人对战/);
});

test("人机必须有三档难度选择", () => {
  for (const level of ["easy", "normal", "hard"]) {
    assert.match(game, new RegExp(`data-difficulty="${level}"`));
  }
  assert.match(game, /function chooseAiMove\(\)/);
  assert.match(game, /difficulty==="easy"/);
  assert.match(game, /difficulty==="normal"/);
  assert.match(game, /minimax/);
});

test("初始棋盘包含完整32枚棋子", () => {
  assert.match(game, /function initialBoard\(\)/);
  assert.match(game, /\["r","h","e","a","k","a","e","h","r"\]\.forEach\(\(t,c\)=>put\(0,c,BLACK,t\)\)/);
  assert.match(game, /\["r","h","e","a","k","a","e","h","r"\]\.forEach\(\(t,c\)=>put\(9,c,RED,t\)\)/);
  assert.match(game, /put\(2,1,BLACK,"c"\);put\(2,7,BLACK,"c"\)/);
  assert.match(game, /put\(7,1,RED,"c"\);put\(7,7,RED,"c"\)/);
  assert.match(game, /\[0,2,4,6,8\]\.forEach\(c=>put\(3,c,BLACK,"p"\)\)/);
  assert.match(game, /\[0,2,4,6,8\]\.forEach\(c=>put\(6,c,RED,"p"\)\)/);
});

test("车马炮兵仕相帅都有合法走法限制", () => {
  for (const type of ["r", "c", "h", "e", "a", "k", "p"]) {
    assert.match(game, new RegExp(`p\\.type==="${type}"`));
  }
  assert.match(game, /horseSteps/);
  assert.match(game, /elephantSteps/);
  assert.match(game, /palace\(p\.side,nr,nc\)/);
  assert.match(game, /crossed\(p\.side,r\)/);
});

test("不能走出会让自己被将军的位置", () => {
  assert.match(game, /function inCheck\(b,side\)/);
  assert.match(game, /findKing/);
  assert.match(game, /function legalMovesFor\(b,r,c\)/);
  assert.match(game, /!inCheck\(movedBoard\(b,\{r,c\},to\),p\.side\)/);
});

test("对局有胜负、悔棋和棋谱", () => {
  assert.match(game, /function finish\(winner,copy\)/);
  assert.match(game, /winnerLayer/);
  assert.match(game, /function undoMove\(\)/);
  assert.match(game, /id="moveLog"/);
});
