# 要件定義書: AI株式投資アドバイザー (Multi-Agent)

## 1. プロジェクト概要

### 1.1 プロダクトビジョン
ユーザーのトリガーにより、最新ニュースの収集・株価データの取得・投資判断の提案を自動で行う**パーソナライズド・マルチエージェント**アプリケーション。
マイクロサービスアーキテクチャを採用し、エージェント間は A2A (Agent-to-Agent) プロトコルで通信する。

### 1.2 ターゲットユーザー
- 個人投資家(初心者〜中級者)
- 日々のニュースと株価を効率的に把握し、自分に合った投資判断の材料を得たい人

### 1.3 コアバリュー
- ボタン一つで「今日のニュース × 株価動向 × 投資提案」が得られる
- **7体のAIエージェント**が専門的に分業し、質の高い分析を提供
- ユーザーの投資スタイル・リスク許容度に合わせた**パーソナライズド提案**
- コストを最低限に抑えた運用

---

## 2. システムアーキテクチャ

### 2.1 全体構成

```
┌──────────────────────────────────────────────────────────────────┐
│                           Frontend                               │
│                      (Next.js / React 19)                        │
└──────────────────────────────┬───────────────────────────────────┘
                               │ REST API
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Orchestrator Agent [LLM]                       │
│          ユーザーの意図を解釈し、動的にエージェントを組み合わせる        │
└──┬──────────┬──────────┬──────────┬──────────┬──────────┬────────┘
   │ A2A      │ A2A      │ A2A      │ A2A      │ A2A      │ A2A
   ▼          ▼          ▼          ▼          ▼          ▼
┌────────┐┌────────┐┌─────────┐┌─────────┐┌─────────┐┌──────────┐
│ News   ││ Stock  ││Sentiment││ User    ││ Risk    ││ Report   │
│ Agent  ││ Agent  ││ Agent   ││ Profile ││ Assess  ││ Agent    │
│ [LLM]  ││        ││ [LLM]   ││ Agent   ││ Agent   ││ [LLM]    │
│        ││        ││         ││ [LLM]   ││ [LLM]   ││          │
│ニュース ││株価取得 ││感情分析  ││投資家    ││リスク    ││レポート   │
│収集     ││指標計算 ││世論分析  ││プロファ  ││評価     ││生成      │
│要約     ││        ││         ││イリング  ││        ││          │
└────────┘└────────┘└─────────┘└─────────┘└─────────┘└──────────┘
```

### 2.2 マイクロサービス一覧

| # | サービス名 | 役割 | LLM | ポート |
|---|---|---|---|---|
| 0 | **Frontend** | UI表示 | - | 3001 |
| 1 | **Orchestrator Agent** | 意図解釈・動的タスク振り分け | Gemini | 3000 |
| 2 | **News Agent** | ニュース収集・要約・分類 | Gemini | 3002 |
| 3 | **Stock Agent** | 株価データ取得・テクニカル指標計算 | - | 3003 |
| 4 | **Sentiment Agent** | ニュース・市場センチメント分析 | Gemini | 3004 |
| 5 | **User Profile Agent** | 投資家プロファイル管理・学習 | Gemini | 3005 |
| 6 | **Risk Assessment Agent** | リスク評価・ポートフォリオ分析 | Gemini | 3006 |
| 7 | **Report Agent** | パーソナライズドレポート生成 | Gemini | 3007 |

**LLM使用: 6体** (Orchestrator, News, Sentiment, User Profile, Risk Assessment, Report)
**LLM不使用: 1体** (Stock Agent — API呼び出し+数値計算のみ)

### 2.3 A2A通信

- Google ADK の Agent-to-Agent (A2A) プロトコルを使用
- 各エージェントは独立したマイクロサービスとして稼働し、A2A経由でタスクを送受信
- Orchestrator Agent がユーザーの意図を解釈し、必要なエージェントを動的に選択・組み合わせる

### 2.4 エージェント間データフロー

