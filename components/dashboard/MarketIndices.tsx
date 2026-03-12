"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import { getIndices } from "@/lib/api";
import { MarketIndex } from "@/types";
import { motion } from "framer-motion";

export default function MarketIndices() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getIndices();

        setIndices(data || []);
      } catch (e) {
        console.error("MarketIndices error:", e);
        setIndices([]);
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
      <CardHeader className="pb-4">
        <CardTitle className="text-white text-lg font-semibold">
          Market Indices
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 bg-white/5 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {indices.map((index, i) => {
              const isUp = index.change_pct >= 0;
              return (
                <motion.div
                  key={index.symbol}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-xl p-4 border ${
                    isUp
                      ? "bg-green-400/5  border-green-400/10"
                      : "bg-red-400/5   border-red-400/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground text-xs font-medium">
                      {index.name}
                    </span>
                    {isUp ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <p className="text-white font-bold text-lg">
                    {index.price.toLocaleString()}
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      isUp ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {isUp ? "+" : ""}
                    {index.change_pct.toFixed(2)}%
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
