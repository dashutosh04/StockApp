"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, TrendingDown, Volume2 } from "lucide-react";
import { getMarketOverview } from "@/lib/api";
import { MarketOverview as MarketOverviewType } from "@/types";

export default function MarketOverview() {
  const [data, setData] = useState<MarketOverviewType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMarketOverview();

        setData(res);
      } catch (e) {
        console.error("MarketOverview error:", e);
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg font-semibold">
            US Market Overview
          </CardTitle>
          {loading ? (
            <Skeleton className="h-6 w-16 bg-white/5" />
          ) : (
            data && (
              <Badge
                variant="outline"
                className={`${
                  data.market_status.is_open
                    ? "bg-green-400/10 text-green-400 border-green-400/20"
                    : "bg-red-400/10   text-red-400   border-red-400/20"
                }`}
              >
                <Activity className="w-3 h-3 mr-1" />
                {data.market_status.session}
              </Badge>
            )
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full bg-white/5" />
            <Skeleton className="h-4 w-full bg-white/5" />
            <Skeleton className="h-4 w-3/4 bg-white/5" />
          </div>
        ) : (
          data && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-semibold">
                      {data.stocks_up} Up
                    </span>
                    <span className="text-muted-foreground">
                      ({data.pct_up}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">
                      ({data.pct_down}%)
                    </span>
                    <span className="text-red-400 font-semibold">
                      {data.stocks_down} Down
                    </span>
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  </div>
                </div>

                <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
                  <div
                    className="bg-green-400 rounded-l-full transition-all"
                    style={{ width: `${data.pct_up}%` }}
                  />
                  <div
                    className="bg-red-400 rounded-r-full transition-all"
                    style={{ width: `${data.pct_down}%` }}
                  />
                </div>
              </div>


              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    icon: <TrendingUp className="w-4 h-4 text-green-400" />,
                    label: "Advancing",
                    value: data.stocks_up,
                    color: "text-green-400",
                  },
                  {
                    icon: <TrendingDown className="w-4 h-4 text-red-400" />,
                    label: "Declining",
                    value: data.stocks_down,
                    color: "text-red-400",
                  },
                  {
                    icon: <Volume2 className="w-4 h-4 text-primary" />,
                    label: "Volume",
                    value: data.total_volume_fmt,
                    color: "text-primary",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white/5 rounded-xl p-3 text-center"
                  >
                    <div className="flex justify-center mb-1">{stat.icon}</div>
                    <p className={`font-bold text-lg ${stat.color}`}>
                      {stat.value}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {data.market_status.holiday && (
                <p
                  className="text-xs text-yellow-400 bg-yellow-400/10
                            border border-yellow-400/20 rounded-lg
                            px-3 py-2"
                >
                  🏖️ Holiday: {data.market_status.holiday}
                </p>
              )}
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
