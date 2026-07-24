import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

const html = readFileSync(resolve('delta-arena.html'), 'utf8');
const catalogSource = html.match(/const weapons = (\{[\s\S]*?\n    \});\n\n    const mapNames/)?.[1];

assert.ok(catalogSource, '应能读取枪械目录');

const weapons = vm.runInNewContext(`(${catalogSource})`);
const selectable = Object.entries(weapons).filter(([, weapon]) => !weapon.melee && !weapon.throwable);
const primary = selectable.filter(([, weapon]) => weapon.cat !== '手枪');
const secondary = selectable.filter(([, weapon]) => weapon.cat === '手枪');

const V1_COUNTS = { primary: 9, secondary: 2, total: 11 };

test('正常情况：点击枪械选择栏时，v1.1 应看到比 v1.0 更多的枪', () => {
  assert.match(html, /<select id="primary"><\/select>/);
  assert.match(html, /<select id="secondary"><\/select>/);
  assert.ok(
    selectable.length > V1_COUNTS.total,
    `v1.0 有 ${V1_COUNTS.total} 把可选枪，v1.1 目前仍是 ${selectable.length} 把`,
  );
});

test('v1.1 枪械选择栏必须精确提供 30 把可选枪', () => {
  assert.equal(selectable.length, 30, `当前有 ${selectable.length} 把可选枪，应为 30 把`);
});

test('选择栏至少保留 v1.0 的主武器和副武器，不会破坏现有玩法', () => {
  assert.ok(primary.length >= V1_COUNTS.primary);
  assert.ok(secondary.length >= V1_COUNTS.secondary);
  assert.ok(weapons.m4);
  assert.ok(weapons.glock);
  assert.ok(weapons.knife);
});

test('空输入：可选枪的标识、名称和类别都不能为空', () => {
  for (const [key, weapon] of selectable) {
    assert.ok(key.trim(), '枪械标识不能为空');
    assert.ok(weapon.name?.trim(), `${key} 的名称不能为空`);
    assert.ok(weapon.cat?.trim(), `${key} 的类别不能为空`);
  }
});

test('错误输入：未知枪械值在进入对战前必须安全回退', () => {
  const primaryFallback =
    /weapons\[(?:primary|selectedPrimary)\]\s*\?\s*(?:primary|selectedPrimary)\s*:\s*['"]m4['"]/.test(html);
  const secondaryFallback =
    /weapons\[(?:secondary|selectedSecondary)\]\s*\?\s*(?:secondary|selectedSecondary)\s*:\s*['"]glock['"]/.test(html);
  assert.ok(primaryFallback, '主武器选择缺少未知值回退保护');
  assert.ok(secondaryFallback, '副武器选择缺少未知值回退保护');
});

test('重复输入：枪械标识和显示名称不能重复', () => {
  const declaredKeys = [...catalogSource.matchAll(/^\s{6}([a-z0-9]+):\s*\{/gm)].map(match => match[1]);
  const names = selectable.map(([, weapon]) => `${weapon.cat} · ${weapon.name}`);
  assert.equal(new Set(declaredKeys).size, declaredKeys.length);
  assert.equal(new Set(names).size, names.length);
});

test('边界检查：每把可选枪都有可用的弹药、射速和伤害数据', () => {
  for (const [key, weapon] of selectable) {
    assert.ok(Number.isFinite(weapon.damage) && weapon.damage > 0, `${key} 的伤害必须大于 0`);
    assert.ok(Number.isFinite(weapon.rate) && weapon.rate > 0, `${key} 的射速必须大于 0`);
    assert.ok(Number.isInteger(weapon.mag) && weapon.mag > 0, `${key} 的弹匣必须是正整数`);
    assert.ok(Number.isInteger(weapon.reserve) && weapon.reserve >= 0, `${key} 的备弹不能为负数`);
    assert.ok(Number.isFinite(weapon.reload) && weapon.reload >= 0, `${key} 的换弹时间不能为负数`);
    assert.ok(Number.isFinite(weapon.falloff) && weapon.falloff > 0, `${key} 的有效距离必须大于 0`);
  }
});

test('外观检查：枪械模型必须读取每把枪自己的外观配置', () => {
  assert.ok(
    /function makeGun3D\(key\)[\s\S]*?w\.(?:model|visual|shape)/.test(html),
    '当前模型只按枪械大类和颜色绘制，尚未读取每把枪独立的外观配置',
  );
});

test('换弹检查：装弹流程必须读取每把枪自己的换弹方式', () => {
  assert.ok(
    /function reload\(\)[\s\S]*?w\.reloadStyle/.test(html),
    '当前装弹流程尚未读取每把枪独立的换弹方式',
  );
});

test('换弹边界：现有玩法中的弹匣、逐发装填和弓箭装填路径必须保留', () => {
  assert.match(html, /w\.shellReload/);
  assert.match(html, /w\.charge/);
  assert.match(html, /playReloadSound\('start', w\)/);
});

test('选枪属性：主副武器选择栏必须显示并实时更新完整属性', () => {
  assert.match(html, /id="primaryStats"/);
  assert.match(html, /id="secondaryStats"/);
  assert.match(html, /function updateWeaponStats\(selectId, statsId\)/);
  for (const field of ['damage', 'rate', 'mag', 'reserve', 'reload', 'recoil', 'spread', 'falloff']) {
    assert.match(html, new RegExp(`weapon\\.${field}`), `属性面板缺少 ${field}`);
  }
  assert.match(html, /\$\('#primary'\)\.onchange/);
  assert.match(html, /\$\('#secondary'\)\.onchange/);
});
