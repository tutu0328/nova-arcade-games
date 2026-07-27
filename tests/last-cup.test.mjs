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
  assert.match(game, /function iceVolumeForShake\(/, "冰块声需要随摇制进度变化");
  assert.match(game, /return \.16-progress\*\.125;/, "冰块声要足够明显，并在接近最佳时变小");
  assert.match(game, /iceClink\(\.17\);startIceLoop\(\);/, "开始摇酒时需要立即响一声明显的冰块声并进入循环");
  assert.match(game, /shakeStartedAt=0;stopIceLoop\(\);/, "停止摇酒时需要结束循环，避免声音残留");
  assert.match(game, /冰块声正在变小，现在接近最佳时机/, "需要提示玩家冰块声变小就是最佳附近");
});

test("最后一杯声音开关会同步关闭摇酒冰块声", () => {
  assert.match(game, /if\(!state\.sound\)stopIceLoop\(\);/, "关闭声音时要立刻停掉正在循环的冰块声");
});

test("最后一杯少摇可以继续补摇，摇够后自动端给客人", () => {
  assert.match(game, /shakeDuration\+=performance\.now\(\)-shakeStartedAt/, "多次摇酒需要累计时间，少了才能补摇");
  assert.match(game, /if\(shakeDuration<requiredShake\(\)\)/, "少摇不能直接端上，需要允许继续补摇");
  assert.match(game, /还少一点 · 继续按住补摇/, "少摇时需要明确告诉玩家可以补摇");
  assert.match(game, /setTimeout\(serve,140\)/, "摇够或摇多后松手必须自动端给客人");
  assert.match(game, /已经端给客人/, "自动端上后按钮状态需要反馈");
});

test("最后一杯默认必须加冰，除非客人不喝凉的", () => {
  assert.match(game, /function hasIce\(\)\{return selected\.garnish\.includes\("ice"\)\}/, "需要识别是否加了彗尾碎冰");
  assert.match(game, /function guestAvoidsIce\(\)/, "需要识别不喝凉的客人");
  assert.match(game, /if\(!guestAvoidsIce\(\)&&!hasIce\(\)\)return"bad";/, "一般客人没加冰不能给好评");
  assert.match(game, /guestAvoidsIce\(\)&&hasIce\(\)/, "不喝凉的客人加冰要算错误");
  assert.match(game, /这杯该加冰，你忘了放彗尾碎冰/, "没加冰时客人要指出错误");
  assert.match(game, /我不喝凉的，这杯不该加冰/, "不喝凉的客人加冰时要指出错误");
});
