/* 传说之下：毒师宇宙 — 主入口 */
const Game = {
  player: null, overworld: null,
  state: "title", /* title, intro, overworld, gameover, ending, perkSelect, achievements */
  titleSel: 0,
  titleOptions: ["开始游戏", "继续游戏", "成就", "关于"],
  dialog: new DialogBox(),
  perkPos: 0,
  perkOptions: ["rising","hasted","laststand"],
  menu: new Menu(),

  init() {
    Engine.init();
    this.player = new Player();
    Engine.run(t => this.loop(t));
    const startTitleAudio = () => {
      AudioEngine.unlock();
      AudioEngine.playBGM("title");
    };
    document.addEventListener("keydown", startTitleAudio, { once: true });
    document.addEventListener("pointerdown", startTitleAudio, { once: true });
  },

  startOverworld() {
    this.overworld = new Overworld(this.player, () => {
      AudioEngine.stopBGM();
      this.state = "ending";
    });
    this.state = "overworld";
  },

  returnToTitle() {
    AudioEngine.playBGM("title");
    this.state = "title";
    this.titleSel = 0;
    this.overworld = null;
  },

  loop(t) {
    switch(this.state) {
      case "title": this.updateTitle(); this.drawTitle(Engine.ctx); break;
      case "intro": this.updateIntro(); this.drawIntro(Engine.ctx); break;
      case "perkSelect": this.updatePerkSelect(); this.drawPerkSelect(Engine.ctx); break;
      case "achievements": this.updateAchievements(); this.drawAchievements(Engine.ctx); break;
      case "overworld":
        if (this.overworld) {
          this.overworld.update();
          this.overworld.draw(Engine.ctx);
          if (this.overworld.state === "gameover") this.state = "gameover";
        }
        break;
      case "gameover": this.updateGameOver(); this.drawGameOver(Engine.ctx); break;
      case "ending": this.updateEnding(); this.drawEnding(Engine.ctx); break;
    }
  },

  /* ---- 标题画面 ---- */
  updateTitle() {
    if (this.dialog.active) {
      this.dialog.update();
      return;
    }
    if (Engine.justPressed("up")) { this.titleSel = (this.titleSel + 3) % 4; AudioEngine.sfx("select"); }
    if (Engine.justPressed("down")) { this.titleSel = (this.titleSel + 1) % 4; AudioEngine.sfx("select"); }
    if (Engine.justPressed("confirm")) {
      AudioEngine.sfx("confirm");
      if (this.titleSel === 0) {
        this.player = new Player();
        this.state = "perkSelect";
        this.perkPos = 0;
      } else if (this.titleSel === 1) {
        if (this.player.load()) {
          this.startOverworld();
        } else {
          this.dialog.show(["没有找到存档。"]);
        }
      } else if (this.titleSel === 2) {
        this.state = "achievements";
      } else {
        this.dialog.show(["传说之下：毒师宇宙 " + GAME_VERSION,
          "非官方同人作品",
          "致敬 Toby Fox 和 Vince Gilligan",
          "—— 化学就是力量 ——"]);
      }
    }
  },

  drawTitle(ctx) {
    /* 背景 */
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 640, 480);

    /* 标题 */
    ctx.fillStyle = "#FFF";
    ctx.font = "bold 28px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText(GAME_TITLE, 320, 120);
    ctx.font = "16px 'Courier New'";
    ctx.fillStyle = "#FFD700";
    ctx.fillText("UNDERTALE: HEISENBERG VERSE", 320, 150);

    /* 装饰线 */
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 165); ctx.lineTo(540, 165);
    ctx.stroke();

    /* 灵魂 */
    const t = Engine.frame;
    drawSoul(ctx, 310, 180 + Math.sin(t * 0.005) * 10, 4);

    /* 菜单 */
    this.titleOptions.forEach((opt, i) => {
      const y = 280 + i * 40;
      if (i === this.titleSel) drawSoul(ctx, 230, y - 12, 2);
      ctx.fillStyle = i === this.titleSel ? "#FF0" : "#FFF";
      ctx.font = "20px 'Courier New'";
      ctx.textAlign = "center";
      ctx.fillText(opt, 320, y);
    });

    /* 版本 */
    ctx.fillStyle = "#666";
    ctx.font = "12px 'Courier New'";
    ctx.fillText(GAME_VERSION + " | 非官方同人作品", 320, 440);
    ctx.fillText("按 Z / 点击确认 开始", 320, 460);
    ctx.textAlign = "left";
    this.dialog.draw(ctx);
  },

  /* ---- 天赋选择 ---- */
  updatePerkSelect() {
    if (Engine.justPressed("up")) { this.perkPos = (this.perkPos + 2) % 3; AudioEngine.sfx("select"); }
    if (Engine.justPressed("down")) { this.perkPos = (this.perkPos + 1) % 3; AudioEngine.sfx("select"); }
    if (Engine.justPressed("cancel")) { AudioEngine.sfx("cancel"); this.returnToTitle(); return; }
    if (Engine.justPressed("confirm")) {
      AudioEngine.sfx("confirm");
      this.player.perk = this.perkOptions[this.perkPos];
      this.player.save();
      this.startIntro();
    }
  },

  drawPerkSelect(ctx) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 640, 480);

    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 24px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText("选择开局天赋", 320, 70);
    ctx.font = "14px 'Courier New'";
    ctx.fillStyle = "#888";
    ctx.fillText("★ 每次踏入荒漠，只能选择一种 ★", 320, 100);

    this.perkOptions.forEach((id, i) => {
      const p = PERKS[id];
      const y = 150 + i * 100;
      const sel = i === this.perkPos;

      ctx.strokeStyle = sel ? "#FFF" : "#444";
      ctx.lineWidth = sel ? 3 : 2;
      ctx.strokeRect(90, y, 460, 80);
      if (sel) { ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(90, y, 460, 80); }
      if (i === this.perkPos) drawSoul(ctx, 70, y + 30, 3);

      ctx.fillStyle = p.color;
      ctx.font = "bold 20px 'Courier New'";
      ctx.textAlign = "left";
      ctx.fillText(p.name, 110, y + 28);

      ctx.fillStyle = "#DDD";
      ctx.font = "14px 'Courier New'";
      p.desc.split("\n").forEach((ln, j) => {
        ctx.fillText(ln, 110, y + 52 + j * 20);
      });
    });

    ctx.textAlign = "center";
    ctx.fillStyle = "#888";
    ctx.font = "12px 'Courier New'";
    ctx.fillText("上下选择  Z确认  X返回", 320, 460);
    ctx.textAlign = "left";
  },

  /* ---- 成就画廊 ---- */
  updateAchievements() {
    if (Engine.justPressed("confirm") || Engine.justPressed("cancel")) {
      AudioEngine.sfx("cancel");
      this.state = "title";
    }
  },

  drawAchievements(ctx) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 640, 480);

    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 24px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText("—— 成就画廊 ——", 320, 60);
    ctx.textAlign = "left";

    let unlocked = [];
    try { unlocked = JSON.parse(localStorage.getItem("heisenberg_achievements") || "[]"); }
    catch(e) { unlocked = []; }
    if (!Array.isArray(unlocked)) unlocked = [];

    const ids = ["saul","jesse","gus","mike","gale","walt"];
    ids.forEach((id, i) => {
      const a = ACHIEVEMENTS[id];
      const got = unlocked.includes(id);
      const x = 60 + (i % 2) * 280;
      const y = 110 + Math.floor(i / 2) * 80;

      ctx.strokeStyle = got ? "#FFD700" : "#333";
      ctx.lineWidth = got ? 2 : 1;
      ctx.strokeRect(x, y, 240, 60);
      if (!got) { ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.fillRect(x, y, 240, 60); }

      ctx.fillStyle = got ? "#FFD700" : "#555";
      ctx.font = "bold 16px 'Courier New'";
      ctx.fillText(got ? "★ " + a.name : "???", x + 12, y + 24);
      ctx.fillStyle = got ? "#CCC" : "#444";
      ctx.font = "13px 'Courier New'";
      ctx.fillText(got ? a.desc : "未解锁", x + 12, y + 46);
    });

    ctx.textAlign = "center";
    ctx.fillStyle = "#888";
    ctx.font = "12px 'Courier New'";
    ctx.fillText(`已解锁 ${unlocked.length} / ${ids.length}`, 320, 455);
    ctx.fillText("按 Z 返回标题", 320, 475);
    ctx.textAlign = "left";
  },

  /* ---- 开场 ---- */
  startIntro() {
    this.state = "intro";
    AudioEngine.playBGM("title");
    const lines = [
      "很久很久以前，地球由两个种族统治着：",
      "「化学家」和「毒师」。",
      "有一天，两个种族之间爆发了战争。",
      "经历了漫长的战争之后，化学家赢得了胜利。",
      "他们用一道魔法咒文把毒师们封印在了荒漠之下。",
      "很多年过去了...",
      "「边境山脉」 20XX年",
      "传说那些爬上荒漠的人从此一去不复返。",
      "—— 而你，一个化学学徒，",
      "即将踏入这片被遗忘的土地。"
    ];
    this.dialog.show(lines, () => this.startOverworld());
  },

  updateIntro() {
    this.dialog.update();
  },

  drawIntro(ctx) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 640, 480);
    this.dialog.draw(ctx);
  },

  /* ---- 游戏结束 ---- */
  updateGameOver() {
    if (Engine.justPressed("confirm")) this.returnToTitle();
  },

  drawGameOver(ctx) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 640, 480);
    ctx.fillStyle = "#F00";
    ctx.font = "bold 36px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", 320, 200);
    ctx.fillStyle = "#FFF";
    ctx.font = "16px 'Courier New'";
    ctx.fillText("你的灵魂消散了...", 320, 250);
    ctx.fillText("保持决心。", 320, 280);
    ctx.fillText("按 Z 返回标题", 320, 350);
    ctx.textAlign = "left";
  },

  /* ---- 结局 ---- */
  updateEnding() {
    if (Engine.justPressed("confirm")) this.returnToTitle();
  },

  drawEnding(ctx) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 640, 480);
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 24px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText("传说之下：毒师宇宙", 320, 100);
    ctx.font = "16px 'Courier New'";
    ctx.fillStyle = "#FFF";
    const isPacifist = this.player.kills === 0;
    const isGenocide = this.player.spared === 0 && this.player.kills > 0;
    if (isPacifist) {
      ctx.fillText("—— 和平结局 ——", 320, 150);
      ctx.fillText("你用仁慈和理解穿越了边境。", 320, 190);
      ctx.fillText("叮叮花给了你一朵花。", 320, 220);
      ctx.fillText("古斯塔沃给了你一块炸鸡。", 320, 250);
      ctx.fillText("索尔给了你一张名片。", 320, 280);
      ctx.fillText("海森堡说：「你是个好人。」", 320, 310);
    } else if (isGenocide) {
      ctx.fillStyle = "#F00";
      ctx.fillText("—— 屠杀结局 ——", 320, 150);
      ctx.fillStyle = "#FFF";
      ctx.fillText("你用鲜血和恐惧统治了边境。", 320, 190);
      ctx.fillText("荒漠中再也没有铃声。", 320, 220);
      ctx.fillText("炸鸡店关门了。", 320, 250);
      ctx.fillText("没有人再打电话。", 320, 280);
      ctx.fillText("你成为了新的海森堡。", 320, 310);
    } else {
      ctx.fillText("—— 中立结局 ——", 320, 150);
      ctx.fillText("你穿过了边境，带着复杂的记忆。", 320, 190);
      ctx.fillText("有些人被你饶恕，有些人被你击败。", 320, 220);
      ctx.fillText("荒漠依然在那里。", 320, 250);
      ctx.fillText("也许有一天你会回来。", 320, 280);
    }
    ctx.fillStyle = "#888";
    ctx.font = "14px 'Courier New'";
    ctx.fillText("感谢游玩！按 Z 返回标题", 320, 400);
    ctx.textAlign = "left";
  }
};

/* 启动 */
window.addEventListener("load", () => Game.init());