'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart2 } from 'lucide-react'
import { getHistory } from '@/lib/api'
import { HistoricalDataPoint } from '@/types'
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  HistogramSeries,
} from 'lightweight-charts'

const PERIODS = [
  { label: '1W', value: '1wk' },
  { label: '1M', value: '1mo' },
  { label: '3M', value: '3mo' },
  { label: '6M', value: '6mo' },
  { label: '1Y', value: '1y'  },
  { label: '2Y', value: '2y'  },
]

export default function PriceChart({ symbol }: { symbol: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef          = useRef<IChartApi | null>(null)
  const candleRef         = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeRef         = useRef<ISeriesApi<'Histogram'> | null>(null)

  const [period,  setPeriod]  = useState('1mo')
  const [loading, setLoading] = useState(true)
  const [data,    setData]    = useState<HistoricalDataPoint[]>([])
  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background   : { type: ColorType.Solid, color: 'transparent' },
        textColor    : '#94a3b8',
        fontSize     : 12,
      },
      grid: {
        vertLines  : { color: 'rgba(255,255,255,0.04)' },
        horzLines  : { color: 'rgba(255,255,255,0.04)' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.08)',
      },
      timeScale: {
        borderColor    : 'rgba(255,255,255,0.08)',
        timeVisible    : true,
        secondsVisible : false,
      },
      width : chartContainerRef.current.clientWidth,
      height: 380,
    })

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor        : '#4ade80',
      downColor      : '#f87171',
      borderUpColor  : '#4ade80',
      borderDownColor: '#f87171',
      wickUpColor    : '#4ade80',
      wickDownColor  : '#f87171',
    })

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color      : '#6366f1',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    })

    chartRef.current  = chart
    candleRef.current = candleSeries
    volumeRef.current = volumeSeries

    const resizeObserver = new ResizeObserver(() => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth
        })
      }
    })
    resizeObserver.observe(chartContainerRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const history = await getHistory(symbol, period)
        setData(history)

        if (!candleRef.current || !volumeRef.current) return

        const candleData = history.map((d) => ({
          time : d.date,
          open : d.open,
          high : d.high,
          low  : d.low,
          close: d.close,
        }))

        const volumeData = history.map((d) => ({
          time : d.date,
          value: d.volume,
          color: d.close >= d.open
            ? 'rgba(74,222,128,0.4)'
            : 'rgba(248,113,113,0.4)',
        }))

        candleRef.current.setData(candleData as any)
        volumeRef.current.setData(volumeData as any)
        chartRef.current?.timeScale().fitContent()

      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [symbol, period])

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg font-semibold
                                flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            Price Chart
          </CardTitle>

          <div className="flex items-center gap-1 bg-white/5
                          rounded-xl p-1">
            {PERIODS.map((p) => (
              <Button
                key      ={p.value}
                variant  ="ghost"
                size     ="sm"
                onClick  ={() => setPeriod(p.value)}
                className={`h-7 px-3 text-xs rounded-lg
                            transition-all ${
                  period === p.value
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        {loading && (
          <Skeleton className="h-96 w-full bg-white/5 rounded-xl" />
        )}
        <div
          ref      ={chartContainerRef}
          className={loading ? 'hidden' : 'block'}
        />
      </CardContent>
    </Card>
  )
}