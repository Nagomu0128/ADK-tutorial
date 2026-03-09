# Backend Development Log

## 概要
- ブランチ: `feature/backend-development`
- worktree: `../adk-tutorial-backend`
- 担当: バックエンドエンジニア
- ステータス: **全フェーズ完了**

## アーキテクチャ
npm workspaces モノレポ。7マイクロサービス + 共有ライブラリ。
`@google/adk` + `@a2a-js/sdk` 使用。

```
backend/
├── shared/              共有ライブラリ
│   ├── adk-helpers.ts     runAgentOnce / runAgentForJson
│   ├── a2a-server.ts      @a2a-js/sdk A2Aサーバー
│   ├── a2a-client.ts      sendA2ATask / sendA2AMessage
│   ├── db.ts              PostgreSQL接続 (pg, Cloud SQL対応)
│   ├── env.ts             環境変数管理
│   ├── types.ts           全型定義
│   ├── error.ts           errorBuilder
│   └── logger.ts          appLogger
├── orchestrator/        port 3000
│   ├── middleware/auth.ts   Firebase Auth ミドルウェア
│   ├── infra/               DB CRUD (user, profile, watchlist, research, feedback)
│   ├── routes/              REST API エンドポイント
│   └── service/             research-pipeline
├── news-agent/          port 3002 - Finnhub/MarketAux + ADK要約
├── stock-agent/         port 3003 - Alpha Vantage/Twelve Data + テクニカル指標
├── sentiment-agent/     port 3004 - ADK センチメント分析
├── user-profile-agent/  port 3005 - ADK プロファイル + DB連携
├── risk-agent/          port 3006 - ボラティリティ + ADK警告
├── report-agent/        port 3007 - ADK パーソナライズドレポート
├── db/schema.sql        PostgreSQL スキーマ (参照用)
└── db/migrations/       node-pg-migrate マイグレーション
    └── 001_initial-schema.sql
```

## REST API
| Method | Endpoint | Status |
|--------|----------|--------|
| POST   | `/v1/research` | ✅ DB保存 + パイプライン統合 |
| GET    | `/v1/research/:researchId` | ✅ DB読み取り |
| GET    | `/v1/research/history` | ✅ 直近7件 |
| GET    | `/v1/watchlist` | ✅ DB CRUD |
| POST   | `/v1/watchlist/symbols` | ✅ 最大20銘柄制限 |
| DELETE | `/v1/watchlist/symbols/:symbol` | ✅ |
| GET    | `/v1/profile` | ✅ DB CRUD |
| PUT    | `/v1/profile` | ✅ upsert |
| POST   | `/v1/feedback` | ✅ DB保存 |

## A2A エンドポイント
- `GET /.well-known/agent.json` - AgentCard discovery
- `POST /a2a/jsonrpc` - A2A JSON-RPC (公式プロトコル)
- `POST /a2a/task` - REST A2A
- `GET /health` - ヘルスチェック

## 認証
- Firebase Authentication (Bearer token)
- dev mode: FIREBASE_PROJECT_ID 未設定時は demo-user で自動認証
- `getAuthUser(c)` でハンドラから取得

## DB
- PostgreSQL (Cloud SQL対応)
- CLOUD_SQL_CONNECTION_NAME 設定時は Unix socket 接続
- 7日間TTL: `deleteOldResearch()` がリサーチ実行時に自動クリーンアップ
- マイグレーション: `node-pg-migrate` 使用
  - `npm run db:migrate` — マイグレーション適用
  - `npm run db:migrate:down` — ロールバック
  - マイグレーションファイル: `db/migrations/`

## 進捗

### Phase 1: 基盤構築 ✅
### Phase 2: コアエージェント実装 ✅
### Phase 3: パーソナライズエージェント実装 ✅
### Phase 4: ADK/A2A SDK リファクタリング ✅
### Phase 5: DB + Auth + 環境変数 ✅
- [x] PostgreSQL接続 (pg + Cloud SQL対応)
- [x] 全CRUD (user, profile, watchlist, research, feedback)
- [x] Firebase Authentication ミドルウェア
- [x] 環境変数管理 (.env.example)
- [x] 7日間TTLクリーンアップ
- [x] TypeScript コンパイル通過

## 環境変数
```
GOOGLE_API_KEY          # Gemini API (required)
ALPHA_VANTAGE_API_KEY   # 株価 US
TWELVE_DATA_API_KEY     # 株価 JP
FINNHUB_API_KEY         # ニュース + 株価
MARKETAUX_API_KEY       # 金融ニュース
DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD
CLOUD_SQL_CONNECTION_NAME  # 本番のみ
FIREBASE_PROJECT_ID     # Firebase Auth
```

## 変更履歴
- 2026-03-10: Phase 1-3 完了。全7エージェント実装。
- 2026-03-10: Phase 4 完了。@google/adk + @a2a-js/sdk リファクタリング。
- 2026-03-10: Phase 5 完了。DB CRUD + Firebase Auth + 環境変数 + 7日TTL。全作業完了。
- 2026-03-10: DBマイグレーション追加。node-pg-migrate + 初期スキーマ。
