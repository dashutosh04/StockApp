'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Database
} from 'lucide-react'
import { Prediction } from '@/types'
import { formatPrice } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function PredictionCard({
  prediction,
  loading,
}: {
  prediction: Prediction | null
  loading   : boolean
}) {
  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <Skeleton className="h-6 w-40 bg-white/5" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full bg-white/5 rounded-xl" />
          <Skeleton className="h-4  w-full bg-white/5" />
          <Skeleton className="h-4  w-3/4 bg-white/5" />
        </CardContent>
      </Card>
    )
  }

  if (!prediction) return null

  const isUp      = prediction.price_change > 0
  const riskColor = {
    Low   : 'text-green-400',
    Medium: 'text-yellow-400',
    High  : 'text-red-400',
  }[prediction.risk] ?? 'text-white'

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-white text-lg font-semibold
                              flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          AI Price Prediction
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className={`rounded-2xl p-5 border ${
          isUp
            ? 'bg-green-400/5  border-green-400/10'
            : 'bg-red-400/5   border-red-400/10'
        }`}>
          <p className="text-muted-foreground text-xs mb-1">
            Predicted Tomorrow's Close
          </p>
          <div className="flex items-end gap-3 mb-2">
            <span className="text-4xl font-bold text-white">
              {formatPrice(prediction.predicted_price)}
            </span>
            <span className={`text-lg font-semibold mb-0.5 ${
              isUp ? 'text-green-400' : 'text-red-400'
            }`}>
              {isUp ? '+' : ''}
              {prediction.price_change_pct.toFixed(2)}%
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            Current: {formatPrice(prediction.current_price)}
            <span className={`ml-2 font-medium ${
              isUp ? 'text-green-400' : 'text-red-400'
            }`}>
              ({isUp ? '+' : ''}{formatPrice(prediction.price_change)})
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-muted-foreground text-xs mb-2">
              Trend
            </p>
            <div className="flex items-center gap-2">
              {isUp
                ? <TrendingUp   className="w-4 h-4 text-green-400" />
                : <TrendingDown className="w-4 h-4 text-red-400"   />
              }
              <span className={`font-semibold text-sm ${
                isUp ? 'text-green-400' : 'text-red-400'
              }`}>
                {prediction.trend}
              </span>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-muted-foreground text-xs mb-2">
              Risk Level
            </p>
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${riskColor}`} />
              <span className={`font-semibold text-sm ${riskColor}`}>
                {prediction.risk}
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-muted-foreground text-xs">
              Confidence Score
            </p>
            <span className="text-white font-bold text-sm">
              {prediction.confidence}%
            </span>
          </div>
          <Progress
            value    ={prediction.confidence}
            className="h-2 bg-white/10"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">
              Base: {prediction.base_confidence}%
            </span>
            <span className="text-xs text-primary">
              Sentiment adjusted
            </span>
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-2">
          <div className="flex items-center gap-1.5 mb-2">
            <Database className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground text-xs font-medium">
              Model Info
            </span>
          </div>
          {[
            {
              label: 'Trained On',
              value: `${prediction.model_info.rows_trained} rows`,
            },
            {
              label: 'Model Age',
              value: `${prediction.model_info.age_days} day(s)`,
            },
            {
              label: 'MAPE',
              value: `${prediction.model_info.mape}%`,
            },
            {
              label: 'Last Trained',
              value: new Date(prediction.model_info.trained_at)
                       .toLocaleDateString(),
            },
          ].map((item) => (
            <div key={item.label}
                 className="flex justify-between items-center">
              <span className="text-muted-foreground text-xs">
                {item.label}
              </span>
              <span className="text-white text-xs font-medium">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}