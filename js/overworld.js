/* 地表探索模块 */
class Overworld {
  constructor(player, onEnding) {
    this.player = player;
    this.onEnding = onEnding || (() => {});
    this.dialog = new DialogBox();
    this.state = "walk"; /* walk, dialog, battle, save, gameover */
    this.area = this.player.area || "desert";
    this.playerX = Number.isFinite(this.player.x) ? this.player.x : 320;
    this.playerY = Number.isFinite(this.player.y) ? this.player.y : 240;
    this.encounterTimer = 0;
    this.encounterRate = 180; /* 帧/次 */
    this.battle = null;
    this.savePoint = null;
    this.npcs = [];
    this.initNPCs();
    this.areaColors = {
      desert: { bg:"#1a0a00", ground:"#3a2a1a", accent:"#FFD700" },
      pollos: { bg:"#2a1a0a", ground:"#4a2a1a", accent:"#FFD700" },
      lab:    { bg:"#0a1a2a", ground:"#1a2a3a", accent:"#0CF" },
      throne: { bg:"#0a0a0a", ground:"#2a0a0a", accent:"#FFD700" }
    };
    AudioEngine.playBGM("desert");
  }

  initNPCs() {
    this.npcs = [
      { id:"hector", x:200, y:300, area:"desert", sprite:"hector_flower", name:"叮叮花",
        dialogs: [
          ["叮铃铃——！","你好呀！我是叮叮花！","在边境，不是杀人就是被杀！","去死吧！！"],
          ["叮铃...","（远处传来一声爆炸）","叮叮花逃走了。"]
        ]},
      { id:"gus", x:400, y:200, area:"pollos", sprite:"gus", name:"古斯塔沃",
        dialogs: [
          ["（一阵柠檬香味飘来）","我是古斯塔沃，「洛斯波约斯」的店长。","这里很危险。让我带你回家吧。"]
        ]},
      { id:"saul", x:150, y:350, area:"desert", sprite:"saul", name:"索尔",
        dialogs: [
          ["嘿——！朋友！站住！","我叫索尔，索尔·古德曼。","你也许在电视上看过我的广告？「有事就打给我！」"]
        ]},
      { id:"jesse", x:500, y:180, area:"desert", sprite:"jesse", name:"杰西",
        dialogs: [
          ["喂！！！站住！！","我，杰西·平克曼，「沃特先生」的第一搭档！","我会抓住你！捏哈哈——！"]
        ]},
      { id:"mike", x:300, y:150, area:"lab", sprite:"mike", name:"麦克",
        dialogs: [
          ["（一个老人站在阴影中）","我叫麦克。","我给你一个建议：回头。","前面的路... 不是散步的地方。"]
        ]},
      { id:"gale", x:450, y:250, area:"lab", sprite:"gale", name:"盖尔",
        dialogs: [
          ["哦——！！一位访客！！","我是盖尔！盖尔·伯提切！","化学家！咖啡爱好者！歌剧爱好者！"]
        ]},
      { id:"walt", x:320, y:100, area:"throne", sprite:"walt", name:"海森堡",
        dialogs: [
          ["我是海森堡。这个帝国的王。","我做这一切... 是因为我擅长。","现在——说出我的名字。"]
        ]}
    ];
  }

  update() {
    if (this.state === "battle" && this.battle) {
      this.battle.update();
      return;
    }

    if (this.dialog.active) {
      this.dialog.update();
      return;
    }

    if (this.state === "walk") {
      this.updateWalk();
      if (this.state === "walk" && !this.dialog.active) this.checkEncounter();
    }
  }

  updateWalk() {
    const speed = 3;
    if (Engine.keys["up"]) this.playerY -= speed;
    if (Engine.keys["down"]) this.playerY += speed;
    if (Engine.keys["left"]) this.playerX -= speed;
    if (Engine.keys["right"]) this.playerX += speed;

    this.playerX = Math.max(20, Math.min(620, this.playerX));
    this.playerY = Math.max(20, Math.min(460, this.playerY));
    this.syncPlayerPosition();

    /* 检查NPC与存档点交互 */
    if (Engine.justPressed("confirm")) {
      const save = this.getSavePoint();
      if (Math.abs(save.x - this.playerX) < 38 && Math.abs(save.y - this.playerY) < 38) {
        this.useSavePoint(save);
        return;
      }
      for (const npc of this.npcs) {
        if (npc.area !== this.area) continue;
        if (npc.id === "hector" && this.player.flags.resolved_hector) continue;
        const dx = Math.abs(npc.x - this.playerX);
        const dy = Math.abs(npc.y - this.playerY);
        if (dx < 40 && dy < 40) {
          this.talkToNPC(npc);
          return;
        }
      }
    }

    /* 区域切换 */
    if (this.playerX > 600) this.changeArea("next");
    if (this.playerX < 40) this.changeArea("prev");
  }

  syncPlayerPosition() {
    this.player.area = this.area;
    this.player.x = this.playerX;
    this.player.y = this.playerY;
  }

  getSavePoint() {
    const ids = { desert:"entrance", pollos:"pollos", lab:"lab", throne:"throne" };
    return { id:ids[this.area], x:90, y:110 };
  }

  useSavePoint(save) {
    this.player.hp = this.player.maxhp;
    this.player.area = this.area;
    this.player.x = this.playerX;
    this.player.y = this.playerY;
    this.player.save();
    AudioEngine.sfx("heal");
    this.dialog.show([SAVE_POINTS[save.id], "HP已完全恢复。", "进度已保存。"]);
  }

