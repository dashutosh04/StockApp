'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Newspaper, ExternalLink, Clock } from 'lucide-react'
import { Prediction } from '@/types'
import { formatTimestamp } from '@/lib/utils'
import { motion } from 'framer-motion'

const SENTIMENT_CONFIG = {
  Positive: {
    badge: 'bg-green-400/10 text-green-400 border-green-400/20',
    dot  : 'bg-green-400',
  },
  Negative: {
    badge: 'bg-red-400/10  text-red-400  border-red-400/20',
    dot  : 'bg-red-400',
  },
  Neutral: {
    badge: 'bg-gray-400/10  text-gray-400  border-gray-400/20',
    dot  : 'bg-gray-400',
  },
}

export default function NewsPanel({
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
        <CardContent className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 bg-white/5 rounded-xl" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!prediction) return null

  const { sentiment } = prediction
  const articles      = sentiment.articles ?? []

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg font-semibold
                                flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary" />
            Market News
          </CardTitle>

          {/* Sentiment Summary */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs text-muted-foreground">
                {sentiment.positive_count}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span className="text-xs text-muted-foreground">
                {sentiment.neutral_count}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-xs text-muted-foreground">
                {sentiment.negative_count}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 p-3 bg-white/5 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground">
              Overall Sentiment
            </span>
            <Badge
              variant  ="outline"
              className={`text-xs border ${
                SENTIMENT_CONFIG[
                  sentiment.overall_label as keyof typeof SENTIMENT_CONFIG
                ]?.badge
              }`}
            >
              {sentiment.overall_label} ({sentiment.overall_score.toFixed(2)})
            </Badge>
          </div>

          <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
            {sentiment.positive_count > 0 && (
              <div
                className="bg-green-400 transition-all"
                style={{
                  width: `${(sentiment.positive_count / sentiment.article_count) * 100}%`
                }}
              />
            )}
            {sentiment.neutral_count > 0 && (
              <div
                className="bg-gray-400 transition-all"
                style={{
                  width: `${(sentiment.neutral_count / sentiment.article_count) * 100}%`
                }}
              />
            )}
            {sentiment.negative_count > 0 && (
              <div
                className="bg-red-400 transition-all"
                style={{
                  width: `${(sentiment.negative_count / sentiment.article_count) * 100}%`
                }}
              />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[420px] pr-3">
          {articles.length === 0 ? (
            <div className="text-center py-8">
              <Newspaper className="w-8 h-8 text-muted-foreground
                                    mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                No recent news found
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {articles.map((article, i) => {
                const sentConfig = SENTIMENT_CONFIG[
                  article.sentiment_label as keyof typeof SENTIMENT_CONFIG
                ]

                return (
                  <motion.a
                    key        ={i}
                    href       ={article.url}
                    target     ="_blank"
                    rel        ="noopener noreferrer"
                    initial    ={{ opacity: 0, y: 10 }}
                    animate    ={{ opacity: 1, y: 0  }}
                    transition ={{ delay: i * 0.06 }}
                    className  ="block p-4 bg-white/5 hover:bg-white/8
                                 rounded-xl transition-colors
                                 border border-transparent
                                 hover:border-border group"
                  >
                    <div className="flex items-start
                                    justify-between gap-3 mb-2">
                      <h4 className="text-white text-sm font-medium
                                     leading-snug group-hover:text-primary
                                     transition-colors line-clamp-2">
                        {article.headline}
                      </h4>
                      <ExternalLink className="w-4 h-4 text-muted-foreground
                                               flex-shrink-0 mt-0.5
                                               group-hover:text-primary
                                               transition-colors" />
                    </div>

                    {article.summary && (
                      <p className="text-muted-foreground text-xs
                                    leading-relaxed mb-3 line-clamp-2">
                        {article.summary}
                      </p>
                    )}

                    <div className="flex items-center
                                    justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full
                                         ${sentConfig?.dot}`} />
                        <Badge
                          variant  ="outline"
                          className={`text-xs border px-2 py-0
                                      ${sentConfig?.badge}`}
                        >
                          {article.sentiment_label}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          {article.source}
                        </span>
                      </div>
                      <div className="flex items-center gap-1
                                      text-muted-foreground text-xs">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(article.datetime)}
                      </div>
                    </div>
                  </motion.a>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}