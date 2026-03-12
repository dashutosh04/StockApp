// ── Stock Types ───────────────────────────────────────────────
export interface Quote {
  symbol      : string
  price       : number
  change      : number
  change_pct  : number
  high        : number
  low         : number
  prev_close  : number
  open        : number
}

export interface HistoricalDataPoint {
  date  : string
  open  : number
  high  : number
  low   : number
  close : number
  volume: number
}

export interface StockInfo {
  name            : string
  sector          : string
  industry        : string
  market_cap      : number
  market_cap_fmt  : string
  pe_ratio        : number | null
  eps             : number | null
  week_52_high    : number | null
  week_52_low     : number | null
  avg_volume      : number | null
  avg_volume_fmt  : string
  beta            : number | null
  dividend_yield  : number | null
  description     : string
  logo            : string
  website         : string
  exchange        : string
}

export interface SearchResult {
  symbol     : string
  description: string
  type       : string
}

// ── Prediction Types ──────────────────────────────────────────
export interface ModelInfo {
  trained_at   : string
  age_days     : number
  mape         : number | null
  mae          : number | null
  rmse         : number | null
  rows_trained : number | null
  train_size   : number | null
  test_size    : number | null
}

export interface NewsArticle {
  headline       : string
  summary        : string
  source         : string
  url            : string
  datetime       : number
  image          : string
  sentiment_label: string
  sentiment_score: number
  sentiment_color: string
}

export interface Sentiment {
  overall_score : number
  overall_label : string
  positive_count: number
  negative_count: number
  neutral_count : number
  article_count : number
  articles      : NewsArticle[]
}

export interface Recommendation {
  action     : string
  color      : string
  description: string
}

export interface Prediction {
  symbol            : string
  current_price     : number
  predicted_price   : number
  price_change      : number
  price_change_pct  : number
  trend             : string
  risk              : string
  base_confidence   : number
  confidence        : number
  feature_importance: Record<string, number>
  model_info        : ModelInfo
  sentiment         : Sentiment
  recommendation    : Recommendation
}

// ── Dashboard Types ───────────────────────────────────────────
export interface TrendingStock {
  symbol    : string
  price     : number
  change    : number
  change_pct: number
  volume    : number
}

export interface MarketIndex {
  name      : string
  symbol    : string
  price     : number
  change_pct: number
  trend     : string
}

export interface MarketStatus {
  is_open : boolean
  session : string
  timezone: string
  holiday : string | null
}

export interface MarketOverview {
  market_status    : MarketStatus
  total_stocks     : number
  stocks_up        : number
  stocks_down      : number
  stocks_flat      : number
  pct_up           : number
  pct_down         : number
  total_volume     : number
  total_volume_fmt : string
}

// ── API Response Types ────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  data   : T
  error ?: string
}