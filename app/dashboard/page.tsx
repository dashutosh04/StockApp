'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { TrendingUp, Bell, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import SearchBar from '@/components/ui/SearchBar'
import MarketIndices from '@/components/dashboard/MarketIndices'
import MarketOverview from '@/components/dashboard/MarketOverview'
import TrendingStocks from '@/components/dashboard/TrendingStocks'
import WatchList from '@/components/dashboard/WatchList'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [time, setTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  // Set mounted flag on client
  useEffect(() => {
    setMounted(true)
    setTime(new Date())
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('stockai_user')
      if (stored) setUser(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [mounted])

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('stockai_user')
    }
    router.push('/')
  }

  const getGreeting = () => {
    if (!time) return 'Hello'
    const h = time.getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80
                         backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16
                        flex items-center justify-between gap-4">

          <Link href="/"
                className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg
                            flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg hidden sm:block">
              Stock<span className="text-primary">AI</span>
            </span>
          </Link>

          <div className="flex-1 max-w-md">
            <SearchBar />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">

            {mounted && time && (
              <span className="text-muted-foreground text-sm
                               hidden lg:block font-mono">
                {time.toLocaleTimeString('en-US', {
                  hour  : '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            )}

            <TooltipProvider>
              {user ? (
                <>
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
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant ="ghost"
                        size    ="icon"
                        onClick ={logout}
                        className="text-muted-foreground
                                   hover:text-red-400 h-8 w-8"
                      >
                        <LogOut className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Logout</TooltipContent>
                  </Tooltip>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant ="ghost" size="sm"
                            className="text-muted-foreground">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm"
                            className="bg-primary hover:bg-primary/90">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </TooltipProvider>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6">

        <motion.div
          initial   ={{ opacity: 0, y: 10 }}
          animate   ={{ opacity: 1, y: 0  }}
          className ="mb-6"
        >
          <h1 className="text-2xl font-bold text-white">
            {getGreeting()}{user ? `, ${user.name.split(' ')[0]}` : ''}! 👋
          </h1>
          {mounted && time && (
            <p className="text-muted-foreground text-sm mt-1">
              {time.toLocaleDateString('en-US', {
                weekday: 'long',
                year   : 'numeric',
                month  : 'long',
                day    : 'numeric',
              })}
            </p>
          )}
        </motion.div>

        <motion.div
          initial    ={{ opacity: 0, y: 10 }}
          animate    ={{ opacity: 1, y: 0  }}
          transition ={{ delay: 0.1 }}
          className  ="mb-6"
        >
          <MarketIndices />
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <motion.div
            initial    ={{ opacity: 0, y: 10 }}
            animate    ={{ opacity: 1, y: 0  }}
            transition ={{ delay: 0.2 }}
            className  ="lg:col-span-1"
          >
            <TrendingStocks />
          </motion.div>
          <motion.div
            initial    ={{ opacity: 0, y: 10 }}
            animate    ={{ opacity: 1, y: 0  }}
            transition ={{ delay: 0.3 }}
            className  ="lg:col-span-1"
          >
            <MarketOverview />
          </motion.div>

          <motion.div
            initial    ={{ opacity: 0, y: 10 }}
            animate    ={{ opacity: 1, y: 0  }}
            transition ={{ delay: 0.4 }}
            className  ="lg:col-span-1"
          >
            <WatchList />
          </motion.div>
        </div>

        <motion.div
          initial    ={{ opacity: 0 }}
          animate    ={{ opacity: 1 }}
          transition ={{ delay: 0.6 }}
          className  ="mt-6 text-center"
        >
          <p className="text-muted-foreground text-sm">
            💡 Search any US stock above to get AI predictions,
            live prices, technical indicators and news sentiment
          </p>
        </motion.div>
      </main>
    </div>
  )
}