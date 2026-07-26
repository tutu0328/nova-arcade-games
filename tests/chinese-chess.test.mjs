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

test("支持双人对战、人机对战和匹配对战", () => {
  assert.match(game, /data-mode="ai"/);
  assert.match(game, /data-mode="match"/);
  assert.match(game, /data-mode="local"/);
  assert.match(game, /function startMatch\(\)/);
  assert.match(game, /id="matchButton"/);
  assert.match(game, /双人对战/);
});

test("人机难度不止三档，并包含更高档位", () => {
  for (const level of ["novice", "easy", "normal", "advanced", "hard", "master", "legend"]) {
    assert.match(game, new RegExp(`data-difficulty="${level}"`));
  }
  assert.match(game, /id:"super"/);
  assert.match(game, /function chooseAiMove\(\)/);
  assert.match(game, /const DIFFICULTIES=\[/);
  assert.match(game, /difficultyById/);
  assert.match(game, /minimax/);
});

test("匹配模式会匹配玩家并插入少量人机补位", () => {
  assert.match(game, /const playerPool=\[/);
  assert.match(game, /const botPool=\[/);
  assert.match(game, /匹配玩家/);
  assert.match(game, /人机补位/);
  assert.match(game, /Math\.random\(\)<\.22/);
});

test("连胜多场会安排超级人机制裁，连输多场会安排弱智人机", () => {
  assert.match(game, /matchStats\.streak>=3/);
  assert.match(game, /天元制裁官/);
  assert.match(game, /difficulty:"super"/);
  assert.match(game, /matchStats\.streak<=-3/);
  assert.match(game, /迷路小兵/);
  assert.match(game, /difficulty:"novice"/);
  assert.match(game, /recordMatchResult/);
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
