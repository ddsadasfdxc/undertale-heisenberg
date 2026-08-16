/* 传说之下：毒师宇宙 — 程序化像素精灵 */
/* 所有角色用像素坐标数组定义，运行时渲染 */

const PIX = {
  /* 灵魂（红心）5x5 */
  soul: [
    [0,1,0,1,0],
    [1,1,1,1,1],
    [1,1,1,1,1],
    [0,1,1,1,0],
    [0,0,1,0,0]
  ],
  /* 存档点（星星）7x7 */
  save: [
    [0,0,0,1,0,0,0],
    [0,0,1,1,1,0,0],
    [0,1,1,1,1,1,0],
    [1,1,1,1,1,1,1],
    [0,1,1,1,1,1,0],
    [0,0,1,1,1,0,0],
    [0,0,0,1,0,0,0]
  ],
  /* 小花（花瓣脸）8x8 */
  flower: [
    [0,1,1,0,0,1,1,0],
    [1,0,0,1,1,0,0,1],
    [1,0,1,0,0,1,0,1],
    [1,0,0,0,0,0,0,1],
    [1,0,1,0,0,1,0,1],
    [0,1,0,1,1,0,1,0],
    [0,0,1,0,0,1,0,0],
    [0,0,0,1,1,0,0,0]
  ],
  /* 帽子（海森堡）6x4 */
  hat: [
    [0,0,1,1,0,0],
    [0,1,1,1,1,0],
    [1,1,1,1,1,1],
    [0,0,0,0,0,0]
  ]
};

/* 绘制像素图 */
function drawPix(ctx, data, x, y, size, color) {
  ctx.fillStyle = color;
  for (let r = 0; r < data.length; r++) {
    for (let c = 0; c < data[r].length; c++) {
      if (data[r][c]) ctx.fillRect(x + c * size, y + r * size, size, size);
    }
  }
}

/* 绘制灵魂 */
function drawSoul(ctx, x, y, s) {
  drawPix(ctx, PIX.soul, x, y, s || 3, "#FF0000");
}

/* 绘制存档点 */
function drawSave(ctx, x, y, t) {
  const flash = Math.sin(t * 0.005) * 0.3 + 0.7;
  ctx.globalAlpha = flash;
  drawPix(ctx, PIX.save, x, y, 3, "#FFFF00");
  ctx.globalAlpha = 1;
}

