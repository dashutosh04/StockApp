'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { searchStocks } from '@/lib/api'
import { SearchResult } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

export default function SearchBar() {
  const router                      = useRouter()
  const [query,    setQuery]        = useState('')
  const [results,  setResults]      = useState<SearchResult[]>([])
  const [loading,  setLoading]      = useState(false)
  const [open,     setOpen]         = useState(false)
  const [mounted,  setMounted]      = useState(false)
  const containerRef                = useRef<HTMLDivElement>(null)
  const debounceRef                 = useRef<NodeJS.Timeout | undefined>(undefined)

  // Track mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!mounted || typeof document === 'undefined') return
    
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [mounted])

  // Debounced search
  useEffect(() => {
    if (!mounted) return
    
    if (!query.trim()) {
      setResults([])
      setOpen(false)
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchStocks(query)
        setResults(data)
        setOpen(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400)
  }, [query, mounted])

  const handleSelect = (symbol: string) => {
    setQuery('')
    setOpen(false)
    router.push(`/stock/${symbol}`)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2
                           w-4 h-4 text-muted-foreground" />
        <Input
          value      ={query}
          onChange   ={(e) => setQuery(e.target.value)}
          placeholder="Search stocks — AAPL, TSLA, MSFT..."
          className  ="pl-9 pr-9 bg-white/5 border-border
                       text-white placeholder:text-muted-foreground
                       focus-visible:ring-primary h-11"
        />
        {query && (
          <button
            onClick   ={() => { setQuery(''); setOpen(false) }}
            className ="absolute right-3 top-1/2 -translate-y-1/2
                        text-muted-foreground hover:text-white
                        transition-colors"
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <X       className="w-4 h-4" />
            }
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial   ={{ opacity: 0, y: -8 }}
            animate   ={{ opacity: 1, y: 0  }}
            exit      ={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className ="absolute top-full left-0 right-0 mt-2
                        bg-card border border-border rounded-xl
                        overflow-hidden z-50 shadow-xl
                        shadow-black/40"
          >
            {results.map((result, i) => (
              <button
                key      ={result.symbol}
                onClick  ={() => handleSelect(result.symbol)}
                className="w-full flex items-center gap-3 px-4 py-3
                           hover:bg-white/5 transition-colors
                           text-left border-b border-border
                           last:border-0"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10
                                flex items-center justify-center
                                flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">
                    {result.symbol}
                  </p>
                  <p className="text-muted-foreground text-xs truncate">
                    {result.description}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground
                                 bg-white/5 px-2 py-0.5 rounded">
                  {result.type}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}