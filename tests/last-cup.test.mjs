import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";

const root = new URL("../", import.meta.url);
const game = readFileSync(new URL("last-cup.html", root), "utf8");
const script = game.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? "";

test("最后一杯页面脚本语法有效", () => {
  assert.doesNotThrow(() => new Function(script));
});

test("最后一杯摇酒时会持续播放冰块碰杯声音", () => {
  assert.match(game, /function iceClink\(/, "需要有专门的冰块碰撞音效");
  assert.match(game, /function startIceLoop\(/, "按住摇酒时需要启动连续冰块声");
  assert.match(game, /function stopIceLoop\(/, "松开或关声音时需要停止冰块声");
  assert.match(game, /iceClink\(\.045\);startIceLoop\(\);/, "开始摇酒时需要立即响一声并进入循环");
  assert.match(game, /shakeStartedAt=0;stopIceLoop\(\);/, "停止摇酒时需要结束循环，避免声音残留");
});

test("最后一杯声音开关会同步关闭摇酒冰块声", () => {
  assert.match(game, /if\(!state\.sound\)stopIceLoop\(\);/, "关闭声音时要立刻停掉正在循环的冰块声");
});
