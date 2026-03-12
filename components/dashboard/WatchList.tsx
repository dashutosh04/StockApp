"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Bookmark, TrendingUp, TrendingDown, Plus, X } from "lucide-react";
import { getWatchlistQuotes } from "@/lib/api";
import { TrendingStock } from "@/types";
import { formatPrice, formatChangePct } from "@/lib/utils";
import Link from "next/link";
import SearchBar from "@/components/ui/SearchBar";

const DEFAULT_WATCHLIST = ["AAPL", "TSLA", "NVDA", "MSFT", "GOOGL"];

export default function WatchList() {
  const [symbols, setSymbols] = useState<string[]>(DEFAULT_WATCHLIST);
  const [quotes, setQuotes] = useState<TrendingStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("stockai_watchlist");
      if (stored) setSymbols(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (!mounted) return
    
    const fetchQuotes = async () => {
      if (!symbols.length) {
        setLoading(false);
        return;
      }
      try {
        const data = await getWatchlistQuotes(symbols);
        setQuotes(data || []);
      } catch (e) {
        console.error("WatchList error:", e);
        setQuotes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 30000);
    return () => clearInterval(interval);
  }, [symbols, mounted]);

  const removeSymbol = (symbol: string) => {
    if (typeof window === 'undefined') return
    
    const updated = symbols.filter((s) => s !== symbol);
    setSymbols(updated);
    localStorage.setItem("stockai_watchlist", JSON.stringify(updated));
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle
            className="text-white text-lg font-semibold
                                flex items-center gap-2"
          >
            <Bookmark className="w-5 h-5 text-primary" />
            Watchlist
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {symbols.length}/10
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 bg-white/5 rounded-xl" />
            ))}
          </div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-8">
            <Bookmark className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">
              No stocks in watchlist
            </p>
          </div>
        ) : (
          quotes.map((stock) => {
            const isUp = stock.change_pct >= 0;
            return (
              <div
                key={stock.symbol}
                className="flex items-center justify-between
                           py-2.5 px-3 rounded-xl hover:bg-white/5
                           transition-colors group"
              >
                <Link
                  href={`/stock/${stock.symbol}`}
                  className="flex items-center gap-3 flex-1"
                >
                  <div
                    className="w-8 h-8 rounded-lg bg-primary/10
                                  flex items-center justify-center"
                  >
                    <span className="text-primary font-bold text-xs">
                      {stock.symbol.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {stock.symbol}
                    </p>
                    <p className="text-white text-sm">
                      {formatPrice(stock.price)}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-xs border ${
                      isUp
                        ? "bg-green-400/10 text-green-400 border-green-400/20"
                        : "bg-red-400/10  text-red-400  border-red-400/20"
                    }`}
                  >
                    {isUp ? (
                      <TrendingUp className="w-3 h-3 mr-1 inline" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1 inline" />
                    )}
                    {formatChangePct(stock.change_pct)}
                  </Badge>
                  <button
                    onClick={() => removeSymbol(stock.symbol)}
                    className="opacity-0 group-hover:opacity-100
                               text-muted-foreground hover:text-red-400
                               transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}