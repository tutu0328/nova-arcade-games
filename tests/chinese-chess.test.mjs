import assert from "node:assert/strict";
import {existsSync, readFileSync} from "node:fs";
import {test} from "node:test";

const root = new URL("../", import.meta.url);
const game = readFileSync(new URL("chinese-chess.html", root), "utf8");
const index = readFileSync(new URL("index.html", root), "utf8");
const script = game.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? "";

test("游戏库可以进入《星河棋社》", () => {
  assert.ok(existsSync(new URL("chinese-chess.html", root)));
  assert.match(index, /href:'chinese-chess\.html'/);
  assert.match(index, /title:'星河棋社'/);
  assert.match(index, /NOVA CHESS CLUB/);
  assert.match(index, /中国象棋、国际象棋、跳棋/);
});

test("象棋页面脚本语法有效", () => {
  assert.doesNotThrow(() => new Function(script));
});

test("进入页面先看到首页介绍和开始游戏按钮", () => {
  assert.match(game, /id="homeScreen"/);
  assert.match(game, /id="gameScreen" class="hidden"/);
  assert.match(game, /id="startGameBtn">开始游戏<\/button>/);
  assert.match(game, /id="startMatchBtn">快速匹配<\/button>/);
  assert.match(game, /一个棋类合集：可以玩中国象棋、国际象棋和跳棋/);
  assert.match(game, /不是空棋盘，是真功能。/);
  assert.match(game, /不在首页放空棋盘占位置/);
  assert.match(game, /function showGame\(\)/);
  assert.match(game, /\$\("startGameBtn"\)\.onclick/);
});

test("页面已经从单一象棋升级成棋类合集", () => {
  assert.match(game, /星河棋社/);
  assert.match(game, /NOVA <span>CHESS CLUB<\/span>/);
  assert.match(game, /id="gameTypeButtons"/);
  assert.match(game, /data-game-type="xiangqi"/);
  assert.match(game, /data-game-type="chess"/);
  assert.match(game, /data-game-type="checkers"/);
  assert.match(game, /const GAME_TYPES=\{xiangqi:"中国象棋",chess:"国际象棋",checkers:"跳棋"\}/);
  assert.match(game, /function switchGameType\(type\)/);
});

test("国际象棋和跳棋有独立的8x8棋盘与基础走子", () => {
  assert.match(game, /id="classicWrap"/);
  assert.match(game, /id="classicBoard"/);
  assert.match(game, /function initialClassicBoard\(type\)/);
  assert.match(game, /if\(type==="chess"\)/);
  assert.match(game, /if\(type==="checkers"\)/);
  assert.match(game, /function rawClassicMovesFor\(b,r,c,onlyCaptures=false\)/);
  for (const piece of ["p", "n", "b", "r", "q", "k"]) {
    assert.match(game, new RegExp(`p\\.type==="${piece}"`));
  }
  assert.match(game, /function renderClassicBoard\(\)/);
  assert.match(game, /function makeClassicMove\(move,actor\)/);
});

test("支持双人对战、人机对战和匹配对战", () => {
  assert.match(game, /data-mode="ai"/);
  assert.match(game, /data-mode="match"/);
  assert.match(game, /data-mode="local"/);
  assert.match(game, /function startMatch\(\)/);
  assert.match(game, /id="matchButton"/);
  assert.match(game, /双人对战/);
});

