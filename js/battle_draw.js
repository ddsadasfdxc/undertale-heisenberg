/* 战斗绘制模块 */
const BattleDraw = {
  draw(b, ctx) {
    ctx.fillStyle="#000"; ctx.fillRect(0,0,640,480);
    /* 敌人精灵 */
    if(b.phase!=="kill"||(b.kTimer||0)<60)
      drawCharacter(ctx,b.char.sprite,320,40,40,80,Engine.frame);
    /* 名字 */
    ctx.fillStyle="#FFF"; ctx.font="bold 18px 'Courier New'"; ctx.textAlign="center";
    ctx.fillText(b.char.cn_name,320,140); ctx.textAlign="left";

    /* 敌方攻击阶段：战斗框+灵魂+弹幕 */
    if(b.phase==="enemy"){
      ctx.strokeStyle="#FFF"; ctx.lineWidth=2;
      ctx.strokeRect(b.box.x,b.box.y,b.box.w,b.box.h);
      if(b.inv%4<2) drawSoul(ctx,b.soulX-8,b.soulY-8,3);
      for(const bl of b.bullets){
        ctx.fillStyle=bl.color;
        ctx.beginPath(); ctx.arc(bl.x,bl.y,bl.r,0,Math.PI*2); ctx.fill();
      }
    }

    /* 攻击条 */
    if(b.phase==="attack"&&b.atkBar.active){
      ctx.strokeStyle="#FFF"; ctx.lineWidth=2;
      ctx.strokeRect(220,250,200,30);
      ctx.fillStyle="#0F0"; ctx.fillRect(220,250,b.atkBar.pos,30);
      ctx.fillStyle="#F00"; ctx.fillRect(318,248,4,34);
    }

    /* 效果文本 */
    if(b.fxT>0){
      ctx.fillStyle="#FF0"; ctx.font="bold 20px 'Courier New'"; ctx.textAlign="center";
      ctx.fillText(b.fx,320,300); ctx.textAlign="left";
    }

    /* 底部菜单 */
    if(b.phase==="menu"||b.phase==="act"||b.phase==="item") this.menu(b,ctx);

    /* HP条 */
    this.hpBar(b,ctx);
    b.dialog.draw(ctx);
  },

  menu(b,ctx) {
    const y=340;
    const colors=["#FF8C00","#0FF","#0F0","#FF69B4"];
    for(let i=0;i<4;i++){
      const x=60+i*140;
      const sel=b.phase==="menu"&&i===b.menuSel;
      ctx.strokeStyle=sel?"#FFF":colors[i]; ctx.lineWidth=sel?3:2;
      ctx.strokeRect(x,y,120,40);
      ctx.fillStyle=sel?"#FFF":colors[i];
      ctx.font="bold 16px 'Courier New'"; ctx.textAlign="center";
      ctx.fillText(b.menuOptions[i],x+60,y+26);
      ctx.textAlign="left";
    }
    /* 行动子菜单 */
    if(b.phase==="act"){
      const acts=b.char.battle_acts;
      ctx.fillStyle="#FFF"; ctx.font="16px 'Courier New'";
      ctx.fillText("选择行动：",60,410);
      acts.forEach((act,i)=>{
        const ax=60+(i%3)*180, ay=435+Math.floor(i/3)*28;
        if(i===b.actSel) drawSoul(ctx,ax-18,ay-12,2);
        ctx.fillStyle=i===b.actSel?"#FF0":"#FFF";
        ctx.fillText(act,ax,ay);
      });
    }
    /* 物品子菜单 */
    if(b.phase==="item"){
      ctx.fillStyle="#FFF"; ctx.font="16px 'Courier New'";
      ctx.fillText("选择物品：",60,410);
      b.player.items.forEach((id,i)=>{
        const item=ITEMS[id];
        const ax=60+(i%2)*280, ay=435+Math.floor(i/2)*28;
        if(i===b.itemSel) drawSoul(ctx,ax-18,ay-12,2);
        ctx.fillStyle=i===b.itemSel?"#FF0":"#FFF";
        ctx.fillText(item.name,ax,ay);
      });
    }
  },

  hpBar(b,ctx) {
    /* 玩家HP */
    const x=20,y=310,w=120,h=16;
    ctx.fillStyle="#FFF"; ctx.font="14px 'Courier New'";
    ctx.fillText(`${b.player.name}`,x,y-5);
    ctx.fillText(`LV ${b.player.lv}`,x,y+32);
    /* HP底 */
    ctx.fillStyle="#400"; ctx.fillRect(x+50,y,w,h);
    /* HP量 */
    const ratio=b.player.hp/b.player.maxhp;
    ctx.fillStyle=ratio>0.3?"#FF0":"#F00";
    ctx.fillRect(x+50,y,w*ratio,h);
    /* HP数字 */
    ctx.fillStyle="#FFF"; ctx.font="12px 'Courier New'";
    ctx.fillText(`${b.player.hp} / ${b.player.maxhp}`,x+50+w+8,y+13);
    /* 敌人HP（非战斗阶段） */
    if(b.phase==="menu"||b.phase==="act"){
      ctx.fillStyle="#400"; ctx.fillRect(250,150,140,10);
      const er=Math.max(0,b.enemyHp/b.enemyMaxHp);
      ctx.fillStyle="#F00"; ctx.fillRect(250,150,140*er,10);
    }
  }
};