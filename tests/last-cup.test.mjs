import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";

const root = new URL("../", import.meta.url);
const game = readFileSync(new URL("last-cup.html", root), "utf8");
const index = readFileSync(new URL("index.html", root), "utf8");
const script = game.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? "";

test("游戏库可以进入《最后一杯》", () => {
  assert.match(index, /href:'last-cup\.html'/);
});

test("游戏脚本语法有效", () => {
  assert.doesNotThrow(() => new Function(script));
});

test("核心循环包含五位客人和三段调制", () => {
  assert.match(game, /const guests = \[/);
  for (const id of ["veteran", "courier", "ai", "android", "last"]) {
    assert.match(game, new RegExp(`id:"${id}"`));
  }
  for (const group of ["base", "flavor", "garnish"]) {
    assert.match(game, new RegExp(`${group}: \\[`));
  }
  assert.match(game, /function serve\(\)/);
  assert.match(game, /function choose\(index\)/);
});

test("选择缺失时不能端杯，错误配方也能继续故事", () => {
  assert.match(game, /Object\.values\(selected\)\.some\(v=>!v\)/);
  assert.match(game, /result==="bad"/);
  assert.match(game, /state\.index\+\+/);
});

test("选择会影响至少三个结局", () => {
  for (const ending of ["beacon", "archive", "spark"]) {
    assert.match(game, new RegExp(`${ending}:\\{`));
  }
  assert.match(game, /state\.empathy\+=choice\.empathy/);
  assert.match(game, /state\.edge\+=choice\.edge/);
});

test("进度可以保存、读取和清除", () => {
  assert.match(game, /localStorage\.setItem\(SAVE_KEY/);
  assert.match(game, /localStorage\.getItem\(SAVE_KEY/);
  assert.match(game, /localStorage\.removeItem\(SAVE_KEY/);
});
