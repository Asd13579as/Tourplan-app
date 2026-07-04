import {
  PlanItem,
  PlanProposal,
  TravelPlan,
  TripRequest,
  Weather,
} from "./types";

/**
 * 本番実装では、この関数の内部を下記のような fetch に置き換えるだけで
 * フロント側のUI・状態管理はそのまま流用できるように設計している。
 *
 * export async function generatePlans(req: TripRequest): Promise<PlanProposal[]> {
 *   const res = await fetch("/api/generate-plan", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify(req),
 *   });
 *   if (!res.ok) throw new Error("プランの生成に失敗しました");
 *   return (await res.json()) as PlanProposal[];
 * }
 */

const SPOT_POOL = [
  { title: "展望テラス", desc: "山並みを一望できる休憩スポット。", query: "mountain-viewpoint" },
  { title: "老舗ギャラリー", desc: "地元作家の工芸品を眺めながら散策。", query: "art-gallery-japan" },
  { title: "湖畔の遊歩道", desc: "水辺を歩きながらのんびり過ごせる。", query: "lake-path-japan" },
  { title: "地元の酒蔵見学", desc: "見学と試飲ができる小さな蔵元。", query: "sake-brewery" },
  { title: "高原牧場", desc: "動物と触れ合える体験型スポット。", query: "highland-farm" },
  { title: "温泉共同浴場", desc: "地元の人にも人気の外湯。", query: "onsen-bath" },
];

const MEAL_POOL = [
  { title: "手打ち蕎麦の老舗", desc: "地元産そば粉を使った手打ち蕎麦。", query: "soba-noodles" },
  { title: "高原レストラン", desc: "地元野菜を使ったランチプレート。", query: "restaurant-terrace" },
  { title: "温泉街の食堂", desc: "郷土料理が楽しめる定食屋。", query: "japanese-diner" },
];

const RAIN_ALT_POOL = [
  { title: "美術館（屋内）", desc: "雨天でも快適に楽しめる屋内展示。", query: "museum-interior" },
  { title: "ガラス工房体験", desc: "雨の日でも没入できるクラフト体験。", query: "glass-workshop" },
  { title: "足湯カフェ", desc: "屋根付きの足湯で雨音を聞きながら休憩。", query: "footbath-cafe" },
];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(((total % 1440) + 1440) % 1440 / 60);
  const nm = ((total % 60) + 60) % 60;
  return `${pad(nh)}:${pad(nm)}`;
}

function pick<T>(arr: T[], seed: number, offset: number): T {
  return arr[(seed + offset) % arr.length];
}

function buildItems(req: TripRequest, weather: Weather, seed: number): PlanItem[] {
  const pool = weather === "rainy" ? RAIN_ALT_POOL : SPOT_POOL;
  const stopCount = req.style === "active" ? 5 : 3;
  const items: PlanItem[] = [];
  let cursor = req.time || "09:00";

  items.push({
    id: `move-start-${seed}`,
    time: cursor,
    durationMin: 0,
    kind: "move",
    title: `${req.origin || "出発地"} から出発`,
    description: `${req.destination || "目的地"} へ向けて出発します。`,
  });

  for (let i = 0; i < stopCount; i++) {
    const travel = 20 + (i % 3) * 10;
    cursor = addMinutes(cursor, travel);
    const spot = pick(pool, seed, i);
    const stay = req.style === "active" ? 45 : 75;

    items.push({
      id: `spot-${seed}-${i}`,
      time: cursor,
      durationMin: stay,
      kind: "spot",
      title: spot.title,
      description: spot.desc,
      imageQuery: spot.query,
      cost: 800 + i * 300,
      travelFromPrevMin: travel,
    });
    cursor = addMinutes(cursor, stay);

    // 昼どき・夕どきに食事を自動で挟む
    const hour = Number(cursor.split(":")[0]);
    if ((hour === 12 || hour === 13) && !items.some((it) => it.kind === "meal" && it.title.includes("昼"))) {
      const meal = pick(MEAL_POOL, seed, i);
      items.push({
        id: `meal-lunch-${seed}`,
        time: cursor,
        durationMin: 60,
        kind: "meal",
        title: `【昼食】${meal.title}`,
        description: meal.desc,
        imageQuery: meal.query,
        cost: 1500,
      });
      cursor = addMinutes(cursor, 60);
    }
    if ((hour === 18 || hour === 19) && !items.some((it) => it.kind === "meal" && it.title.includes("夕"))) {
      const meal = pick(MEAL_POOL, seed, i + 1);
      items.push({
        id: `meal-dinner-${seed}`,
        time: cursor,
        durationMin: 75,
        kind: "meal",
        title: `【夕食】${meal.title}`,
        description: meal.desc,
        imageQuery: meal.query,
        cost: 3200,
      });
      cursor = addMinutes(cursor, 75);
    }
  }

  items.push({
    id: `move-end-${seed}`,
    time: cursor,
    durationMin: 0,
    kind: "move",
    title: `${req.destination || "目的地"} 到着・解散`,
    description: "本日の観光プランはここで終了です。お疲れさまでした。",
  });

  return items;
}

function buildPlan(req: TripRequest, weather: Weather, label: string, seed: number): TravelPlan {
  const items = buildItems(req, weather, seed);
  const spotCost = items.reduce((sum, it) => sum + (it.cost ?? 0), 0);
  const transportCost = req.transport === "car" ? 2500 : req.transport === "public" ? 1800 : 0;
  const breakdown = [
    { label: "入場料・体験費", amount: spotCost },
    { label: "飲食費", amount: items.filter((i) => i.kind === "meal").reduce((s, i) => s + (i.cost ?? 0), 0) },
    { label: "交通費", amount: transportCost },
  ];
  const budgetTotal = breakdown.reduce((s, b) => s + b.amount, 0);

  return {
    id: `${label}-${weather}`,
    planLabel: label,
    weather,
    summary:
      weather === "sunny"
        ? `${req.style === "active" ? "アクティブに" : "ゆったりと"}屋外スポットを巡る、晴れの日向けプランです。`
        : "雨天時でも快適に過ごせる屋内中心の代替プランです。",
    items,
    budgetTotal,
    budgetBreakdown: breakdown,
  };
}

/** モック実装：本番では上記コメントの fetch 版に差し替える */
export async function generatePlans(req: TripRequest): Promise<PlanProposal[]> {
  // API呼び出しのレイテンシを模擬（UIのローディング状態確認用）
  await new Promise((resolve) => setTimeout(resolve, 900));

  const labels = ["プランA", "プランB", "プランC"].slice(0, req.planCount);

  return labels.map((label, idx) => ({
    id: `proposal-${idx}`,
    label,
    variants: {
      sunny: buildPlan(req, "sunny", label, idx),
      rainy: buildPlan(req, "rainy", label, idx + 10),
    },
  }));
}
