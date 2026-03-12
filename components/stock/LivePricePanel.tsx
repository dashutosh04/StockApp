'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import { getQuote, getStockInfo } from '@/lib/api'
import { Quote, StockInfo } from '@/types'
import { formatPrice, formatChangePct, formatVolume } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export default function LivePricePanel({ symbol }: { symbol: string }) {
  const [quote,     setQuote]     = useState<Quote | null>(null)
  const [info,      setInfo]      = useState<StockInfo | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [flash,     setFlash]     = useState<'up' | 'down' | null>(null)
  const prevPrice               = useState<number>(0)

  const fetchData = async () => {
    try {
      const [quoteData, infoData] = await Promise.all([
        getQuote(symbol),
        getStockInfo(symbol),
      ])

      // Flash animation when price changes
      if (quote && quoteData.price !== quote.price) {
        setFlash(quoteData.price > quote.price ? 'up' : 'down')
        setTimeout(() => setFlash(null), 800)
      }

      setQuote(quoteData)
      setInfo(infoData)
      setLastUpdate(new Date())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [symbol])

  const isUp = (quote?.change_pct ?? 0) >= 0

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center
                          justify-between gap-6">
            <div className="space-y-3">
              <Skeleton className="h-8  w-48 bg-white/5" />
              <Skeleton className="h-14 w-64 bg-white/5" />
              <Skeleton className="h-5  w-32 bg-white/5" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-28 bg-white/5 rounded-xl" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!quote || !info) return null

  return (
    <Card className={`border transition-all duration-500 ${
      flash === 'up'
        ? 'border-green-400/40 bg-green-400/5'
        : flash === 'down'
        ? 'border-red-400/40  bg-red-400/5'
        : 'bg-card border-border'
    }`}>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row
                        lg:items-center justify-between gap-6">
          <div>

            <div className="flex items-center gap-3 mb-4">
              {info.logo ? (
                <img
                  src      ={info.logo}
                  alt      ={info.name}
                  className="w-10 h-10 rounded-xl object-contain
                             bg-white p-1"
                  onError  ={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-primary/20
                                flex items-center justify-center">
                  <span className="text-primary font-bold">
                    {symbol.slice(0, 2)}
                  </span>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-white font-bold text-xl">
                    {symbol}
                  </h1>
                  <Badge
                    variant  ="outline"
                    className="text-xs border-border
                               text-muted-foreground"
                  >
                    {info.exchange}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  {info.name}
                </p>
              </div>
              {info.website && (
                <a
                  href     ={info.website}
                  target   ="_blank"
                  rel      ="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary
                             transition-colors ml-2"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Price */}
            <AnimatePresence mode="wait">
              <motion.div
                key       ={quote.price}
                initial   ={{ opacity: 0.5, y: -5 }}
                animate   ={{ opacity: 1,   y: 0   }}
                className ="flex items-end gap-4 mb-2"
              >
                <span className="text-5xl font-bold text-white">
                  {formatPrice(quote.price)}
                </span>
                <div className="mb-1">
                  <Badge
                    variant  ="outline"
                    className={`text-sm px-3 py-1 border ${
                      isUp
                        ? 'bg-green-400/10 text-green-400 border-green-400/20'
                        : 'bg-red-400/10  text-red-400  border-red-400/20'
                    }`}
                  >
                    {isUp
                      ? <TrendingUp   className="w-4 h-4 mr-1 inline" />
                      : <TrendingDown className="w-4 h-4 mr-1 inline" />
                    }
                    {formatChangePct(quote.change_pct)}
                  </Badge>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-3">
              <p className={`text-sm font-medium ${
                isUp ? 'text-green-400' : 'text-red-400'
              }`}>
                {isUp ? '+' : ''}{formatPrice(quote.change)} today
              </p>
              <span className="text-border">•</span>
              <div className="flex items-center gap-1
                              text-muted-foreground text-xs">
                <RefreshCw className="w-3 h-3" />
                {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                label: 'Open',
                value: formatPrice(quote.open),
              },
              {
                label: 'Prev Close',
                value: formatPrice(quote.prev_close),
              },
              {
                label: 'Day High',
                value: formatPrice(quote.high),
                color: 'text-green-400',
              },
              {
                label: 'Day Low',
                value: formatPrice(quote.low),
                color: 'text-red-400',
              },
              {
                label: 'Market Cap',
                value: info.market_cap_fmt,
              },
              {
                label: 'P/E Ratio',
                value: info.pe_ratio?.toFixed(2) ?? 'N/A',
              },
              {
                label: '52W High',
                value: info.week_52_high
                  ? formatPrice(info.week_52_high)
                  : 'N/A',
                color: 'text-green-400',
              },
              {
                label: '52W Low',
                value: info.week_52_low
                  ? formatPrice(info.week_52_low)
                  : 'N/A',
                color: 'text-red-400',
              },
            ].map((stat) => (
              <div
                key      ={stat.label}
                className="bg-white/5 rounded-xl p-3"
              >
                <p className="text-muted-foreground text-xs mb-1">
                  {stat.label}
                </p>
                <p className={`font-semibold text-sm ${
                  stat.color ?? 'text-white'
                }`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}