/* 传说之下：毒师宇宙 — 数据文件 Part1: 基础数据 */
const GAME_TITLE = "传说之下：毒师宇宙";
const GAME_VERSION = "v1.0 测试版";

const PLAYER_DEFAULT = {
  name: "小粉", lv: 1, hp: 20, maxhp: 20,
  atk: 10, def: 10, exp: 0, gold: 0
};

const ITEMS = {
  blue_meth:  { name: "蓝色结晶糖", desc: "纯度99.1%的... 水果硬糖。恢复11HP。", heal: 11 },
  chile_p:    { name: "辣味玉米片", desc: "Los Pollos 风味玉米片。恢复8HP。", heal: 8 },
  coffee:     { name: "手冲咖啡",   desc: "Gale 的虹吸壶配方。恢复14HP。", heal: 14 },
  pizza:      { name: "屋顶披萨",   desc: "不知道为什么会出现在屋顶上。恢复20HP。", heal: 20 },
  saul_card:  { name: "律师名片",   desc: "「有事就打给我！」恢复全部HP。", heal: 999 },
  stevia:     { name: "甜菊糖",     desc: "一种无害的天然甜味剂... 大概吧。恢复4HP。", heal: 4 },
  money_stack:{ name: "一叠现金",   desc: "像卷筒纸一样取用。恢复6HP。", heal: 6 },
  mre:        { name: "荒漠军粮",   desc: "沙地储备粮。恢复10HP。", heal: 10 }
};

/* 存档点描述（决心语录彩蛋） */
const SAVE_POINTS = {
  entrance: "荒漠的风沙吹过。你充满了决心。",
  pollos:   "炸鸡店的柠檬香气。你充满了决心。",
  lab:      "烧瓶里的蓝色液体微微发光。你充满了决心。",
  throne:   "王座前的寂静。你充满了决心。"
};

