import assert from "node:assert/strict";
import {existsSync, readFileSync, statSync} from "node:fs";
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

test("核心循环包含普通、特殊客人和三类材料", () => {
  assert.match(game, /const guests=\[\.\.\.coreGuests/);
  for (const id of ["veteran", "courier", "ai", "android", "critic", "last"]) {
    assert.match(game, new RegExp(`id:"${id}"`));
  }
  for (const group of ["base", "flavor", "garnish"]) {
    assert.match(game, new RegExp(`${group}: \\[`));
  }
  assert.match(game, /function serve\(\)/);
  assert.match(game, /function choose\(index\)/);
});

test("特殊客人会因违背要求投诉并扣除信用点", () => {
  assert.match(game, /id:"critic"/);
  assert.match(game, /noAlcohol:true/);
  assert.match(game, /maxIngredients:2/);
  assert.match(game, /return"complaint"/);
  assert.match(game, /客人正式投诉/);
  assert.match(game, /result==="complaint"\?-20/);
});

test("40位客人都有真实2D人物图片而不是表情符号", () => {
  for (const file of ["last-cup-portraits.png","last-cup-guests-02.png","last-cup-guests-03.png","last-cup-guests-04.png","last-cup-guests-05.png"]) {
    const portraits = new URL(`assets/${file}`, root);
    assert.ok(existsSync(portraits));
    assert.ok(statSync(portraits).size > 100_000);
  }
  assert.match(game, /background-image:url\("assets\/last-cup-portraits\.png"\)/);
  assert.equal((game.match(/portraitPos:"/g) ?? []).length, 6);
  const extraBlock = game.match(/const extraGuestSpecs = \[([\s\S]*?)\n    \];/)?.[1] ?? "";
  assert.equal((extraBlock.match(/^\s+\["/gm) ?? []).length, 34);
  assert.doesNotMatch(game, /guest\.icon/);
});

test("乱加材料不能保证客人满意", () => {
  assert.match(game, /activeTaste\.dislikes/);
  assert.match(game, /total>activeTaste\.maxIngredients/);
  assert.match(game, /conflicts>=2/);
});

test("酒水材料翻倍到32种", () => {
  const groupSizes = ["base", "flavor", "garnish"].map((group) => {
    const body = game.match(new RegExp(`${group}: \\[([\\s\\S]*?)\\n      \\]`))?.[1] ?? "";
    return (body.match(/\{id:/g) ?? []).length;
  });
  assert.equal(groupSizes.reduce((total, size) => total + size, 0), 32);
  assert.ok(groupSizes.reduce((total, size) => total * size, 1) >= 1000);
  for (const ingredient of ["beer", "wine", "citrus", "lemon"]) {
    assert.match(game, new RegExp(`id:"${ingredient}"`));
  }
});

test("可以只选一种，也可以同时选择多种材料", () => {
  assert.match(game, /selected = \{base:\[\],flavor:\[\],garnish:\[\]\}/);
  assert.match(game, /if\(existing>=0\)list\.splice/);
  assert.match(game, /else list\.push\(id\)/);
  assert.match(game, /every\(ids=>ids\.length===0\)/);
  assert.match(game, /shakeBtn"\)\.disabled=picked\.length===0/);
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

test("天数无限且口碑归零才经营失败", () => {
  assert.match(game, /guests\[state\.index%guests\.length\]/);
  assert.match(game, /第 \$\{state\.index\+1\} 天 · ∞/);
  assert.match(game, /reputation:70/);
  assert.match(game, /if\(state\.reputation===0\)state\.failed=true/);
  assert.match(game, /口碑归零 · 停止营业/);
});

test("回头客会根据上次评价改变态度和口味", () => {
  for (const result of ["good","okay","bad","complaint"]) assert.match(game,new RegExp(`${result}:`));
  assert.match(game, /function returnGreeting\(guest\)/);
  assert.match(game, /function tasteFor\(guest\)/);
  assert.match(game, /cycle\.indexOf\(tag\)\+amount/);
});

test("追问只透露部分口味，不公布配方", () => {
  assert.match(game, /id="askBtn"/);
  assert.match(game, /function askTaste\(\)/);
  assert.match(game, /已经追问过/);
});

test("选料后需要长按摇酒，时间会改变评价", () => {
  assert.match(game, /function requiredShake\(\)/);
  assert.match(game, /pointerdown/);
  assert.match(game, /pointerup/);
  assert.match(game, /shakeGrade==="poor"/);
  assert.match(game, /需要先长按摇酒/);
});

test("做得不好时客人会指出具体错误但不公布配方", () => {
  assert.match(game, /function buildCritique\(result\)/);
  assert.match(game, /材料没有融合/);
  assert.match(game, /风味被破坏/);
  assert.match(game, /我明确说过不能喝含酒精/);
  assert.match(game, /杯里出现了我不喜欢的/);
  assert.match(game, /指出问题/);
  assert.doesNotMatch(game, /正确材料是|正确配方是/);
});

test("进度可以保存、读取和清除", () => {
  assert.match(game, /localStorage\.setItem\(SAVE_KEY/);
  assert.match(game, /localStorage\.getItem\(SAVE_KEY/);
  assert.match(game, /localStorage\.removeItem\(SAVE_KEY/);
});
