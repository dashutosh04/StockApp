'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldCheck
} from 'lucide-react'
import { Prediction } from '@/types'
import { motion } from 'framer-motion'

const ACTION_CONFIG: Record<string, {
  bg     : string
  border : string
  text   : string
  icon   : React.ReactNode
  glow   : string
}> = {
  'STRONG BUY': {
    bg    : 'bg-green-400/10',
    border: 'border-green-400/30',
    text  : 'text-green-400',
    glow  : 'glow-green',
    icon  : <TrendingUp className="w-8 h-8 text-green-400" />,
  },
  'BUY': {
    bg    : 'bg-green-400/5',
    border: 'border-green-400/20',
    text  : 'text-green-400',
    glow  : '',
    icon  : <TrendingUp className="w-8 h-8 text-green-400" />,
  },
  'WEAK BUY': {
    bg    : 'bg-yellow-400/5',
    border: 'border-yellow-400/20',
    text  : 'text-yellow-400',
    glow  : '',
    icon  : <TrendingUp className="w-8 h-8 text-yellow-400" />,
  },
  'HOLD': {
    bg    : 'bg-blue-400/5',
    border: 'border-blue-400/20',
    text  : 'text-blue-400',
    glow  : '',
    icon  : <Minus className="w-8 h-8 text-blue-400" />,
  },
  'WEAK SELL': {
    bg    : 'bg-red-400/5',
    border: 'border-red-400/20',
    text  : 'text-red-400',
    glow  : '',
    icon  : <TrendingDown className="w-8 h-8 text-red-400" />,
  },
  'STRONG SELL': {
    bg    : 'bg-red-400/10',
    border: 'border-red-400/30',
    text  : 'text-red-400',
    glow  : 'glow-red',
    icon  : <TrendingDown className="w-8 h-8 text-red-400" />,
  },
}

export default function RecommendationCard({
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
          <Skeleton className="h-6 w-48 bg-white/5" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full bg-white/5 rounded-2xl" />
        </CardContent>
      </Card>
    )
  }

  if (!prediction) return null

  const action = prediction.recommendation.action
  const config = ACTION_CONFIG[action] ?? ACTION_CONFIG['HOLD']

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-white text-lg font-semibold
                              flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          AI Recommendation
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* Main Action Block */}
        <motion.div
          initial   ={{ scale: 0.95, opacity: 0 }}
          animate   ={{ scale: 1,    opacity: 1 }}
          className ={`rounded-2xl p-6 border text-center ${
            config.bg
          } ${config.border} ${config.glow}`}
        >
          <div className="flex justify-center mb-3">
            {config.icon}
          </div>
          <h2 className={`text-3xl font-bold mb-2 ${config.text}`}>
            {action}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {prediction.recommendation.description}
          </p>
        </motion.div>

        {/* Signal Breakdown */}
        <div className="space-y-3">
          <p className="text-muted-foreground text-xs font-medium uppercase
                        tracking-wider">
            Signal Breakdown
          </p>

          <div className="flex items-center justify-between
                          bg-white/5 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-sm text-white">AI Trend Signal</span>
            </div>
            <span className={`text-sm font-semibold ${
              prediction.trend === 'Bullish'
                ? 'text-green-400'
                : 'text-red-400'
            }`}>
              {prediction.trend}
            </span>
          </div>

          <div className="flex items-center justify-between
                          bg-white/5 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-white">News Sentiment</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${
                prediction.sentiment.overall_label === 'Positive'
                  ? 'text-green-400'
                  : prediction.sentiment.overall_label === 'Negative'
                  ? 'text-red-400'
                  : 'text-gray-400'
              }`}>
                {prediction.sentiment.overall_label}
              </span>
              <span className="text-xs text-muted-foreground">
                ({prediction.sentiment.overall_score.toFixed(2)})
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between
                          bg-white/5 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-sm text-white">Confidence</span>
            </div>
            <span className="text-sm font-semibold text-primary">
              {prediction.confidence}%
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center
                      border-t border-border pt-3">
          ⚠️ AI Prediction and can be wrong.
        </p>
      </CardContent>
    </Card>
  )
}