/* 战斗系统 - 逻辑 */
class Battle {
  constructor(charId, player, onEnd) {
    this.char = CHARACTERS[charId];
    this.player = player;
    this.onEnd = onEnd;
    this.phase = "menu";
    this.menuOptions = ["战斗","行动","物品","仁慈"];
    this.menuSel=0; this.actSel=0; this.itemSel=0;
    this.dialog = new DialogBox();
    this.dialog.show([this.char.battle_check]);
    this.enemyHp=this.char.battle_hp||100; this.enemyMaxHp=this.enemyHp;
    this.atkBar = {active:false,pos:0,speed:8,hit:false,dmg:0};
    this.bullets=[];
    this.soulX=320; this.soulY=240; this.soulSpeed=4;
    this.box = {x:220,y:160,w:200,h:160};
    this.atkTimer=0; this.atkDur=300;
    this.curAtk=0; this.inv=0;
    this.fx=""; this.fxT=0;
    this.flavorIdx=0; this.actCount=0;
    this.finished=false;
    this.attackCount=0; /* 攻击次数（天赋结算用） */
    AudioEngine.playBGM("battle");
  }

  update() {
    this.dialog.update();
    if (this.dialog.active) return;
    switch(this.phase) {
      case "menu": this.uMenu(); break;
      case "act": this.uAct(); break;
      case "item": this.uItem(); break;
      case "attack": this.uAtk(); break;
      case "enemy": this.uEnemy(); break;
      case "spare": this.uSpare(); break;
      case "kill": this.uKill(); break;
    }
    if (this.fxT>0) this.fxT--;
    if (this.inv>0) this.inv--;
  }

  uMenu() {
    if (Engine.justPressed("left")) {this.menuSel=(this.menuSel+3)%4;AudioEngine.sfx("select");}
    if (Engine.justPressed("right")) {this.menuSel=(this.menuSel+1)%4;AudioEngine.sfx("select");}
    if (Engine.justPressed("confirm")) {
      AudioEngine.sfx("confirm");
      switch(this.menuSel) {
        case 0: this.phase="attack";
          this.atkBar={active:true,pos:0,speed:6+Math.random()*4,hit:false};
          break;
        case 1: this.phase="act"; this.actSel=0; break;
        case 2:
          if(!this.player.items.length){this.dialog.show(["没有物品了！"]);return;}
          this.phase="item"; this.itemSel=0; break;
        case 3: this.trySpare(); break;
      }
    }
  }

  uAct() {
    const acts=this.char.battle_acts;
    if (Engine.justPressed("up")) {this.actSel=(this.actSel+acts.length-1)%acts.length;AudioEngine.sfx("select");}
    if (Engine.justPressed("down")) {this.actSel=(this.actSel+1)%acts.length;AudioEngine.sfx("select");}
    if (Engine.justPressed("cancel")) {this.phase="menu";return;}
    if (Engine.justPressed("confirm")) {AudioEngine.sfx("confirm");this.doAct(acts[this.actSel]);}
  }

  uItem() {
    const items=this.player.items;
    if (Engine.justPressed("up")) {this.itemSel=(this.itemSel+items.length-1)%items.length;AudioEngine.sfx("select");}
    if (Engine.justPressed("down")) {this.itemSel=(this.itemSel+1)%items.length;AudioEngine.sfx("select");}
    if (Engine.justPressed("cancel")) {this.phase="menu";return;}
    if (Engine.justPressed("confirm")) {
      const item=this.player.useItem(this.itemSel);
      if(item){
        this.fx=`使用了 ${item.name}！`; this.fxT=120;
        AudioEngine.sfx("heal"); this.phase="menu"; this.startEnemy();
      }
    }
  }