```
ユーザートリガー
    │
    ▼
Orchestrator Agent ──→ User Profile Agent (ユーザーの投資スタイル取得)
    │
    ├──→ News Agent ─────────────────┐
    │                                ▼
    ├──→ Stock Agent ──→ Risk Assessment Agent (株価+ポートフォリオリスク)
    │                                │
    │    Sentiment Agent ←───────────┤ (ニュース+株価からセンチメント分析)
    │         │                      │
    │         ▼                      ▼
    │    ┌─────────────────────────────────┐
    │    │         Report Agent            │
    │    │  全データ + ユーザープロファイル    │
    │    │  → パーソナライズドレポート生成     │
    │    └─────────────────────────────────┘
    │                   │
    ▼                   ▼
  結果統合 → Frontend に返却
```

---

## 3. 機能要件

### 3.1 ユーザー機能

#### F-001: デイリーリサーチトリガー
- ユーザーがダッシュボード上のボタンを押すと、その日のリサーチが開始される
- リサーチ中は各エージェントの進捗をリアルタイム表示(どのエージェントが稼働中か可視化)
- 1日1回のトリガーを想定(複数回も可能)

#### F-002: ウォッチリスト管理
- ユーザーは監視したい銘柄(ティッカーシンボル)を登録・削除できる
- 日本株(例: 7203.T)、米国株(例: AAPL)の両方に対応
- 最大20銘柄まで登録可能(API コスト制御)

#### F-003: 投資家プロファイル設定
- 初回利用時にプロファイル設定ウィザードを表示
- 設定項目:
  - **投資スタイル**: 短期トレード / スイングトレード / 中長期投資 / 配当重視
  - **リスク許容度**: 保守的 / バランス型 / 積極的
  - **関心セクター**: テクノロジー、ヘルスケア、金融、エネルギーなど(複数選択)
  - **投資経験**: 初心者 / 中級者 / 上級者
  - **注目テーマ**: 自由入力(例: "AI関連", "EV", "半導体")
- プロファイルは随時変更可能
- User Profile Agent がプロファイルと過去の行動から嗜好を学習

#### F-004: ニュースフィード表示
- 収集されたニュースを一覧で表示
- 各ニュースにはAIによる要約と、関連銘柄へのタグ付けがある
- 市場へのインパクト度(高・中・低)を表示
- **パーソナライズ**: ユーザーの関心セクター・注目テーマに基づく重み付け表示

#### F-005: センチメントダッシュボード
- 市場全体のセンチメント(強気/弱気/中立)をゲージで表示
- 銘柄ごとのセンチメントスコアを表示
- ニュース感情の時系列推移グラフ
- センチメントの根拠となるニュースへのリンク

#### F-006: 株価ダッシュボード
- ウォッチリストの各銘柄について以下を表示:
  - 直近の株価(前日終値)
  - 過去30日間の株価チャート
  - 変動率(日次・週次・月次)
  - 基本テクニカル指標(移動平均線、RSI)

#### F-007: リスク評価表示
- ウォッチリスト全体のリスクスコア(0〜100)
- セクター集中度の警告
- ボラティリティに基づく個別銘柄リスクランク
- ユーザーのリスク許容度との整合性チェック結果

#### F-008: パーソナライズド投資提案レポート
- 全エージェントの分析結果を統合したレポートを表示
- 各銘柄に対する提案:
  - **買い推奨**: ポジティブな材料が多い場合
  - **見送り推奨**: ネガティブ / 不確定要素が多い場合
  - **様子見**: 判断材料が不足している場合
- レポートはユーザーの投資スタイルに合わせた語調・観点で記述
  - 短期トレーダーにはエントリータイミング重視
  - 中長期投資家にはファンダメンタル重視
  - 初心者には平易な解説付き
- 提案の根拠(参照ニュース、センチメント、株価トレンド、リスク評価)を併記
- **免責事項**: 投資判断はユーザー自身の責任であることを明示