test("人机难度不止三档，并包含更高档位，而且三种棋共享难度", () => {
  for (const level of ["novice", "easy", "normal", "advanced", "hard", "master", "legend"]) {
    assert.match(game, new RegExp(`data-difficulty="${level}"`));
  }
  assert.match(game, /id:"super"/);
  assert.match(game, /function chooseAiMove\(\)/);
  assert.match(game, /const DIFFICULTIES=\[/);
  assert.match(game, /difficultyById/);
  assert.match(game, /minimax/);
  assert.match(game, /function chooseClassicAiMove\(\)/);
  assert.match(game, /difficultyById\(mode==="match"&&matchedOpponent\?matchedOpponent\.difficulty:selectedDifficulty\)/);
  assert.match(game, /国际象棋使用同一套难度和 AI 对手/);
  assert.match(game, /跳棋使用同一套难度和 AI 对手/);
});

test("常见AI和超级人机是正式可选对手，不只藏在提示里", () => {
  assert.match(game, /id="aiProfileButtons"/);
  for (const profile of ["standard", "doubao", "deepseek", "codex", "lobster", "super"]) {
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

test("进攻AI、防守AI、残局AI已经从正式选项删除", () => {
  assert.doesNotMatch(game, /data-ai-profile="aggressive"/);
  assert.doesNotMatch(game, /data-ai-profile="defensive"/);
  assert.doesNotMatch(game, /data-ai-profile="endgame"/);
  assert.doesNotMatch(game, />进攻AI</);
  assert.doesNotMatch(game, />防守AI</);
  assert.doesNotMatch(game, />残局AI</);
});

test("选择超级人机时不需要再选难度", () => {
  assert.match(game, /aiProfile==="super"/);
  assert.match(game, /b\.disabled=mode!=="ai"\|\|aiProfile==="super"/);
  assert.match(game, /difficulty:"super"/);
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
  assert.match(game, /\.board:before,\s*\.board:after/);
  assert.match(game, /#ffe3a2/);
  assert.doesNotMatch(game, /nth-child\(41\)::after/);
  assert.doesNotMatch(game, /nth-child\(45\)::after/);
});

test("中国象棋棋子和点击热区落在十字交叉点，不落在格子中心", () => {
  assert.match(game, /cell\.style\.left=`\$\{c\/8\*100\}%`/);
  assert.match(game, /cell\.style\.top=`\$\{r\/9\*100\}%`/);
  assert.match(game, /btn\.style\.left=`\$\{c\/8\*100\}%`/);
  assert.match(game, /btn\.style\.top=`\$\{r\/9\*100\}%`/);
  assert.doesNotMatch(game, /\(c\+\.5\)\/9\*100/);
  assert.doesNotMatch(game, /\(r\+\.5\)\/10\*100/);
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

test("炮仍然遵守原规则，但高难AI会避免炮换马这类亏子交换", () => {
  assert.match(game, /if\(p\.type==="c"\)/);
  assert.match(game, /screen=false/);
  assert.match(game, /else if\(!screen&&b\[nr\]\[nc\]\)screen=true/);
  assert.match(game, /else if\(screen&&b\[nr\]\[nc\]\)\{if\(enemy\(b\[nr\]\[nc\],p\.side\)\)out\.push\(\{r:nr,c:nc\}\);break\}/);
  assert.match(game, /避免炮换马这类亏子交换/);
});

test("宗师和超级人机不再只按吃子贪心评分", () => {
  assert.match(game, /function strategicScore\(b,move,side\)/);
  assert.match(game, /function hangingPenalty\(next,move,side\)/);
  assert.match(game, /values\[taken\.type\]\*\.85/);
  assert.match(game, /if\(profile\.style==="super"\)return strategicScore/);
  assert.doesNotMatch(game, /values\[taken\.type\]\*3/);
  assert.doesNotMatch(game, /values\[taken\.type\]\*1\.6/);
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

test("除签到和赛事外，加入长期留存功能面板", () => {
  for (const id of ["aiChat", "memoryCard", "playerStats", "achievements", "reviewPanel", "openingPanel", "endgamePanel", "socialPanel"]) {
    assert.match(game, new RegExp(`id="${id}"`));
  }
  assert.match(game, /AI复盘/);
  assert.match(game, /开局库/);
  assert.match(game, /残局练习/);
  assert.match(game, /好友大厅/);
  assert.match(game, /好友大厅/);
  assert.doesNotMatch(game, /每日签到/);
  assert.doesNotMatch(game, /签到/);
  assert.doesNotMatch(game, /赛事/);
});

test("AI会聊天、记住玩家并生成成就统计", () => {
  assert.match(game, /const AI_TALKS=/);
  assert.match(game, /function sayAi\(type="start"\)/);
  assert.match(game, /id="aiBubble"/);
  assert.match(game, /class="assistant-bubble"/);
  assert.match(game, /const MEMORY_KEY="nova-chess-club-memory"/);
  assert.match(game, /function loadMemory\(\)/);
  assert.match(game, /function renderProgressPanels\(\)/);
  assert.match(game, /achievementList/);
  assert.match(game, /memory\.games/);
  assert.match(game, /memory\.moves/);
});

test("AI拥有可选择的不同性格，并会影响走法", () => {
  assert.match(game, /id="aiPersonaButtons"/);
  for (const persona of ["scholar", "sprinter", "berserker", "turtle", "endmaster", "trickster"]) {
    assert.match(game, new RegExp(`data-ai-persona="${persona}"`));
  }
  for (const label of ["老棋痴", "快枪手", "攻击狂魔", "铁桶阵", "残局大师", "心理大师"]) {
    assert.match(game, new RegExp(`>${label}<`));
  }
  assert.match(game, /const AI_PERSONAS=/);
  assert.match(game, /function personaScore\(b,move,side\)/);
  assert.match(game, /aiDelay\(\)/);
});

test("棋子动画、音效、棋盘主题和棋子皮肤可切换", () => {
  assert.match(game, /id="themeButtons"/);
  assert.match(game, /data-board-theme="jade"/);
  assert.match(game, /data-board-theme="ink"/);
  assert.match(game, /data-board-theme="star"/);
  assert.match(game, /id="skinButtons"/);
  assert.match(game, /data-piece-skin="gold"/);
  assert.match(game, /data-piece-skin="cyber"/);
  assert.match(game, /function playTone\(kind="move"\)/);
  assert.match(game, /function pulseBoard\(kind="move"\)/);
  assert.match(game, /move-pop/);
  assert.match(game, /check-flash/);
});

test("学习功能包含AI复盘、开局库和残局练习", () => {
  assert.match(game, /function showReview\(\)/);
  assert.match(game, /const OPENINGS=/);
  assert.match(game, /中炮/);
  assert.match(game, /屏风马/);
  assert.match(game, /function showOpeningLibrary\(\)/);
  assert.match(game, /const ENDGAMES=/);
  assert.match(game, /三步杀/);
  assert.match(game, /function showEndgamePractice\(\)/);
});

test("社交功能保留本地好友大厅和观战，但不再使用弹幕", () => {
  assert.match(game, /const LOBBY_LINES=/);
  assert.match(game, /function showLobby\(\)/);
  assert.match(game, /好友邀请码/);
  assert.match(game, /观战/);
  assert.doesNotMatch(game, /观战弹幕/);
  assert.doesNotMatch(game, /danmaku/);
  assert.doesNotMatch(game, /弹幕：/);
});