  doAct(name) {
    this.actCount++;
    let r=[];
    if(name==="交谈"){
      r=["你试图和"+this.char.cn_name+"交谈。",
        this.char.battle_flavor[this.flavorIdx%this.char.battle_flavor.length]];
      this.flavorIdx++;
    } else if(name==="称赞"||name==="表示尊重"){
      r=this.char.praise_response||this.char.respect_response||[this.char.cn_name+"不为所动。"];
      this.enemyHp-=5;
    } else if(name==="聊化学"||name==="唱歌"||name==="要咖啡"){
      const k=name==="聊化学"?"science_response":name==="唱歌"?"sing_response":"coffee_response";
      r=this.char[k]||[this.char.cn_name+"看起来很高兴。"];
      this.enemyHp-=10;
    } else if(name==="说出名字"){
      r=this.char.name_response||["..."]; this.enemyHp-=20;
    } else if(name==="跪下"){
      r=this.char.kneel_response||["..."]; this.enemyHp-=15;
    } else if(name==="讲冷笑话"){
      r=this.char.puns?[this.char.puns[Math.floor(Math.random()*this.char.puns.length)]]:["..."];
      this.enemyHp-=3;
    } else if(name==="聘请"){
      if(this.player.gold<50){
        r=["你试图聘请索尔，但拿不出50G。","索尔：「免费咨询已经结束了，朋友。」"];
        this.actCount=Math.max(0,this.actCount-1);
      } else {
        r=["你给了索尔50G。","索尔：「成交！我现在是你的律师了！」"];
        this.player.gold-=50; this.enemyHp-=30;
      }
    } else if(name==="威胁"){
      r=this.char.threat_response||["你试图威胁"+this.char.cn_name+"。",this.char.cn_name+"不为所动。"];
    } else if(name==="闻炸鸡"){
      r=["你深吸一口气...","是炸鸡味。你饿了。"];
      this.player.hp=Math.min(this.player.maxhp,this.player.hp+2);
    } else if(name==="拒绝礼貌"){
      r=["你拒绝了古斯塔沃的礼貌。","古斯塔沃的微笑僵硬了一秒。"]; this.enemyHp-=5;
    } else r=["什么都没发生。"];

    this.dialog.show(r,()=>{
      if(this.enemyHp<=0){this.enemyHp=0;this.phase="spare";this.spTimer=0;}
      else this.startEnemy();
    });
  }

  trySpare() {
    if(this.enemyHp<=this.enemyMaxHp*0.3||this.actCount>=3){
      this.phase="spare"; this.spTimer=0;
    } else this.dialog.show([this.char.cn_name+"还没有被说服。"],()=>this.startEnemy());
  }

  uAtk() {
    if(!this.atkBar.active) return;
    if(!this.atkBar.hit){
      this.atkBar.pos+=this.atkBar.speed;
      if(this.atkBar.pos>=200){this.atkBar.pos=200;this.atkBar.speed*=-1;}
      if(this.atkBar.pos<=0){this.atkBar.pos=0;this.atkBar.speed*=-1;}
      if(Engine.justPressed("confirm")){
        this.atkBar.hit=true;
        const acc=1-Math.abs(this.atkBar.pos-100)/100;
        this.attackCount++;
        let dmg=Math.floor(this.player.atk*acc*(0.5+Math.random()*0.5));
        const perk=this.player.perk;
        this.perkText="";
        if(perk==="rising"){
          const bonus=this.attackCount-1; /* 第1击+0，后面每击+1 */
          dmg+=bonus;
        } else if(perk==="hasted"){
          if(this.attackCount%2===0){ dmg*=2; this.perkText="蓄势待发 ×2！"; }
        } else if(perk==="laststand"){
          const ratio=1-this.player.hp/this.player.maxhp; /* 0~1 */
          const bonus=Math.floor(dmg*2*ratio);
          dmg+=bonus;
          if(bonus>0) this.perkText=`背水一战 +${bonus}！`;
        }
        dmg=Math.max(1,dmg);
        this.atkBar.dmg=dmg;
        this.enemyHp-=dmg;
        this.fx=`造成 ${dmg} 点伤害！`; this.fxT=90;
        AudioEngine.sfx("hit");
        if(this.enemyHp<=0){this.enemyHp=0;this.phase="kill";this.kTimer=0;return;}
        setTimeout(()=>this.startEnemy(),500);
        this.phase="menu"; this.atkBar.active=false;
      }
    }
  }

  startEnemy() {
    this.phase="enemy";
    this.atkTimer=0; this.bullets=[];
    this.soulX=320; this.soulY=240;
    this.curAtk=this.char.attacks[Math.floor(Math.random()*this.char.attacks.length)];
    AudioEngine.playBGM("boss");
  }