/* 绘制角色精灵（简化像素人形） */
function drawCharacter(ctx, id, x, y, w, h, t) {
  ctx.save();
  const bob = Math.sin(t * 0.003) * 3;
  y += bob;

  switch(id) {
    case "hector_flower":
      /* 轮椅上的花 */
      ctx.fillStyle = "#888";
      ctx.fillRect(x - 12, y + h - 16, 24, 16); /* 轮椅 */
      ctx.fillStyle = "#AAA";
      ctx.fillRect(x - 8, y + h - 12, 16, 12);
      drawPix(ctx, PIX.flower, x - 12, y, 3, "#FFD700");
      /* 眼睛 */
      ctx.fillStyle = "#000";
      ctx.fillRect(x - 5, y + 8, 3, 3);
      ctx.fillRect(x + 3, y + 8, 3, 3);
      break;

    case "gus":
      /* 西装男，戴眼镜 */
      ctx.fillStyle = "#2a2a3a"; /* 西装 */
      ctx.fillRect(x - 14, y + 20, 28, h - 20);
      ctx.fillStyle = "#FFD700"; /* 皮肤 */
      ctx.fillRect(x - 8, y, 16, 20);
      ctx.fillStyle = "#000"; /* 眼镜 */
      ctx.fillRect(x - 6, y + 6, 5, 3);
      ctx.fillRect(x + 2, y + 6, 5, 3);
      ctx.fillRect(x - 1, y + 6, 2, 2);
      /* 领带 */
      ctx.fillStyle = "#8B0000";
      ctx.fillRect(x - 1, y + 22, 3, 10);
      /* 微笑 */
      ctx.fillStyle = "#000";
      ctx.fillRect(x - 3, y + 14, 6, 1);
      break;

    case "saul":
      /* 彩色西装 */
      ctx.fillStyle = "#FF69B4"; /* 粉色西装 */
      ctx.fillRect(x - 14, y + 20, 28, h - 20);
      ctx.fillStyle = "#FFD700";
      ctx.fillRect(x - 8, y, 16, 20);
      /* 花哨领带 */
      ctx.fillStyle = "#00FFFF";
      ctx.fillRect(x - 1, y + 22, 3, 10);
      /* 眼睛 */
      ctx.fillStyle = "#000";
      ctx.fillRect(x - 4, y + 6, 3, 3);
      ctx.fillRect(x + 2, y + 6, 3, 3);
      /* 微笑 */
      ctx.fillRect(x - 3, y + 13, 6, 1);
      break;

    case "jesse":
      /* 连帽衫+帽子 */
      ctx.fillStyle = "#333";
      ctx.fillRect(x - 14, y + 16, 28, h - 16);
      ctx.fillStyle = "#FFD700";
      ctx.fillRect(x - 8, y, 16, 16);
      /* 帽子 */
      ctx.fillStyle = "#222";
      ctx.fillRect(x - 9, y - 2, 18, 6);
      /* 眼睛 */
      ctx.fillStyle = "#000";
      ctx.fillRect(x - 4, y + 5, 3, 3);
      ctx.fillRect(x + 2, y + 5, 3, 3);
      break;

    case "mike":
      /* 老人，光头 */
      ctx.fillStyle = "#4a4a4a";
      ctx.fillRect(x - 14, y + 20, 28, h - 20);
      ctx.fillStyle = "#DDD";
      ctx.fillRect(x - 8, y, 16, 20);
      /* 皱纹 */
      ctx.fillStyle = "#999";
      ctx.fillRect(x - 6, y + 3, 12, 1);
      ctx.fillRect(x - 6, y + 7, 12, 1);
      /* 眼睛 */
      ctx.fillStyle = "#000";
      ctx.fillRect(x - 4, y + 10, 3, 3);
      ctx.fillRect(x + 2, y + 10, 3, 3);
      break;

    case "gale":
      /* 实验服+眼镜 */
      ctx.fillStyle = "#FFF";
      ctx.fillRect(x - 14, y + 20, 28, h - 20);
      ctx.fillStyle = "#FFD700";
      ctx.fillRect(x - 8, y, 16, 20);
      /* 眼镜 */
      ctx.fillStyle = "#000";
      ctx.fillRect(x - 6, y + 6, 5, 4);
      ctx.fillRect(x + 2, y + 6, 5, 4);
      /* 领子 */
      ctx.fillStyle = "#4a6a8a";
      ctx.fillRect(x - 14, y + 20, 28, 4);
      break;

    case "walt":
      /* 海森堡 - 帽子+墨镜+西装 */
      ctx.fillStyle = "#1a1a2a";
      ctx.fillRect(x - 16, y + 22, 32, h - 22);
      ctx.fillStyle = "#FFD700";
      ctx.fillRect(x - 8, y + 4, 16, 18);
      drawPix(ctx, PIX.hat, x - 9, y - 2, 3, "#1a1a1a");
      /* 墨镜 */
      ctx.fillStyle = "#000";
      ctx.fillRect(x - 6, y + 8, 5, 3);
      ctx.fillRect(x + 2, y + 8, 5, 3);
      ctx.fillRect(x - 1, y + 8, 2, 2);
      /* 胡子 */
      ctx.fillRect(x - 3, y + 15, 6, 2);
      break;

    default:
      ctx.fillStyle = "#F0F";
      ctx.fillRect(x - 10, y, 20, h);
  }
  ctx.restore();
}

/* 绘制背景装饰 */
function drawBgDecor(ctx, area, w, h, t) {
  switch(area) {
    case "desert":
      ctx.fillStyle = "#1a0a00";
      ctx.fillRect(0, 0, w, h);
      /* 地面 */
      ctx.fillStyle = "#3a2a1a";
      ctx.fillRect(0, h * 0.6, w, h * 0.4);
      /* 仙人掌 */
      ctx.fillStyle = "#1a3a1a";
      for (let i = 0; i < 5; i++) {
        const cx = (i * 150 + 50) % w;
        ctx.fillRect(cx, h * 0.5, 8, 30);
        ctx.fillRect(cx - 5, h * 0.52, 5, 15);
        ctx.fillRect(cx + 8, h * 0.52, 5, 15);
      }
      break;
    case "pollos":
      ctx.fillStyle = "#2a1a0a";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#FFD700";
      ctx.fillRect(0, 0, w, 4); /* 金色边 */
      ctx.fillRect(0, h - 4, w, 4);
      /* 桌子 */
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(80 + i * 200, h * 0.5, 80, 10);
        ctx.fillRect(80 + i * 200, h * 0.5, 5, 40);
        ctx.fillRect(155 + i * 200, h * 0.5, 5, 40);
      }
      break;
    case "lab":
      ctx.fillStyle = "#0a1a2a";
      ctx.fillRect(0, 0, w, h);
      /* 设备 */
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = "#2a3a4a";
        ctx.fillRect(40 + i * 160, h * 0.3, 100, h * 0.4);
        ctx.fillStyle = "#00FFFF";
        ctx.fillRect(50 + i * 160, h * 0.35, 80, 20);
      }
      /* 蓝色液体 */
      ctx.fillStyle = "#0066FF";
      ctx.fillRect(0, h * 0.75, w, h * 0.25);
      break;
    case "throne":
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, w, h);
      /* 王座 */
      ctx.fillStyle = "#FFD700";
      ctx.fillRect(w / 2 - 30, h * 0.2, 60, 80);
      ctx.fillStyle = "#8B0000";
      ctx.fillRect(w / 2 - 20, h * 0.25, 40, 60);
      /* 地毯 */
      ctx.fillStyle = "#4a0000";
      ctx.fillRect(w / 2 - 40, h * 0.6, 80, h * 0.4);
      break;
  }
}