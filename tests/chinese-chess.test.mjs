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

test("进入页面先看到首页介绍和开始游戏按钮", () => {
  assert.match(game, /id="homeScreen"/);
  assert.match(game, /id="gameScreen" class="hidden"/);
  assert.match(game, /id="startGameBtn">开始游戏<\/button>/);
  assert.match(game, /id="startMatchBtn">快速匹配<\/button>/);
  assert.match(game, /一个可以单机练习、同屏双人、模拟匹配的中国象棋游戏/);
  assert.match(game, /function showGame\(\)/);
  assert.match(game, /\$\("startGameBtn"\)\.onclick/);
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

test("常见AI和超级人机是正式可选对手，不只藏在提示里", () => {
  assert.match(game, /id="aiProfileButtons"/);
  for (const profile of ["standard", "doubao", "deepseek", "codex", "lobster", "aggressive", "defensive", "endgame", "super"]) {
    assert.match(game, new RegExp(`data-ai-profile="${profile}"`));
  }
  for (const label of ["豆包", "DeepSeek", "Codex", "龙虾"]) {
    assert.match(game, new RegExp(`>${label}<`));
  }
  assert.match(game, /const AI_PROFILES=\[/);
  assert.match(game, /profileById/);
  assert.match(game, /profileScore/);
  assert.match(game, /超级人机<\/button>/);
});

test("棋盘对面会显示当前AI头像和风格说明", () => {
  assert.match(game, /class="opponent-card"/);
  assert.match(game, /id="aiAvatar"/);
  assert.match(game, /id="opponentName"/);
  assert.match(game, /id="opponentStyle"/);
  assert.match(game, /class="board-ai-badge"/);
  assert.match(game, /id="boardAiAvatar"/);
  assert.match(game, /id="boardAiName"/);
  assert.match(game, /id="boardAiStyle"/);
  for (const field of ["avatar:", "color:", "intro:"]) {
    assert.match(game, new RegExp(field));
  }
  assert.match(game, /activeProfile\.avatar/);
  assert.match(game, /activeProfile\.intro/);
  assert.match(game, /--avatar/);
  assert.match(game, /boardAiAvatar/);
  assert.match(game, /boardAiName/);
});

test("匹配模式会匹配玩家并插入少量人机补位", () => {
  assert.match(game, /const playerPool=\[/);
  assert.match(game, /const botPool=\[/);
  assert.match(game, /匹配玩家/);
  assert.match(game, /人机补位/);
  assert.match(game, /Math\.random\(\)<\.22/);
});

test("将帅活动的九宫格有明显不同的棋盘颜色", () => {
  assert.match(game, /\.cell\.palace-red/);
  assert.match(game, /\.cell\.palace-black/);
  assert.match(game, /palace-lines black/);
  assert.match(game, /palace-lines red/);
  assert.match(game, /const palaceClass=palace\(RED,r,c\)\?"palace-red":palace\(BLACK,r,c\)\?"palace-black":""/);
});

test("楚河汉界使用对称的中线河界而不是挂在单个格子里", () => {
  assert.match(game, /class="river-label"/);
  assert.match(game, /<span>楚河<\/span><span>汉界<\/span>/);
  assert.doesNotMatch(game, /nth-child\(41\)::after/);
  assert.doesNotMatch(game, /nth-child\(45\)::after/);
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