  uEnemy() {
    this.atkTimer++;
    if(Engine.keys["up"])this.soulY-=this.soulSpeed;
    if(Engine.keys["down"])this.soulY+=this.soulSpeed;
    if(Engine.keys["left"])this.soulX-=this.soulSpeed;
    if(Engine.keys["right"])this.soulX+=this.soulSpeed;
    this.soulX=Math.max(this.box.x,Math.min(this.box.x+this.box.w,this.soulX));
    this.soulY=Math.max(this.box.y,Math.min(this.box.y+this.box.h,this.soulY));

    if(this.atkTimer%15===0)this.spawnBullet();

    for(let i=this.bullets.length-1;i>=0;i--){
      const b=this.bullets[i];
      b.x+=b.vx; b.y+=b.vy; b.life--;
      if(this.inv<=0&&Math.abs(b.x-this.soulX)<12&&Math.abs(b.y-this.soulY)<12){
        const dmg=Math.max(1,Math.floor((this.char.kill_exp||10)/10)-Math.floor(this.player.def/5));
        this.player.hp-=dmg; this.inv=30; AudioEngine.sfx("damage");
        this.bullets.splice(i,1);
        if(this.player.hp<=0){this.player.hp=0;this.finish("gameover");return;}
        continue;
      }
      if(b.life<=0||b.x<-20||b.x>660||b.y<-20||b.y>500)this.bullets.splice(i,1);
    }

    if(this.atkTimer>=this.atkDur){this.phase="menu";AudioEngine.playBGM("battle");}
  }

  spawnBullet() {
    const mode=this.curAtk;
    const bx=this.box.x, by=this.box.y, cw=this.box.w, ch=this.box.h;
    const push=b=>this.bullets.push(b);

    switch(mode){
      /* 古斯塔沃：炸鸡雨 + 餐盒轨道 + 微笑之光 */
      case"fried_rain":
        push({x:bx+Math.random()*cw, y:by, vx:(Math.random()-.5)*2, vy:2+Math.random()*2, r:6, color:"#FFD700", life:200});
        break;
      case"pollos_orbit": {
        const cx=bx+cw/2, cy=by+ch/2;
        const ang=this.atkTimer*0.05;
        for(let k=0;k<3;k++){
          const a=ang+k*Math.PI*2/3;
          push({x:cx+Math.cos(a)*50, y:cy+Math.sin(a)*50, vx:Math.cos(a+Math.PI/2)*0.8, vy:Math.sin(a+Math.PI/2)*0.8, r:6, color:"#FFA500", life:140});
        }
        break;
      }
      case"box_cutter": {
        const side=this.atkTimer%120<60?0:1;
        if(side===0) push({x:bx-10, y:by+10+((this.atkTimer*7)%(ch-20)), vx:4.5, vy:0, r:5, color:"#AAA", life:160});
        else push({x:bx+cw+10, y:by+10+((this.atkTimer*7)%(ch-20)), vx:-4.5, vy:0, r:5, color:"#AAA", life:160});
        break;
      }

      /* 索尔：名片雨 + 充气人 */
      case"card_rain":
        push({x:bx+Math.random()*cw, y:by, vx:(Math.random()-.5)*1.8, vy:1.6+Math.random()*1.4, r:5, color:"#FFF", life:200});
        break;
      case"inflatable":
        push({x:bx+Math.random()*cw, y:by, vx:(Math.random()-.5)*0.7, vy:1.2, r:9, color:"#FF69B4", life:220});
        break;

      /* 杰西：蓝色弹跳 + 蓝色盐粒 */
      case"blue_bounce": {
        const y0=by+((this.atkTimer*11)%(ch-30));
        push({x:bx+Math.random()*cw, y:y0, vx:(Math.random()-.5)*3, vy:1.6, r:9, color:"#0066FF", life:200});
        break;
      }
      case"capn_cook": {
        const n=6, cx=bx+cw/2, cy=by+ch/2;
        for(let k=0;k<n;k++){
          const a=(k/n)*Math.PI*2+this.atkTimer*0.03;
          push({x:cx+Math.cos(a)*24, y:cy+Math.sin(a)*24, vx:Math.cos(a)*1.7, vy:Math.sin(a)*1.7, r:4, color:"#00BFFF", life:140});
        }
        break;
      }

      /* 麦克：狙击锁定 + 反弹弹 */
      case"sniper_dot": {
        const dx=this.soulX-(bx+cw/2), dy=this.soulY-(by+ch/2), d=Math.sqrt(dx*dx+dy*dy)||1;
        push({x:bx+cw/2,y:by+ch/2,vx:dx/d*3.2,vy:dy/d*3.2,r:4,color:"#F44",life:150});
        break;
      }
      case"ricochet": {
        if(this.atkTimer%100===0){
          push({x:bx+8,y:by+8,vx:2.6,vy:1.6,r:7,color:"#888",life:400,ricochet:true});
        }
        break;
      }

      /* 盖尔：咖啡泼溅 + 吸管光束 */
      case"coffee_splash":
        for(let k=0;k<2;k++)
          push({x:bx+Math.random()*cw, y:by+Math.random()*ch*0.3, vx:(Math.random()-.5)*2.6, vy:1.6+Math.random()*1.8, r:5, color:"#8B5A2B", life:150});
        break;
      case"siphon_beam": {
        const y0=by+((this.atkTimer*15)%(ch-20));
        push({x:bx,y:y0,vx:3,vy:0,r:3,color:"#FF69B4",life:140});
        break;
      }

      /* 海森堡：放射风暴 + 回旋帽 + 帝国崩落 */
      case"blue_storm": {
        const cx=this.soulX, cy=this.soulY;
        for(let k=0;k<3;k++){
          const a=Math.random()*Math.PI*2;
          push({x:cx+Math.cos(a)*18,y:cy+Math.sin(a)*18,vx:Math.cos(a)*2.4,vy:Math.sin(a)*2.4,r:6,color:"#0CF",life:160});
        }
        break;
      }
      case"hat_boomerang": {
        if(this.atkTimer%45===0){
          push({x:bx+cw/2,y:by+ch/2,vx:4,vy:0,r:7,color:"#111",life:180,boomerang:true});
        }
        break;
      }
      case"empire_crush": {
        const arr=[-1,0,1];
        arr.forEach(off=>{
          push({x:bx+cw/2+off*30, y:by-6, vx:off*0.4, vy:2.6, r:8, color:"#8B0000", life:180});
        });
        break;
      }

      default:
        push({x:bx+Math.random()*cw, y:by, vx:(Math.random()-.5)*2, vy:2, r:6, color:"#FFF", life:200});
    }

    /* 弹幕通用行为：反射与回旋 */
    if(this.atkTimer%3===0){
      for(const b of this.bullets){
        if(b.ricochet){
          if(b.x<this.box.x){b.x=this.box.x;b.vx*=-1;}
          if(b.x>this.box.x+this.box.w){b.x=this.box.x+this.box.w;b.vx*=-1;}
          if(b.y<this.box.y){b.y=this.box.y;b.vy*=-1;}
          if(b.y>this.box.y+this.box.h){b.y=this.box.y+this.box.h;b.vy*=-1;}
        }
        if(b.boomerang){
          const cx=this.box.x+this.box.w/2, cy=this.box.y+this.box.h/2;
          const dx=cx-b.x, dy=cy-b.y, d=Math.sqrt(dx*dx+dy*dy)||1;
          const pull=0.5;
          b.x+=dx/d*pull; b.y+=dy/d*pull;
        }
      }
    }
  }

