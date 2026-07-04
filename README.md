# 旅のしるべ — 観光プラン自動生成Webアプリ（フロントエンド）

出発地・目的地・日時などの条件を入力すると、時系列のタイムライン形式で観光プランを提案するフロントエンドです。Next.js (App Router) + TypeScript + Tailwind CSS + lucide-react で構築しています。現時点ではプラン生成はモック（`lib/mockPlanGenerator.ts`）で動作し、生成AI APIと接続する前提でState設計しています。

## セットアップ

```bash
npm install
npm run dev
```

`http://localhost:3000` で確認できます。

## ワンクリックデプロイ

- **Vercel**: リポジトリを GitHub に push し、Vercel で Import するだけでビルド設定不要（Next.js を自動検出）。
- **Netlify**: `@netlify/plugin-nextjs` が自動適用されます。ビルドコマンド `next build`、公開ディレクトリはそのまま（プラグインが処理）。

## 画面構成

```
components/
  TripForm.tsx      … 左カラムの条件入力フォーム
  PlanTabs.tsx       … プランA/B/C切り替え ＋ 晴れ/雨バージョン切り替え ＋ 結果表示のまとめ
  Timeline.tsx       … 時系列タイムライン（登山道の破線をイメージした縦ライン）
  SpotCard.tsx       … スポット/食事の1項目カード（画像プレースホルダー付き）
  BudgetSummary.tsx  … 概算予算の表示
lib/
  types.ts               … 型定義（TripRequest / TravelPlan / PlanProposal など）
  mockPlanGenerator.ts    … モックのプラン生成ロジック（本番ではAPI呼び出しに置換）
app/
  page.tsx    … 画面全体のレイアウトと状態管理
  layout.tsx  … フォント・メタデータ
  globals.css … グローバルスタイル
```

## レスポンシブ方針

- **スマホ（`lg`未満）**: 画面上部に「条件入力／プラン結果」の切り替えタブを固定表示。フォームと結果は縦スクロールで、タブ操作でスムーズに切り替え。プラン生成が完了すると自動的に結果タブへ遷移します。
- **タブレット・PC（`lg`以上）**: `flex-row` の2カラムレイアウト。左カラム（400px固定・独立スクロール）に入力フォーム、右カラム（可変幅・独立スクロール）に結果のタイムラインを配置し、1画面で完結します。

ブレークポイントの切り替えはすべて Tailwind の `lg:` プレフィックスで制御しています（`components/TripForm.tsx` は共通コンポーネントとして両サイズで再利用）。

## デザインの考え方

出発地〜目的地を巡る「山と温泉のしおり」をテーマに、以下のトークンで構成しています。

- **配色**: 深い墨色の文字（`ink`）、山霧を思わせる淡いモスグレーの背景（`mist`）、森の緑（`forest`）と紅葉・焚き火を思わせる焦げたオレンジ（`ember`）をアクセントに、天候タブは晴れ＝`sunny`（琥珀）／雨＝`rainy`（藍）で視覚的に区別。
- **タイポグラフィ**: 見出しに明朝体（Shippori Mincho）、本文に角ゴシック（Zen Kaku Gothic New）、時刻・金額など数値情報には等幅フォント（JetBrains Mono）を使い、旅程表やチケットのような質感を出しています。
- **シグネチャー要素**: タイムラインの縦線を登山道の破線で表現し、スポット/食事/移動の各項目を「山の中の目印（ウェイポイント）」のように配置しています。

## 将来のバックエンド（生成AI API）連携に向けたState設計

フロント側は API 未接続の状態でも完成した挙動になるよう、以下の方針で状態を分離しています。

1. **入力状態 `TripRequest`**（`lib/types.ts`）
   - フォームの全項目をそのまま1つのオブジェクトで保持（`origin` / `destination` / `date` / `time` / `transport` / `style` / `planCount`）。
   - このオブジェクトを **そのまま API リクエストボディとして送信できる形** にしてあるため、バックエンド側のスキーマとフロントの型を1対1で対応させやすくしています。

2. **通信状態 `GeneratePlansState`**
   - `status: "idle" | "loading" | "success" | "error"` を持たせ、ローディング表示・エラー表示・結果表示をUI側で明確に分岐（`app/page.tsx`）。
   - 将来的に React Query 等を導入する場合も、この形をそのまま `data` / `isLoading` / `isError` にマッピングできます。

3. **生成ロジックの差し替えポイント `lib/mockPlanGenerator.ts`**
   - `generatePlans(req: TripRequest): Promise<PlanProposal[]>` という関数1つに処理を閉じています。
   - 本番では以下のように内部実装を fetch に差し替えるだけで、コンポーネント側の変更は不要です。

   ```ts
   export async function generatePlans(req: TripRequest): Promise<PlanProposal[]> {
     const res = await fetch("/api/generate-plan", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(req),
     });
     if (!res.ok) throw new Error("プランの生成に失敗しました");
     return (await res.json()) as PlanProposal[];
   }
   ```

4. **結果の型 `PlanProposal` / `TravelPlan` / `PlanItem`**
   - `PlanProposal` は「プランA/B/C」単位で、内部に `variants: { sunny: TravelPlan; rainy: TravelPlan }` を持たせ、天候バージョンをセットで保持。
   - `TravelPlan.items: PlanItem[]` が実際のタイムライン。`kind`（`spot` / `meal` / `move` / `note`）で表示コンポーネント（`SpotCard` / `Timeline`内の分岐）を切り替えています。
   - 生成AIのレスポンスをこのスキーマに正規化するアダプター関数を挟めば、API側の出力形式が多少異なっても吸収できます。

## 主要な入力・出力の対応

| フォーム項目 | 型 | 出力への影響 |
|---|---|---|
| 出発地・目的地 | `string` | タイムラインの開始・終了項目、タイトルに反映 |
| 日にち・時刻 | `date` / `time` | プランの開始時刻の基準に使用 |
| 移動手段 | `car` / `public` / `walk` | 概算予算の交通費に反映 |
| 旅のスタイル | `active` / `relaxed` | 立ち寄りスポット数・滞在時間に反映（アクティブ=多め短め／ゆったり=少なめ長め） |
| プラン数 | `1` / `2` / `3` | 提案されるプランタブの数 |

## 画像プレースホルダーについて

`SpotCard.tsx` では Unsplash の検索型URL（`https://source.unsplash.com/...`）をダミー画像として使用しています。本番運用では固定の画像CDNや生成AIによる画像生成APIに差し替えることを想定しています。
