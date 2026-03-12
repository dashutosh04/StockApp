"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Flame } from "lucide-react";
import { getTrending } from "@/lib/api";
import { TrendingStock } from "@/types";
import { formatPrice, formatChangePct, formatVolume } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";

function StockRow({
  stock,
  index,
  isUp,
}: {
  stock: TrendingStock;
  index: number;
  isUp: boolean;
}) {
  return (
    <Link href={`/stock/${stock.symbol}`}>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="flex items-center justify-between py-3
                     px-3 rounded-xl hover:bg-white/5
                     transition-colors cursor-pointer group"
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg bg-primary/10
                          flex items-center justify-center
                          group-hover:bg-primary/20 transition-colors"
          >
            <span className="text-primary font-bold text-xs">
              {stock.symbol.slice(0, 2)}
            </span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{stock.symbol}</p>
            <p className="text-muted-foreground text-xs">
              Vol: {formatVolume(stock.volume)}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="text-right">
          <p className="text-white font-semibold text-sm">
            {formatPrice(stock.price)}
          </p>
          <Badge
            variant="outline"
            className={`text-xs mt-0.5 border ${
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
        </div>
      </motion.div>
    </Link>
  );
}

export default function TrendingStocks() {
  const [gainers, setGainers] = useState<TrendingStock[]>([]);
  const [losers, setLosers] = useState<TrendingStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getTrending();

        setGainers(data?.gainers || []);
        setLosers(data?.losers || []);
      } catch (e) {
        console.error("TrendingStocks error:", e);
        setGainers([]);
        setLosers([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    const interval = setInterval(fetch, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle
          className="text-white text-lg font-semibold
                              flex items-center gap-2"
        >
          <Flame className="w-5 h-5 text-orange-400" />
          Trending Stocks
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-column">
        <Tabs defaultValue="gainers" className="flex flex-col">
          <TabsList className="w-full bg-white/5 mb-4 h-10 grid grid-cols-2 p-1 rounded-lg">
            <TabsTrigger
              value="gainers"
              className="flex items-center justify-center gap-1
             data-[state=active]:bg-green-400/20
             data-[state=active]:text-green-400
             rounded-md"
            >
              <TrendingUp className="w-4 h-4" />
              Top Gainers
            </TabsTrigger>

            <TabsTrigger
              value="losers"
              className="flex items-center justify-center gap-1
             data-[state=active]:bg-red-400/20
             data-[state=active]:text-red-400
             rounded-md"
            >
              <TrendingDown className="w-4 h-4" />
              Top Losers
            </TabsTrigger>
          </TabsList>

          {/* Gainers */}
          <TabsContent value="gainers">
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-14 bg-white/5 rounded-xl" />
                ))}
              </div>
            ) : (
              <div>
                {gainers.map((stock, i) => (
                  <StockRow
                    key={stock.symbol}
                    stock={stock}
                    index={i}
                    isUp={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Losers */}
          <TabsContent value="losers">
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-14 bg-white/5 rounded-xl" />
                ))}
              </div>
            ) : (
              <div>
                {losers.map((stock, i) => (
                  <StockRow
                    key={stock.symbol}
                    stock={stock}
                    index={i}
                    isUp={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