  finish(result, leveled=false) {
    if (this.finished) return;
    this.finished = true;
    this.phase = "done";
    this.bullets = [];
    this.atkBar.active = false;
    this.onEnd(result, leveled);
  }

  uSpare() {
    this.spTimer=(this.spTimer||0)+1;
    if(this.spTimer>120){
      this.player.spared++;
      this.player.gold+=this.char.spare_gold||10;
      this.finish("spare");
    }
  }

  uKill() {
    this.kTimer=(this.kTimer||0)+1;
    if(this.kTimer>90){
      this.player.kills++;
      const lv=this.player.addExp(this.char.kill_exp||10);
      this.player.gold+=this.char.spare_gold||10;
      this.unlockAchievement();
      this.finish("kill",lv);
    }
  }

  unlockAchievement() {
    if(!ACHIEVEMENTS[this.char.id]) return;
    const key="heisenberg_achievements";
    let list=[];
    try{ list=JSON.parse(localStorage.getItem(key)||"[]"); }catch(e){ list=[]; }
    if(!Array.isArray(list)) list=[];
    if(!list.includes(this.char.id)){
      list.push(this.char.id);
      try{ localStorage.setItem(key, JSON.stringify(list)); }catch(e){}
      AudioEngine.sfx("ding");
      this.fx=`成就解锁：${ACHIEVEMENTS[this.char.id].name}！`; this.fxT=180;
    }
  }

  draw(ctx){BattleDraw.draw(this,ctx);}
}