#### F-009: フィードバック機能
- 各提案に対して「参考になった / ならなかった」のフィードバックボタン
- User Profile Agent がフィードバックを蓄積し、提案精度を継続改善

#### F-010: 分析履歴
- 過去のリサーチ結果を日付別に閲覧できる
- 直近7日分を保存(コスト最小化のためストレージを制限)

### 3.2 エージェント機能

#### A-001: Orchestrator Agent [LLM]
- ユーザーのリクエストを自然言語で解釈し、必要なエージェントを動的に選択
- 実行フロー:
  1. User Profile Agent からユーザープロファイルを取得 (A2A)
  2. News Agent と Stock Agent に並行でタスクを送信 (A2A)
  3. 結果を Sentiment Agent に送信 (A2A)
  4. Stock Agent の結果 + プロファイルを Risk Assessment Agent に送信 (A2A)
  5. 全結果を Report Agent に送信し、パーソナライズドレポートを生成 (A2A)
  6. 全結果を統合してフロントエンドに返却
- エラーハンドリング: いずれかのエージェントが失敗した場合、部分的な結果でも返却する
- 将来的にユーザーとの対話的なQ&A(チャット形式）にも対応可能

#### A-002: News Agent [LLM]
- **入力**: ウォッチリストの銘柄リスト、リサーチ対象日、ユーザーの関心セクター
- **処理**:
  1. Finnhub News / MarketAux から金融関連ニュースを取得
  2. NewsData.io / Google News RSS をバックアップソースとして活用
  3. LLM (Gemini) でニュースを要約・分類
  4. 各ニュースの市場インパクト度を判定
  5. ユーザーの関心セクター・注目テーマに基づく関連度スコアリング
- **出力**: 構造化されたニュースリスト(タイトル、要約、関連銘柄、インパクト度、関連度、ソースURL)

#### A-003: Stock Agent (LLMなし)
- **入力**: ウォッチリストの銘柄リスト
- **処理**:
  1. US株: Alpha Vantage / Finnhub で日次株価データを取得
  2. 日本株: Twelve Data で日次株価データを取得
  3. テクニカル指標を計算(SMA, RSI, MACD, ボリンジャーバンド)
  4. 価格トレンド(上昇/下落/横ばい)を判定
- **出力**: 各銘柄の株価サマリー(終値、変動率、テクニカル指標、トレンド判定、過去30日データ)

#### A-004: Sentiment Agent [LLM]
- **入力**: News Agent の出力 + Stock Agent の出力
- **処理**:
  1. ニュースごとのセンチメント分析(ポジティブ/ネガティブ/ニュートラル + スコア)
  2. 銘柄ごとのセンチメント集約
  3. 市場全体のセンチメント判定(Fear & Greed的な指標)
  4. 株価の動きとニュースセンチメントの乖離検出(逆張りシグナル)
- **出力**: 銘柄別・市場全体のセンチメントスコア、注目すべき乖離シグナル

#### A-005: User Profile Agent [LLM]
- **入力**: ユーザーID
- **処理**:
  1. DBからユーザープロファイル(投資スタイル、リスク許容度、関心セクター)を取得
  2. 過去のフィードバック履歴を分析
  3. ユーザーの嗜好モデルを更新(どんな提案が有用だったか)
  4. 現在のプロファイルに基づく提案方針を生成
- **出力**: ユーザープロファイルサマリー(投資スタイル、嗜好、提案時の注意点)

#### A-006: Risk Assessment Agent [LLM]
- **入力**: Stock Agent の出力 + ユーザープロファイル
- **処理**:
  1. 各銘柄のボラティリティ計算(過去30日の標準偏差)
  2. ウォッチリスト全体のセクター偏り分析
  3. ユーザーのリスク許容度との整合性チェック
  4. LLMによるリスク要因の自然言語説明
- **出力**: 銘柄別リスクスコア、ポートフォリオリスク評価、警告事項

#### A-007: Report Agent [LLM]
- **入力**: 全エージェントの出力 + ユーザープロファイル
- **処理**:
  1. ニュース + センチメント + 株価 + リスク を統合分析
  2. ユーザーの投資スタイルに応じた語調・観点でレポートを生成
  3. 各銘柄に対してアクション(買い/見送り/様子見)と信頼度を判定
  4. 提案根拠を構造的に整理
- **出力**: パーソナライズドレポート(サマリー、銘柄別提案、リスク注意事項、参照データ)

---

## 4. 外部API

### 4.1 株価データ

| API | 用途 | 無料枠 | 備考 |
|---|---|---|---|
| **Alpha Vantage** | 日次株価取得(メイン・US株) | 25リクエスト/日 | US・国際株対応。APIキー必須 |
| **Twelve Data** | 日次株価取得(メイン・日本株) | 800リクエスト/日 (8/分) | 東証を含む50+取引所対応 |
| **Finnhub** | リアルタイム補助・US株 | 60リクエスト/分 | ニュースAPIも含む |
| **J-Quants API (JPX公式)** | 日本株データ (将来検討) | 無料(12週間遅延) | JPX公式。有料版はリアルタイム |

### 4.2 ニュースデータ

| API | 用途 | 無料枠 | 備考 |
|---|---|---|---|
| **Finnhub News** | 金融ニュース(メイン) | 株価APIと共用 (60回/分) | マーケット特化。株価APIと統合 |
| **MarketAux** | 金融ニュース補助 | 100リクエスト/日 | センチメント分析付き。ティッカーでフィルタ可 |
| **NewsData.io** | 一般ニュース | 200クレジット/日 | 92,000+ソース。日本語対応 |
| **Google News RSS** | バックアップ | 無制限 | APIキー不要。パース処理が必要 |

### 4.3 LLM

| API | 用途 | 利用エージェント | 備考 |
|---|---|---|---|
| **Gemini (Google AI)** | 要約・分析・レポート生成 | 6体 (全LLMエージェント) | Google ADK経由。無料枠あり |

### 4.4 コスト試算 (1日あたり・1ユーザー)

| 項目 | 消費量 | コスト |
|---|---|---|
| Alpha Vantage | 最大20リクエスト (20銘柄) | 無料 |
| Twelve Data | 最大20リクエスト | 無料 |
| Finnhub | 数十リクエスト (株価+ニュース) | 無料 |
| MarketAux | 数リクエスト | 無料 |
| Gemini API | ~10,000トークン × 6エージェント | 無料枠内 |
| Cloud Run | リクエスト時のみ起動 (7サービス) | ほぼ無料 |
| Cloud SQL | db-f1-micro | ~$10/月 |
| **合計** | | **~$10/月** |

---

## 5. データモデル

### 5.1 主要エンティティ

```
User
├── id: UUID
├── email: string
├── createdAt: DateTime
├── watchlist: Watchlist
└── profile: UserProfile

UserProfile
├── id: UUID
├── userId: UUID
├── investmentStyle: "short_term" | "swing" | "long_term" | "dividend"
├── riskTolerance: "conservative" | "balanced" | "aggressive"
├── experienceLevel: "beginner" | "intermediate" | "advanced"
├── interestedSectors: string[]      // e.g., ["technology", "healthcare"]
├── watchThemes: string[]            // e.g., ["AI", "EV", "半導体"]
├── preferenceModel: JSON            // 学習された嗜好データ
└── updatedAt: DateTime

Watchlist
├── id: UUID
├── userId: UUID
└── symbols: WatchlistItem[]

WatchlistItem
├── symbol: string        // e.g., "AAPL", "7203.T"
├── market: "US" | "JP"
└── addedAt: DateTime

DailyResearch
├── id: UUID
├── userId: UUID
├── date: Date
├── status: "pending" | "in_progress" | "completed" | "failed"
├── agentStatuses: AgentStatus[]
├── newsResults: NewsResult[]
├── stockResults: StockResult[]
├── sentimentResults: SentimentResult[]
├── riskAssessment: RiskAssessment
├── report: PersonalizedReport
└── createdAt: DateTime

AgentStatus
├── agentName: string
├── status: "pending" | "running" | "completed" | "failed"
├── startedAt: DateTime
└── completedAt: DateTime

NewsResult
├── id: UUID
├── researchId: UUID
├── title: string
├── summary: string
├── sourceUrl: string
├── relatedSymbols: string[]
├── impactLevel: "high" | "medium" | "low"
├── relevanceScore: number           // ユーザーの関心との関連度 (0.0〜1.0)
└── publishedAt: DateTime

StockResult
├── id: UUID
├── researchId: UUID
├── symbol: string
├── closingPrice: number
├── changePercent: number
├── sma20: number
├── sma50: number
├── rsi14: number
├── macd: { line: number; signal: number; histogram: number }
├── bollingerBands: { upper: number; middle: number; lower: number }
├── trend: "bullish" | "bearish" | "neutral"
├── priceHistory: { date: Date; close: number }[]
└── fetchedAt: DateTime

SentimentResult
├── id: UUID
├── researchId: UUID
├── symbol: string
├── sentimentScore: number           // -1.0 (極めて弱気) 〜 +1.0 (極めて強気)
├── sentimentLabel: "very_bearish" | "bearish" | "neutral" | "bullish" | "very_bullish"
├── divergenceSignal: string | null  // 株価との乖離シグナル
├── marketOverallSentiment: number
└── analyzedAt: DateTime

RiskAssessment
├── id: UUID
├── researchId: UUID
├── overallRiskScore: number         // 0〜100
├── sectorConcentration: { sector: string; ratio: number }[]
├── volatilityRanks: { symbol: string; volatility: number; rank: number }[]
├── riskToleranceAlignment: "aligned" | "over_risk" | "under_risk"
├── warnings: string[]
└── assessedAt: DateTime

PersonalizedReport
├── id: UUID
├── researchId: UUID
├── summary: string                  // 全体サマリー (ユーザーの語調に合わせた)
├── suggestions: InvestmentSuggestion[]
├── riskNotes: string
├── generatedAt: DateTime
└── tone: "beginner_friendly" | "technical" | "concise"

InvestmentSuggestion
├── id: UUID
├── reportId: UUID
├── symbol: string
├── action: "buy" | "hold" | "skip"
├── confidence: number               // 0.0 〜 1.0
├── reasoning: string
├── referencedNewsIds: UUID[]
├── sentimentBasis: string
├── riskBasis: string
└── createdAt: DateTime

UserFeedback
├── id: UUID
├── userId: UUID
├── suggestionId: UUID
├── helpful: boolean
├── createdAt: DateTime
```

---

## 6. API設計 (REST)

### 6.1 Orchestrator → Frontend

| Method | Endpoint | 説明 |
|---|---|---|
| POST | `/v1/research` | デイリーリサーチをトリガー |
| GET | `/v1/research/:researchId` | リサーチ結果を取得 |
| GET | `/v1/research/:researchId/status` | エージェント稼働状況をポーリング |
| GET | `/v1/research/history` | 過去のリサーチ一覧 |
| GET | `/v1/watchlist` | ウォッチリスト取得 |
| POST | `/v1/watchlist/symbols` | 銘柄を追加 |
| DELETE | `/v1/watchlist/symbols/:symbol` | 銘柄を削除 |
| GET | `/v1/profile` | ユーザープロファイル取得 |
| PUT | `/v1/profile` | ユーザープロファイル更新 |
| POST | `/v1/feedback` | 提案へのフィードバック送信 |

### 6.2 A2A タスク定義

```
Orchestrator → User Profile Agent
  Task: "get_user_profile"
  Input: { userId: string }
  Output: { profile: UserProfile, preferenceSummary: string }

Orchestrator → News Agent
  Task: "research_news"
  Input: { symbols: string[], date: string, interestedSectors: string[], watchThemes: string[] }
  Output: { news: NewsResult[] }

Orchestrator → Stock Agent
  Task: "fetch_stock_data"
  Input: { symbols: string[] }
  Output: { stocks: StockResult[] }

Orchestrator → Sentiment Agent
  Task: "analyze_sentiment"
  Input: { news: NewsResult[], stocks: StockResult[] }
  Output: { sentiments: SentimentResult[], marketOverall: number }

Orchestrator → Risk Assessment Agent
  Task: "assess_risk"
  Input: { stocks: StockResult[], profile: UserProfile }
  Output: { riskAssessment: RiskAssessment }

Orchestrator → Report Agent
  Task: "generate_report"
  Input: {
    news: NewsResult[],
    stocks: StockResult[],
    sentiments: SentimentResult[],
    riskAssessment: RiskAssessment,
    profile: UserProfile
  }
  Output: { report: PersonalizedReport }
```

---

## 7. 非機能要件

### 7.1 パフォーマンス
- リサーチ完了までの目標時間: 60秒以内(20銘柄の場合)
- News Agent と Stock Agent は並行実行で時間短縮
- Sentiment Agent と Risk Assessment Agent も並行実行可能

### 7.2 可用性
- 個人利用のため SLA は設けない
- エージェント障害時は部分的な結果でも返却(グレースフルデグラデーション)

### 7.3 セキュリティ
- APIキーは Secret Manager で管理
- ユーザー認証: Firebase Authentication (Google ログイン)
- HTTPS 通信のみ

### 7.4 コスト最適化
- Cloud Run: リクエスト時のみ起動(min-instances: 0)
- 外部APIは無料枠内で運用
- 分析履歴は7日間のみ保持
- LLM呼び出しはプロンプトを最適化しトークン消費を最小化

### 7.5 スケーラビリティ
- 初期は単一ユーザー想定
- マイクロサービス構成により、将来的にエージェント単位でスケール可能

---

## 8. 技術スタック

| レイヤー | 技術 |
|---|---|
| Frontend | Next.js 16 / React 19 / Tailwind CSS v4 |
| Backend (各エージェント) | Hono.js / TypeScript / Google ADK |
| エージェント間通信 | A2A Protocol (Google ADK) |
| LLM | Gemini (Google AI) |
| DB | Cloud SQL (PostgreSQL) |
| 認証 | Firebase Authentication |
| インフラ | GCP (Cloud Run / Cloud Build / Cloud Storage) |
| IaC | Terraform |
| CI/CD | GitHub Actions → Cloud Build |

---

## 9. 画面構成

### 9.1 ダッシュボード (メイン画面)
```
┌──────────────────────────────────────────────────────────┐
│  AI Stock Advisor              [プロファイル] [実行ボタン] │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🤖 エージェント稼働状況 (リサーチ実行中のみ表示)           │
│  ┌────────────────────────────────────────────────┐      │
│  │ ✅ User Profile  ✅ News  ✅ Stock              │      │
│  │ 🔄 Sentiment     🔄 Risk   ⏳ Report           │      │
│  └────────────────────────────────────────────────┘      │
│                                                          │
│  📊 パーソナライズド投資レポート                           │
│  ┌────────────────────────────────────────────────┐      │
│  │ あなたの中長期投資スタイルに基づく本日の分析:       │      │
│  │ 全体的に市場は楽観的ムードですが、半導体セクター     │      │
│  │ に過熱感があります。以下の銘柄に注目してください。   │      │
│  └────────────────────────────────────────────────┘      │
│                                                          │
│  💡 銘柄別提案                                            │
│  ┌────────┬────────┬───────┬──────────────────────┐      │
│  │ 銘柄    │ 判定   │ 信頼度 │ 理由 (抜粋)          │      │
│  │ AAPL   │ 買い   │ 78%   │ 新製品発表+上昇トレンド│      │
│  │ 7203.T │ 様子見 │ 45%   │ 円高リスク+RSI低下    │      │
│  │ GOOGL  │ 見送り │ 62%   │ 規制リスク+センチ弱気  │      │
│  │        │        │       │  [👍 参考になった]     │      │
│  └────────┴────────┴───────┴──────────────────────┘      │
│                                                          │
│  🌡️ 市場センチメント        📉 リスク評価                 │
│  ┌──────────────────┐     ┌──────────────────────┐      │
│  │ [====>    ] 62    │     │ リスクスコア: 45/100  │      │
│  │ やや強気           │     │ ⚠️ テック偏重注意      │      │
│  │                   │     │ ✅ リスク許容度と整合  │      │
│  └──────────────────┘     └──────────────────────┘      │
│                                                          │
│  📰 ニュース (関連度順)          📈 株価一覧               │
│  ┌──────────────────────┐     ┌─────────────────┐      │
│  │ ⭐[高] Apple新製品     │     │ AAPL  $178 +1.2%│      │
│  │ ⭐[中] 日銀政策決定    │     │ 7203  ¥2845-0.3%│      │
│  │   [低] テック採用動向  │     │ GOOGL $142 -0.8%│      │
│  └──────────────────────┘     └─────────────────┘      │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  ⚙️ ウォッチリスト管理   📅 過去の分析履歴                  │
└──────────────────────────────────────────────────────────┘
```

### 9.2 画面一覧

| 画面 | パス | 説明 |
|---|---|---|
| ダッシュボード | `/` | メイン画面。リサーチトリガー・レポート表示 |
| 銘柄詳細 | `/stocks/:symbol` | 個別銘柄の詳細チャート・提案理由・センチメント推移 |
| プロファイル設定 | `/profile` | 投資スタイル・リスク許容度・関心セクター設定 |
| ウォッチリスト管理 | `/watchlist` | 銘柄の追加・削除 |
| 分析履歴 | `/history` | 日付別の過去リサーチ結果 |
| ログイン | `/login` | Firebase Auth (Google ログイン) |

---

## 10. 免責事項

本アプリケーションが提供する投資提案は、AIによる自動分析に基づく参考情報であり、投資助言には該当しない。最終的な投資判断はユーザー自身の責任において行うものとする。本アプリケーションの利用により生じた損害について、開発者は一切の責任を負わない。

---

## 11. 開発フェーズ

### Phase 1: 基盤構築
- [ ] 各エージェントサービスのスキャフォールディング (7サービス)
- [ ] A2A通信の基盤実装 (Google ADK)
- [ ] DB スキーマ設計・マイグレーション
- [ ] Firebase Authentication 導入

### Phase 2: コアエージェント実装
- [ ] Stock Agent (Alpha Vantage + Twelve Data + テクニカル指標計算)
- [ ] News Agent (Finnhub + MarketAux + Gemini要約)
- [ ] Orchestrator Agent (動的タスク振り分け)

### Phase 3: パーソナライズエージェント実装
- [ ] User Profile Agent (プロファイル管理 + 嗜好学習)
- [ ] Sentiment Agent (ニュース・市場センチメント分析)
- [ ] Risk Assessment Agent (リスク評価・整合性チェック)
- [ ] Report Agent (パーソナライズドレポート生成)

### Phase 4: フロントエンド
- [ ] ダッシュボード画面 (エージェント稼働状況表示含む)
- [ ] プロファイル設定ウィザード
- [ ] 株価チャート + センチメントダッシュボード
- [ ] ウォッチリスト管理
- [ ] フィードバック機能
- [ ] 分析履歴画面

### Phase 5: インフラ・デプロイ
- [ ] Terraform で GCP リソース構築 (7サービス分)
- [ ] CI/CD パイプライン
- [ ] Secret Manager にAPIキー登録
- [ ] Cloud Run デプロイ
