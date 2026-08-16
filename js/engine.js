/* 传说之下：毒师宇宙 — 核心引擎 */
const Engine = {
  canvas: null, ctx: null, W: 640, H: 480,
  keys: {}, keyPressed: {},
  state: "title", /* title, overworld, battle, dialog, save, menu */
  frame: 0, lastTime: 0,

  init() {
    this.canvas = document.getElementById("game");
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.bindInput();
  },

  bindInput() {
    const keyMap = {
      z: "confirm", x: "cancel", c: "menu",
      ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      Enter: "confirm", Escape: "cancel", w: "up", s: "down", a: "left", d: "right"
    };
    const resolveKey = (value) => keyMap[value.length === 1 ? value.toLowerCase() : value];

    document.addEventListener("keydown", e => {
      const key = resolveKey(e.key);
      if (!key) return;
      if (!this.keys[key]) this.keyPressed[key] = true;
      this.keys[key] = true;
      AudioEngine.unlock();
      e.preventDefault();
    });
    document.addEventListener("keyup", e => {
      const key = resolveKey(e.key);
      if (key) this.keys[key] = false;
    });

    const activePointers = new Map();
    const refreshPointerKey = key => {
      this.keys[key] = Array.from(activePointers.values()).some(active => active.key === key);
    };
    const press = (el, key, e) => {
      e.preventDefault();
      AudioEngine.unlock();
      if (!this.keys[key]) this.keyPressed[key] = true;
      activePointers.set(e.pointerId, { key, el });
      this.keys[key] = true;
      el.classList.add("active");
      el.setPointerCapture?.(e.pointerId);
    };
    const release = e => {
      const active = activePointers.get(e.pointerId);
      if (!active) return;
      activePointers.delete(e.pointerId);
      active.el.classList.remove("active");
      refreshPointerKey(active.key);
    };
    const bindPointer = (el, key) => {
      if (!el) return;
      el.addEventListener("pointerdown", e => press(el, key, e));
      el.addEventListener("pointermove", e => {
        if (!activePointers.has(e.pointerId)) return;
        const rect = el.getBoundingClientRect();
        if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) release(e);
      });
      el.addEventListener("pointerup", release);
      el.addEventListener("pointercancel", release);
      el.addEventListener("contextmenu", e => e.preventDefault());
    };

    document.querySelectorAll("[data-key]").forEach(el => bindPointer(el, el.dataset.key));
    bindPointer(this.canvas, "confirm");

    const releaseAll = () => {
      activePointers.forEach(active => active.el.classList.remove("active"));
      activePointers.clear();
      this.keys = {};
      this.keyPressed = {};
    };
    window.addEventListener("blur", releaseAll);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) releaseAll();
    });
  },

  justPressed(key) {
    if (this.keyPressed[key]) { this.keyPressed[key] = false; return true; }
    return false;
  },

  clearPressed() { this.keyPressed = {}; },

  /* 游戏循环 */
  run(callback) {
    const frameDuration = 1000 / 60;
    const loop = t => {
      if (!this.lastTime) this.lastTime = t - frameDuration;
      const elapsed = Math.min(100, t - this.lastTime);
      if (elapsed >= frameDuration) {
        this.lastTime = t - (elapsed % frameDuration);
        this.frame++;
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.W, this.H);
        callback(t);
        this.clearPressed();
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
};

/* ========== 对话框系统（Undertale 风格打字机） ========== */
class DialogBox {
  constructor() {
    this.lines = [];
    this.currentLine = 0;
    this.currentChar = 0;
    this.charTimer = 0;
    this.charSpeed = 2; /* 帧/字 */
    this.active = false;
    this.callback = null;
    this.x = 30; this.y = 330; this.w = 580; this.h = 120;
  }

  show(lines, cb) {
    this.lines = Array.isArray(lines) ? lines : [lines];
    this.currentLine = 0;
    this.currentChar = 0;
    this.active = true;
    this.callback = cb || null;
  }

  update() {
    if (!this.active) return;
    this.charTimer++;
    const line = this.lines[this.currentLine] || "";
    if (this.charTimer >= this.charSpeed && this.currentChar < line.length) {
      this.currentChar++;
      this.charTimer = 0;
      if (this.currentChar % 3 === 0) AudioEngine.sfx("select");
    }
    if (Engine.justPressed("confirm")) {
      if (this.currentChar < line.length) {
        this.currentChar = line.length; /* 快进 */
      } else {
        this.currentLine++;
        this.currentChar = 0;
        if (this.currentLine >= this.lines.length) {
          this.active = false;
          if (this.callback) this.callback();
        }
      }
    }
  }

  draw(ctx) {
    if (!this.active) return;
    /* 白边框 */
    ctx.strokeStyle = "#FFF";
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x, this.y, this.w, this.h);
    ctx.fillStyle = "#000";
    ctx.fillRect(this.x + 2, this.y + 2, this.w - 4, this.h - 4);

    /* 文字 */
    ctx.fillStyle = "#FFF";
    ctx.font = "16px 'Courier New', monospace";
    const line = this.lines[this.currentLine] || "";
    const text = line.substring(0, this.currentChar);
    const wrapLines = this.wrapText(ctx, text, this.w - 30);
    wrapLines.forEach((l, i) => {
      ctx.fillText("* " + (i === 0 ? "" : "  ") + l, this.x + 15, this.y + 30 + i * 22);
    });

    /* 继续指示 */
    if (this.currentChar >= line.length) {
      ctx.fillStyle = "#FFF";
      ctx.fillText("▼", this.x + this.w - 25, this.y + this.h - 12);
    }
  }

  wrapText(ctx, text, maxW) {
    const words = text.split("");
    const lines = [];
    let cur = "";
    for (const ch of words) {
      if (ch === "\n") { lines.push(cur); cur = ""; continue; }
      if (ctx.measureText(cur + ch).width > maxW) {
        lines.push(cur); cur = ch;
      } else cur += ch;
    }
    if (cur) lines.push(cur);
    return lines;
  }
}

