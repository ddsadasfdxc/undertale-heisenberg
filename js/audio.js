/* 传说之下：毒师宇宙 — 8-bit 音频引擎 */
const AudioEngine = {
  ctx: null, currentTrack: null, gainNode: null,
  initialized: false,

  init() {
    if (this.ctx) return true;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return false;
      this.ctx = new AudioContextClass();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 0.3;
      this.gainNode.connect(this.ctx.destination);
      this.initialized = true;
      return true;
    } catch(e) {
      console.warn("Audio not available", e);
      return false;
    }
  },

  unlock() {
    if (!this.init()) return;
    if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
  },

  /* 播放音符 */
  playNote(freq, dur, type, vol) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type || "square";
    osc.frequency.value = freq;
    g.gain.setValueAtTime(vol || 0.15, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    osc.connect(g); g.connect(this.gainNode);
    osc.start(); osc.stop(this.ctx.currentTime + dur);
  },

  /* 音效 */
  sfx(name) {
    if (!this.init()) return;
    switch(name) {
      case "select":
        this.playNote(880, 0.1, "square", 0.1);
        break;
      case "confirm":
        this.playNote(660, 0.08, "square", 0.12);
        setTimeout(() => this.playNote(880, 0.12, "square", 0.12), 60);
        break;
      case "cancel":
        this.playNote(440, 0.08, "square", 0.1);
        setTimeout(() => this.playNote(330, 0.12, "square", 0.1), 60);
        break;
      case "hit":
        this.playNote(150, 0.15, "sawtooth", 0.2);
        break;
      case "heal":
        this.playNote(523, 0.1, "sine", 0.1);
        setTimeout(() => this.playNote(659, 0.1, "sine", 0.1), 80);
        setTimeout(() => this.playNote(784, 0.15, "sine", 0.1), 160);
        break;
      case "ding":
        /* 叮叮花铃铛 */
        for (let i = 0; i < 5; i++) {
          setTimeout(() => this.playNote(1200 + Math.random() * 400, 0.08, "sine", 0.08), i * 50);
        }
        break;
      case "save":
        [523, 587, 659, 784].forEach((f, i) => {
          setTimeout(() => this.playNote(f, 0.2, "sine", 0.1), i * 120);
        });
        break;
      case "damage":
        this.playNote(200, 0.2, "sawtooth", 0.25);
        setTimeout(() => this.playNote(150, 0.2, "sawtooth", 0.2), 80);
        break;
      case "bell":
        this.playNote(1568, 0.3, "sine", 0.15);
        break;
      case "explosion":
        for (let i = 0; i < 8; i++) {
          setTimeout(() => this.playNote(80 + Math.random() * 60, 0.3, "sawtooth", 0.2), i * 30);
        }
        break;
    }
  },

  /* 简易BGM序列器 */
  playBGM(name) {
    this.stopBGM();
    if (!this.init()) return;

    const tracks = {
      title: { notes: [262,330,392,523,392,330], bpm: 100, type: "square" },
      desert: { notes: [220,262,330,220,196,220], bpm: 80, type: "triangle" },
      pollos: { notes: [330,392,440,392,330,262], bpm: 110, type: "square" },
      lab: { notes: [440,523,659,523,440,330], bpm: 120, type: "sawtooth" },
      throne: { notes: [110,131,165,131,110,98], bpm: 60, type: "triangle" },
      battle: { notes: [330,415,330,294,330,415,494,415], bpm: 140, type: "square" },
      boss: { notes: [110,165,110,98,110,165,196,165], bpm: 160, type: "sawtooth" }
    };

    const track = tracks[name];
    if (!track) return;

    const interval = 60000 / track.bpm;
    let idx = 0;
    this.currentTrack = setInterval(() => {
      this.playNote(track.notes[idx % track.notes.length], interval / 1000 * 0.8, track.type, 0.06);
      /* 低音 */
      if (idx % 2 === 0) {
        this.playNote(track.notes[idx % track.notes.length] / 4, interval / 1000 * 0.6, "triangle", 0.04);
      }
      idx++;
    }, interval);
  },

  stopBGM() {
    if (this.currentTrack) {
      clearInterval(this.currentTrack);
      this.currentTrack = null;
    }
  }
};