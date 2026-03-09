# Backend Development Log

## 概要
- ブランチ: `feature/backend-development`
- worktree: `../adk-tutorial-backend`
- 担当: バックエンドエンジニア

## アーキテクチャ
npm workspaces によるモノレポ構成。7つのマイクロサービス + 共有ライブラリ。
**公式 `@google/adk` + `@a2a-js/sdk` を使用。**

```
backend/
├── shared/              共有ライブラリ (types, error, logger, ADK helpers, A2A server/client)
├── orchestrator/        Orchestrator Agent [LLM] (port 3000) - REST API + パイプライン統合
├── news-agent/          News Agent [LLM] (port 3002) - Finnhub/MarketAux + ADK LlmAgent要約
├── stock-agent/         Stock Agent (port 3003) - Alpha Vantage/Twelve Data + テクニカル指標
├── sentiment-agent/     Sentiment Agent [LLM] (port 3004) - ADK LlmAgent センチメント分析
├── user-profile-agent/  User Profile Agent [LLM] (port 3005) - ADK LlmAgent プロファイル管理
├── risk-agent/          Risk Assessment Agent [LLM] (port 3006) - ADK LlmAgent リスク評価
├── report-agent/        Report Agent [LLM] (port 3007) - ADK LlmAgent レポート生成
└── db/                  DBスキーマ (PostgreSQL)
```

## 技術スタック
| 項目 | 技術 |
|------|------|
| Agent Framework | `@google/adk` (LlmAgent, InMemoryRunner, createSession) |
| A2A Protocol | `@a2a-js/sdk` (DefaultRequestHandler, JsonRpcTransportHandler, AgentCard) |
| HTTP Server | Hono.js |
| Error Handling | neverthrow (ResultAsync) |
| Pattern Matching | ts-pattern |
| LLM | Gemini 2.0 Flash (via ADK) |
| Type Safety | TypeScript ESNext + NodeNext |

## REST API (Orchestrator → Frontend)
| Method | Endpoint | Status |
|--------|----------|--------|
| POST   | `/v1/research` | 実装済み (パイプライン統合) |
| GET    | `/v1/research/:researchId` | スタブ |
| GET    | `/v1/research/history` | スタブ |
| GET    | `/v1/watchlist` | デモデータ |
| POST   | `/v1/watchlist/symbols` | スタブ |
| DELETE | `/v1/watchlist/symbols/:symbol` | スタブ |
| GET    | `/v1/profile` | デモデータ |
| PUT    | `/v1/profile` | スタブ |
| POST   | `/v1/feedback` | スタブ |

## A2A エンドポイント (各エージェント)
- `GET /.well-known/agent.json` - AgentCard (A2A discovery)
- `POST /a2a/jsonrpc` - A2A JSON-RPC (公式プロトコル)
- `POST /a2a/task` - REST A2A (簡易タスク実行)
- `GET /health` - ヘルスチェック

## A2A通信フロー
```
POST /v1/research
  → User Profile Agent (プロファイル取得)
  → News Agent + Stock Agent (並行実行)
  → Sentiment Agent + Risk Agent (並行実行)
  → Report Agent (最終レポート生成)
  → 結果統合して返却
```

## 進捗

### Phase 1: 基盤構築 ✅
- [x] npm workspaces モノレポ構成
- [x] 共有ライブラリ (error, logger, types, server)
- [x] ADK helpers (runAgentOnce, runAgentForJson)
- [x] A2A Server (createA2AServer with @a2a-js/sdk)
- [x] A2A Client (sendA2ATask, sendA2AMessage)
- [x] DBスキーマ設計 (PostgreSQL)
- [x] TypeScript コンパイル通過確認

### Phase 2: コアエージェント実装 ✅
- [x] Stock Agent (Alpha Vantage + Twelve Data + SMA/RSI/MACD/Bollinger)
- [x] News Agent (Finnhub + MarketAux + ADK LlmAgent要約)
- [x] Orchestrator Agent (REST API + パイプライン統合)

### Phase 3: パーソナライズエージェント実装 ✅
- [x] User Profile Agent (ADK LlmAgent + 嗜好サマリー生成)
- [x] Sentiment Agent (ADK LlmAgent + 乖離シグナル検出)
- [x] Risk Assessment Agent (ボラティリティ + ADK LlmAgent警告生成)
- [x] Report Agent (ADK LlmAgent + 投資スタイル別レポート)

### Phase 4: ADK/A2A SDK リファクタリング ✅
- [x] 自前A2A → 公式 @a2a-js/sdk (JsonRpcTransportHandler)
- [x] @google/genai → @google/adk (LlmAgent + InMemoryRunner)
- [x] 全エージェントで AgentCard discovery対応
- [x] TypeScript コンパイル通過確認

### Phase 5: 残作業
- [ ] DB接続 (Cloud SQL PostgreSQL) + CRUD実装
- [ ] Firebase Authentication 統合
- [ ] 環境変数・Secret Manager連携
- [ ] エラーハンドリングの強化
- [ ] 分析履歴の7日間TTL実装
- [ ] ユニットテスト

## 環境変数
- `GOOGLE_API_KEY` - Gemini API (ADK経由)
- `ALPHA_VANTAGE_API_KEY` - 株価データ (US)
- `TWELVE_DATA_API_KEY` - 株価データ (JP)
- `FINNHUB_API_KEY` - ニュース + 株価補助
- `MARKETAUX_API_KEY` - 金融ニュース

## 変更履歴
- 2026-03-10: 開発開始。worktree作成。
- 2026-03-10: Phase 1-3 完了。全7エージェント + 共有ライブラリ + DBスキーマ実装。
- 2026-03-10: Phase 4 完了。@google/adk + @a2a-js/sdk へ全面リファクタリング。TypeScript コンパイル通過。
