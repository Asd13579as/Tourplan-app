// ============================================================
// アプリ全体の型定義
// バックエンド（生成AI API）と接続する際は、TripRequest をそのまま
// リクエストボディとして送信し、TravelPlan[] をレスポンスとして
// 受け取る想定でスキーマを揃えている。
// ============================================================

export type Transport = "car" | "public" | "walk";
export type TripStyle = "active" | "relaxed";
export type Weather = "sunny" | "rainy";

/** 入力フォームの状態（そのまま API リクエストになる想定） */
export interface TripRequest {
  origin: string;
  destination: string;
  date: string; // ISO date "YYYY-MM-DD"
  time: string; // "HH:mm"
  transport: Transport;
  style: TripStyle;
  planCount: 1 | 2 | 3;
}

export const emptyTripRequest: TripRequest = {
  origin: "",
  destination: "",
  date: "",
  time: "09:00",
  transport: "car",
  style: "relaxed",
  planCount: 2,
};

/** タイムライン上の1項目（観光スポット・食事・移動など） */
export interface PlanItem {
  id: string;
  time: string; // "HH:mm"
  durationMin: number;
  kind: "spot" | "meal" | "move" | "note";
  title: string;
  description: string;
  imageQuery?: string; // Unsplash等の検索キーワード（画像プレースホルダー用）
  cost?: number; // 円
  travelFromPrevMin?: number; // 直前の項目からの移動時間（分）
}

/** 1つの提案プラン（晴れ版／雨版などの天候バリエーションを含む） */
export interface TravelPlan {
  id: string;
  planLabel: string; // "プランA" など
  weather: Weather;
  summary: string;
  items: PlanItem[];
  budgetTotal: number; // 円（概算合計）
  budgetBreakdown: { label: string; amount: number }[];
}

/** 1つの提案（晴れ版・雨版をまとめて保持） */
export interface PlanProposal {
  id: string;
  label: string; // "プランA" 等、タブの見出し
  variants: Record<Weather, TravelPlan>;
}

/** API 呼び出しの状態管理（loading / error を含む） */
export type RequestStatus = "idle" | "loading" | "success" | "error";

export interface GeneratePlansState {
  status: RequestStatus;
  proposals: PlanProposal[];
  errorMessage?: string;
}