/* ========== 菜单系统 ========== */
class Menu {
  constructor() { this.options = []; this.selected = 0; this.active = false; this.title = ""; }
  show(title, options) { this.title = title; this.options = options; this.selected = 0; this.active = true; }
  update() {
    if (!this.active) return -1;
    if (Engine.justPressed("up")) { this.selected = (this.selected - 1 + this.options.length) % this.options.length; AudioEngine.sfx("select"); }
    if (Engine.justPressed("down")) { this.selected = (this.selected + 1) % this.options.length; AudioEngine.sfx("select"); }
    if (Engine.justPressed("confirm")) { AudioEngine.sfx("confirm"); this.active = false; return this.selected; }
    if (Engine.justPressed("cancel")) { AudioEngine.sfx("cancel"); this.active = false; return -2; }
    return -1;
  }
  draw(ctx, x, y) {
    if (!this.active) return;
    ctx.fillStyle = "#FFF"; ctx.font = "bold 18px 'Courier New'";
    if (this.title) ctx.fillText(this.title, x, y);
    this.options.forEach((opt, i) => {
      const oy = y + 30 + i * 28;
      if (i === this.selected) drawSoul(ctx, x - 20, oy - 14, 2);
      ctx.fillStyle = i === this.selected ? "#FFFF00" : "#FFF";
      ctx.font = "16px 'Courier New'";
      ctx.fillText(opt, x, oy);
    });
  }
}

/* ========== 玩家状态 ========== */
class Player {
  constructor() {
    const { atk, def, ...base } = PLAYER_DEFAULT;
    Object.assign(this, base);
    this.items = ["blue_meth", "chile_p", "coffee"];
    this.x = 320; this.y = 240;
    this.exp = 0; this.gold = 0;
    this.kills = 0; this.spared = 0;
    this.flags = {};
  }
  get atk() { return PLAYER_DEFAULT.atk + (this.lv - 1) * 2; }
  get def() { return PLAYER_DEFAULT.def + (this.lv - 1); }
  addExp(n) {
    this.exp += n;
    let leveled = false;
    while (this.exp >= this.lv * 20) {
      this.exp -= this.lv * 20;
      this.lv++;
      this.maxhp += 4;
      this.hp = this.maxhp;
      leveled = true;
    }
    return leveled;
  }
  addItem(id) { this.items.push(id); }
  useItem(idx) {
    const item = ITEMS[this.items[idx]];
    if (!item) return null;
    if (item.heal) {
      this.hp = Math.min(this.maxhp, this.hp + item.heal);
      AudioEngine.sfx("heal");
    }
    this.items.splice(idx, 1);
    return item;
  }
  save() {
    const data = { name:this.name,lv:this.lv,hp:this.hp,maxhp:this.maxhp,
      exp:this.exp,gold:this.gold,items:this.items,kills:this.kills,spared:this.spared,flags:this.flags,
      area:this.area||"desert",x:Number.isFinite(this.x)?this.x:320,y:Number.isFinite(this.y)?this.y:240 };
    localStorage.setItem("heisenberg_save", JSON.stringify(data));
  }
  load() {
    const raw = localStorage.getItem("heisenberg_save");
    if (!raw) return false;
    try {
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object") return false;
      delete data.atk;
      delete data.def;
      Object.assign(this, data);
      if (!Array.isArray(this.items)) this.items = [];
      if (!this.flags || typeof this.flags !== "object") this.flags = {};
      if (!this.area) this.area = "desert";
      if (!Number.isFinite(this.x)) this.x = 320;
      if (!Number.isFinite(this.y)) this.y = 240;
      return true;
    } catch(e) { return false; }
  }
}