  changeArea(dir) {
    const areas = ["desert","pollos","lab","throne"];
    const idx = areas.indexOf(this.area);
    let newIdx = idx;
    if (dir === "next" && idx < areas.length - 1) newIdx = idx + 1;
    if (dir === "prev" && idx > 0) newIdx = idx - 1;
    if (newIdx !== idx) {
      this.area = areas[newIdx];
      this.playerX = dir === "next" ? 60 : 580;
      this.playerY = 240;
      this.syncPlayerPosition();
      AudioEngine.playBGM(this.area);
    }
  }

  talkToNPC(npc) {
    const defeated = this.player.flags["resolved_" + npc.id];
    if (defeated) {
      const after = npc.id === "walt"
        ? ["王座已经空了。", "通往边境之外的道路已经开启。"]
        : [npc.name + "已经放下了战意。"];
      this.dialog.show(after);
      return;
    }
    const dialogs = npc.dialogs[0];
    this.dialog.show(dialogs, () => {
      if (npc.id === "hector") {
        this.player.flags.resolved_hector = "escaped";
        this.syncPlayerPosition();
        this.player.save();
        AudioEngine.sfx("explosion");
        this.dialog.show(["叮铃...","（远处传来一声爆炸，轮椅翻倒）","叮叮花逃走了。"]);
      } else if (npc.id === "gus" || npc.id === "jesse" || npc.id === "mike" || npc.id === "gale" || npc.id === "walt") {
        this.startBattle(npc.id, true);
      }
    });
  }

  checkEncounter() {
    this.encounterTimer++;
    if (this.encounterTimer > this.encounterRate) {
      this.encounterTimer = 0;
      if (Math.random() < 0.3) {
        /* 随机遭遇：不重复出现已解决的剧情角色 */
        const enemies = ["saul","jesse"].filter(id => !this.player.flags["resolved_" + id]);
        if (enemies.length) {
          const id = enemies[Math.floor(Math.random() * enemies.length)];
          this.startBattle(id, true);
        }
      }
    }
  }
startBattle(charId, story=false) {
    this.state = "battle";
    this.battle = new Battle(charId, this.player, (result, leveled) => {
      if (result === "gameover") {
        this.state = "gameover";
        this.battle = null;
        AudioEngine.stopBGM();
        return;
      }

      this.state = "walk";
      this.battle = null;
      const reward = CHARACTERS[charId].spare_gold || 10;
      if (story) this.player.flags["resolved_" + charId] = result;
      this.player.area = this.area;
      this.player.x = this.playerX;
      this.player.y = this.playerY;

      if (charId === "walt" && story) {
        this.player.save();
        AudioEngine.stopBGM();
        this.dialog.show(
          result === "spare"
            ? ["海森堡摘下了帽子。", "「你说对了名字。」", "王座后的大门缓缓开启。"]
            : ["海森堡倒下了。", "王座后的大门在寂静中开启。"],
          () => this.onEnding()
        );
        return;
      }

      AudioEngine.playBGM(this.area);
      this.player.area = this.area;
      this.player.x = this.playerX;
      this.player.y = this.playerY;
      if (story) this.player.save();
      if (result === "spare") {
        this.dialog.show(["你饶恕了" + CHARACTERS[charId].cn_name + "。", `获得了 ${reward}G。`]);
      } else {
        const lines = ["你击败了" + CHARACTERS[charId].cn_name + "。"]; 
        if (leveled) lines.push("等级提升！现在 LV " + this.player.lv + "！");
        lines.push(`获得了 ${reward}G。`);
        this.dialog.show(lines);
      }
    });
  }
  draw(ctx) {
    if (this.state === "battle" && this.battle) {
      this.battle.draw(ctx);
      return;
    }

    /* 背景 */
    const colors = this.areaColors[this.area];
    drawBgDecor(ctx, this.area, 640, 480, Engine.frame);

    /* 存档点 */
    const save = this.getSavePoint();
    drawSave(ctx, save.x - 10, save.y - 10, Engine.frame);

    /* NPC */
    for (const npc of this.npcs) {
      if (npc.area !== this.area) continue;
      if (npc.id === "hector" && this.player.flags.resolved_hector) continue;
      drawCharacter(ctx, npc.sprite, npc.x, npc.y, 40, 80, Engine.frame);
      /* 名字标签 */
      ctx.fillStyle = "#FFF";
      ctx.font = "12px 'Courier New'";
      ctx.textAlign = "center";
      ctx.fillText(npc.name, npc.x, npc.y - 10);
      ctx.textAlign = "left";
    }

    /* 玩家 */
    drawSoul(ctx, this.playerX - 8, this.playerY - 8, 3);

    /* 区域名 */
    const areaNames = { desert:"荒漠边境", pollos:"洛斯波约斯炸鸡店", lab:"地下实验室", throne:"海森堡王座" };
    ctx.fillStyle = colors.accent;
    ctx.font = "bold 20px 'Courier New'";
    ctx.fillText(areaNames[this.area], 20, 30);

    /* 玩家信息 */
    ctx.fillStyle = "#FFF";
    ctx.font = "14px 'Courier New'";
    ctx.fillText(`${this.player.name} LV${this.player.lv} HP:${this.player.hp}/${this.player.maxhp} G:${this.player.gold}`, 20, 55);
    ctx.fillText(`击杀:${this.player.kills} 宽恕:${this.player.spared}`, 20, 75);

    /* 操作提示 */
    ctx.fillStyle = "#888";
    ctx.font = "12px 'Courier New'";
    ctx.fillText("方向键移动 | Z确认/对话 | X取消 | 左右边缘切换区域", 20, 465);

    /* 对话框 */
    this.dialog.draw(ctx);
  }
}