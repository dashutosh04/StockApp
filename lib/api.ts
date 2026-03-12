import axios from 'axios'
import {
  Quote,
  StockInfo,
  HistoricalDataPoint,
  SearchResult,
  Prediction,
  MarketIndex,
  MarketOverview,
  TrendingStock,
  ApiResponse,
} from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 300000, 
})
function extractData<T>(response: any): T {
  return response.data[0].data
}

export async function searchStocks(
  query: string
): Promise<SearchResult[]> {
  const res = await api.get(`/api/stock/search?q=${query}`)
  return extractData(res)
}

export async function getQuote(
  symbol: string
): Promise<Quote> {
  const res = await api.get(`/api/stock/quote?symbol=${symbol}`)
  return extractData(res)
}

export async function getHistory(
  symbol: string,
  period: string = '1mo'
): Promise<HistoricalDataPoint[]> {
  const res = await api.get(`/api/stock/history?symbol=${symbol}&period=${period}`)
  return extractData(res)
}

export async function getStockInfo(
  symbol: string
): Promise<StockInfo> {
  const res = await api.get(`/api/stock/info?symbol=${symbol}`)
  return extractData(res)
}


export async function getPrediction(
  symbol: string
): Promise<Prediction> {
  const res = await api.get(`/api/predict/?symbol=${symbol}`)
  return extractData(res)
}

export async function retrainModel(symbol: string): Promise<any> {
  const res = await api.post('/api/predict/retrain', { symbol })
  return extractData(res)
}


export async function getNews(
  symbol: string,
  days: number = 7
): Promise<any> {
  const res = await api.get(`/api/news/?symbol=${symbol}&days=${days}`)
  return extractData(res)
}


export async function getTrending(): Promise<{
  gainers: TrendingStock[]
  losers : TrendingStock[]
}> {
  const res = await api.get('/api/dashboard/trending')
  return extractData(res)
}

export async function getIndices(): Promise<MarketIndex[]> {
  const res = await api.get('/api/dashboard/indices')
  return extractData(res)
}

export async function getMarketOverview(): Promise<MarketOverview> {
  const res = await api.get('/api/dashboard/market-overview')
  return extractData(res)
}

export async function getWatchlistQuotes(
  symbols: string[]
): Promise<TrendingStock[]> {
  const res = await api.get(
    `/api/dashboard/watchlist?symbols=${symbols.join(',')}`
  )
  return extractData(res)
}

export async function signup(name: string, email: string, password: string) {
  const res = await api.post('/api/auth/signup', { name, email, password })
  return res.data
}

export async function login(email: string, password: string) {
  const res = await api.post('/api/auth/login', { email, password })
  return res.data
}

export async function getCurrentUser(token: string) {
  const res = await api.get('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.data
}

export async function getUserWatchlist(token: string) {
  const res = await api.get('/api/user/watchlist', {
    headers: { Authorization: `Bearer ${token}` }
  })
  return extractData(res)
}

export async function addToUserWatchlist(token: string, symbol: string) {
  const res = await api.post('/api/user/watchlist/add', 
    { symbol }, 
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return res.data
}

export async function removeFromUserWatchlist(token: string, symbol: string) {
  const res = await api.delete('/api/user/watchlist/remove', {
    headers: { Authorization: `Bearer ${token}` },
    data: { symbol }
  })
  return res.data
}

export async function toggleUserWatchlist(token: string, symbol: string) {
  const res = await api.post('/api/user/watchlist/toggle', 
    { symbol }, 
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return extractData(res)
}