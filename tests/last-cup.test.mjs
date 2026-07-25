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

test("酒水材料扩充且能产生至少 150 种基础搭配", () => {
  const groupSizes = ["base", "flavor", "garnish"].map((group) => {
    const body = game.match(new RegExp(`${group}: \\[([\\s\\S]*?)\\n      \\]`))?.[1] ?? "";
    return (body.match(/\{id:/g) ?? []).length;
  });
  assert.ok(groupSizes.reduce((total, size) => total * size, 1) >= 150);
  for (const ingredient of ["beer", "wine", "citrus", "lemon"]) {
    assert.match(game, new RegExp(`id:"${ingredient}"`));
  }
});

test("可以只选一种，也可以同时选择多种材料", () => {
  assert.match(game, /selected = \{base:\[\],flavor:\[\],garnish:\[\]\}/);
  assert.match(game, /if\(existing>=0\)list\.splice/);
  assert.match(game, /else list\.push\(id\)/);
  assert.match(game, /every\(ids=>ids\.length===0\)/);
  assert.match(game, /serveBtn"\)\.disabled=picked\.length===0/);
});

test("只给观察线索，不直接公布正确配方", () => {
  assert.match(game, /观察笔记/);
  assert.doesNotMatch(game, /推荐配方|正确配方|配方答案/);
});

test("完全空杯不能端杯，任意风味结果都能继续故事", () => {
  assert.match(game, /Object\.values\(selected\)\.every\(ids=>ids\.length===0\)/);
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
