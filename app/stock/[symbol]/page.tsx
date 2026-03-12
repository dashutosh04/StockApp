'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  TrendingUp,
  RefreshCw,
  Bookmark,
  BookmarkCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import SearchBar from '@/components/ui/SearchBar'
import LivePricePanel from '@/components/stock/LivePricePanel'
import PriceChart from '@/components/charts/PriceChart'
import PredictionCard from '@/components/stock/PredictionCard'
import RecommendationCard from '@/components/stock/RecommendationCard'
import TechnicalIndicators from '@/components/stock/TechnicalIndicators'
import FeatureImportance from '@/components/stock/FeatureImportance'
import NewsPanel from '@/components/stock/NewsPanel'
import { getPrediction } from '@/lib/api'
import { Prediction } from '@/types'

export default function StockPage() {
  const params   = useParams()
  const router   = useRouter()
  const symbol   = (params.symbol as string).toUpperCase()

  const [prediction,  setPrediction]  = useState<Prediction | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [refreshing,  setRefreshing]  = useState(false)
  const [watched,     setWatched]     = useState(false)
  const [user,        setUser]        = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('stockai_user')
    if (stored) setUser(JSON.parse(stored))

    const watchlist = JSON.parse(
      localStorage.getItem('stockai_watchlist') || '[]'
    )
    setWatched(watchlist.includes(symbol))
  }, [symbol])

  const fetchPrediction = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError('')

    try {
      const data = await getPrediction(symbol)
      setPrediction(data)
    } catch (e: any) {
      setError(
        e?.response?.data?.error
        ?? 'Failed to load prediction. Please try again.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPrediction()
  }, [symbol])

  const toggleWatchlist = () => {
    const watchlist: string[] = JSON.parse(
      localStorage.getItem('stockai_watchlist') || '[]'
    )
    let updated: string[]
    if (watched) {
      updated = watchlist.filter(s => s !== symbol)
    } else {
      updated = [...watchlist, symbol]
    }
    localStorage.setItem('stockai_watchlist', JSON.stringify(updated))
    setWatched(!watched)
  }

  const logout = () => {
    localStorage.removeItem('stockai_user')
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background">

      <header className="sticky top-0 z-40 bg-background/80
                         backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16
                        flex items-center justify-between gap-4">

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/dashboard">
              <Button
                variant ="ghost"
                size    ="icon"
                className="text-muted-foreground hover:text-white h-9 w-9"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/"
                  className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg
                              flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg
                               hidden sm:block">
                Stock<span className="text-primary">AI</span>
              </span>
            </Link>
          </div>

          <div className="flex-1 max-w-md">
            <SearchBar />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant ="ghost"
                    size    ="icon"
                    onClick ={toggleWatchlist}
                    className={`h-9 w-9 ${
                      watched
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-white'
                    }`}
                  >
                    {watched
                      ? <BookmarkCheck className="w-5 h-5" />
                      : <Bookmark      className="w-5 h-5" />
                    }
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {watched ? 'Remove from watchlist' : 'Add to watchlist'}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant   ="ghost"
                    size      ="icon"
                    onClick   ={() => fetchPrediction(true)}
                    disabled  ={refreshing}
                    className ="text-muted-foreground hover:text-white
                                h-9 w-9"
                  >
                    <RefreshCw className={`w-5 h-5 ${
                      refreshing ? 'animate-spin' : ''
                    }`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh Prediction</TooltipContent>
              </Tooltip>

              {user ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="h-8 w-8 cursor-pointer
                                       border border-border">
                      <AvatarFallback className="bg-primary/20
                                                 text-primary text-xs">
                        {user.name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{user.name}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link href="/login">
                  <Button
                    size     ="sm"
                    className="bg-primary hover:bg-primary/90 h-8"
                  >
                    Login
                  </Button>
                </Link>
              )}
            </TooltipProvider>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6
                       space-y-6">

        {error && (
          <div className="bg-red-400/10 border border-red-400/20
                          rounded-xl p-4 text-center">
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <Button
              onClick   ={() => fetchPrediction()}
              variant   ="outline"
              size      ="sm"
              className ="border-red-400/30 text-red-400
                          hover:bg-red-400/10"
            >
              Try Again
            </Button>
          </div>
        )}

        {loading && (
          <motion.div
            initial   ={{ opacity: 0 }}
            animate   ={{ opacity: 1 }}
            className ="bg-primary/10 border border-primary/20
                        rounded-xl p-4 text-center"
          >
            <p className="text-primary text-sm">
              🤖 AI model is analyzing {symbol}...
              This may take 1-2 minutes on first load.
            </p>
          </motion.div>
        )}

        <motion.div
          initial    ={{ opacity: 0, y: 10 }}
          animate    ={{ opacity: 1, y: 0  }}
          transition ={{ delay: 0.1 }}
        >
          <LivePricePanel symbol={symbol} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial    ={{ opacity: 0, y: 10 }}
            animate    ={{ opacity: 1, y: 0  }}
            transition ={{ delay: 0.2 }}
            className  ="lg:col-span-2"
          >
            <PriceChart symbol={symbol} />
          </motion.div>

          <motion.div
            initial    ={{ opacity: 0, y: 10 }}
            animate    ={{ opacity: 1, y: 0  }}
            transition ={{ delay: 0.3 }}
            className  ="lg:col-span-1"
          >
            <PredictionCard
              prediction={prediction}
              loading   ={loading}
            />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial    ={{ opacity: 0, y: 10 }}
            animate    ={{ opacity: 1, y: 0  }}
            transition ={{ delay: 0.4 }}
            className  ="lg:col-span-1"
          >
            <RecommendationCard
              prediction={prediction}
              loading   ={loading}
            />
          </motion.div>

          <motion.div
            initial    ={{ opacity: 0, y: 10 }}
            animate    ={{ opacity: 1, y: 0  }}
            transition ={{ delay: 0.5 }}
            className  ="lg:col-span-2"
          >
            <TechnicalIndicators
              prediction={prediction}
              loading   ={loading}
            />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial    ={{ opacity: 0, y: 10 }}
            animate    ={{ opacity: 1, y: 0  }}
            transition ={{ delay: 0.6 }}
          >
            <FeatureImportance
              prediction={prediction}
              loading   ={loading}
            />
          </motion.div>

          <motion.div
            initial    ={{ opacity: 0, y: 10 }}
            animate    ={{ opacity: 1, y: 0  }}
            transition ={{ delay: 0.7 }}
          >
            <NewsPanel
              prediction={prediction}
              loading   ={loading}
            />
          </motion.div>
        </div>
      </main>
    </div>
  )
}