/* ========== 角色数据 ========== */
const CHARACTERS = {
  hector: {
    id: "hector", cn_name: "叮叮花", sprite: "hector_flower",
    intro: [
      "叮铃铃——！",
      "你好呀！我是叮叮花！一朵轮椅上的花！",
      "你一定刚来「边境」吧？",
      "看到那颗红心了没？那就是你的「灵魂」！",
      "在边境，Love 是通过白色的「友谊铃铛」传播的。",
      "动起来！能接多少接多少！"
    ],
    reveal: [
      "叮叮叮叮叮叮叮——！！！",
      "你这个白痴。",
      "在边境，不是杀人就是被杀！",
      "去死吧！！"
    ]
  },

  gus: {
    id: "gus", cn_name: "古斯塔沃", sprite: "gus",
    intro: [
      "（一阵柠檬香味飘来）",
      "可怜的孩子... 竟然在荒漠里迷路了。",
      "我是古斯塔沃，「洛斯波约斯」的店长。",
      "这里很危险。让我带你回家吧。"
    ],
    battle_check: "古斯塔沃 攻击8 防御8\n他的微笑滴水不漏。",
    battle_acts: ["交谈", "闻炸鸡", "拒绝礼貌"],
    battle_flavor: [
      "古斯塔沃整理了一下领带。",
      "空气里弥漫着柠檬消毒水的味道。",
      "古斯塔沃微笑着，但眼神毫无温度。",
      "古斯塔沃说：「看着我。」"
    ],
    spare_text: "古斯塔沃轻轻叹了口气。\n「好吧... 你已经证明了自己。走吧。」",
    kill_text: "古斯塔沃的脸上还挂着微笑。\n「我们还会见面的...」",
    spare_gold: 15, kill_exp: 25, battle_hp: 75,
    attacks: ["fried_rain", "box_cutter", "pollos_orbit"]
  },

  saul: {
    id: "saul", cn_name: "索尔", sprite: "saul",
    battle_check: "索尔 攻击1 防御1\n最简单的敌人。只能造成1点伤害。\n但他的领带很亮。",
    battle_acts: ["交谈", "聘请", "讲冷笑话"],
    battle_flavor: [
      "索尔在翻他的名片夹。",
      "索尔的领带在黑暗中依然发光。",
      "索尔说：「我不打没有把握的官司。」"
    ],
    puns: [
      "索尔：你知道律师和毒贩的区别吗？\n  毒贩的委托人真的会坐牢！",
      "索尔：我刚打了个官司，赢了！\n  对手是空气，因为没人敢来。"
    ],
    spare_text: "索尔竖起大拇指。\n「我就知道你是个聪明人！」",
    kill_text: "索尔的笑容消失了。\n「我会让律师联系你的律师...」",
    spare_gold: 50, kill_exp: 5, battle_hp: 50,
    attacks: ["card_rain", "inflatable"]
  },

  jesse: {
    id: "jesse", cn_name: "杰西", sprite: "jesse",
    battle_check: "杰西 攻击6 防御4\n喜欢说「Yo」和「Bitch」。",
    battle_acts: ["交谈", "称赞", "聊化学"],
    battle_flavor: [
      "杰西在说「Yo, bitch!」",
      "杰西偷偷看了一眼手机，等某人的电话。",
      "杰西自言自语：「沃特先生会看到我的价值的...」"
    ],
    praise_response: ["杰西脸红了：「你... 你真这么觉得？！」", "杰西的攻击力下降了！"],
    science_response: ["杰西的眼睛亮了：「Yo！你也懂化学？！」", "杰西忘记了战斗！"],
    spare_text: "杰西挠了挠头。\n「好吧... 也许你不坏。我们可以做个朋友？」",
    kill_text: "杰西倒下了。\n「沃特先生... 我做到了吗...」",
    spare_gold: 20, kill_exp: 40, battle_hp: 65,
    attacks: ["blue_bounce", "capn_cook"]
  },

  mike: {
    id: "mike", cn_name: "麦克", sprite: "mike",
    battle_check: "麦克 攻击10 防御8\n前警察。从不做半吊子的事。",
    battle_acts: ["交谈", "表示尊重", "威胁"],
    battle_flavor: [
      "麦克面无表情。",
      "麦克说：「我不会做半吊子的事。」",
      "麦克想起了他的孙女。"
    ],
    respect_response: ["麦克微微点了点头。", "「至少你懂规矩。」"],
    threat_response: ["你试图威胁麦克。", "麦克面无表情地看着你。", "「你最好别做半吊子的事。」"],
    spare_text: "麦克收起了枪。\n「走吧。别让我再看到你。」",
    kill_text: "麦克闭上了眼睛。\n「Kaylee... 爷爷爱你...」",
    spare_gold: 40, kill_exp: 80, battle_hp: 85,
    attacks: ["sniper_dot", "ricochet"]
  },

  gale: {
    id: "gale", cn_name: "盖尔", sprite: "gale",
    battle_check: "盖尔 攻击5 防御5\n纯粹的理想主义者。",
    battle_acts: ["交谈", "要咖啡", "唱歌"],
    battle_flavor: [
      "盖尔在哼《Major Tom》。",
      "实验室里飘着咖啡香。",
      "盖尔说：「你知道什么是纯粹吗？」"
    ],
    coffee_response: ["盖尔给你冲了一杯咖啡。", "你喝了。味道... 复杂。"],
    sing_response: ["你和盖尔合唱了《Major Tom》。", "盖尔忘记了战斗，沉浸在音乐中。"],
    spare_text: "盖尔擦了擦眼泪。\n「这是我经历过的最美好的战斗！」",
    kill_text: "盖尔的眼镜碎了。\n「我的咖啡... 还没冲完...」",
    spare_gold: 30, kill_exp: 50, battle_hp: 65,
    attacks: ["coffee_splash", "siphon_beam"]
  },

  walt: {
    id: "walt", cn_name: "海森堡", sprite: "walt",
    pre_battle: [
      "你走到了王座前。",
      "一个戴着帽子的男人坐在阴影中。",
      "我是海森堡。这个帝国的王。",
      "我做这一切... 是因为我擅长。",
      "现在——说出我的名字。"
    ],
    battle_check: "海森堡 攻击15 防御12\n他是那个敲门的人。",
    battle_acts: ["交谈", "说出名字", "跪下"],
    battle_flavor: [
      "海森堡扶正了帽子。",
      "海森堡说：「尊重化学。」",
      "你感到一阵咳嗽的冲动。",
      "海森堡的目光像X光一样穿透你。"
    ],
    name_response: ["你低声说：「海森堡。」", "海森堡的嘴角抽动了一下。", "「你说对了。」"],
    kneel_response: ["你跪下了。", "海森堡沉默了很久。", "「起来吧。你不该跪任何人。」"],
    spare_text: "海森堡摘下了帽子。\n「...你赢了。走吧。」",
    kill_text: "海森堡倒下了。帽子滚落到一边。\n「我记得... 我曾是个老师...」",
    spare_gold: 100, kill_exp: 200, battle_hp: 90,
    attacks: ["blue_storm", "hat_boomerang", "empire_crush"]
  }
};
