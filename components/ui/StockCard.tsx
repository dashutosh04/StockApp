import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { TrendingStock } from '@/types'
import {
  formatPrice,
  formatChangePct,
  formatVolume
} from '@/lib/utils'
import Link from 'next/link'

export default function StockCard({
  stock
}: {
  stock: TrendingStock
}) {
  const isUp = stock.change_pct >= 0

  return (
    <Link href={`/stock/${stock.symbol}`}>
      <Card className="bg-card border-border hover:border-primary/30
                       transition-all duration-200 cursor-pointer
                       hover:shadow-lg hover:shadow-primary/5 p-4
                       group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10
                            flex items-center justify-center
                            group-hover:bg-primary/20
                            transition-colors">
              <span className="text-primary font-bold text-xs">
                {stock.symbol.slice(0, 2)}
              </span>
            </div>
            <span className="text-white font-semibold">
              {stock.symbol}
            </span>
          </div>

          <Badge
            variant  ="outline"
            className={`text-xs border ${
              isUp
                ? 'bg-green-400/10 text-green-400 border-green-400/20'
                : 'bg-red-400/10  text-red-400  border-red-400/20'
            }`}
          >
            {isUp
              ? <TrendingUp   className="w-3 h-3 mr-1 inline" />
              : <TrendingDown className="w-3 h-3 mr-1 inline" />
            }
            {formatChangePct(stock.change_pct)}
          </Badge>
        </div>

        <p className="text-2xl font-bold text-white mb-1">
          {formatPrice(stock.price)}
        </p>

        <p className={`text-sm font-medium ${
          isUp ? 'text-green-400' : 'text-red-400'
        }`}>
          {isUp ? '+' : ''}{formatPrice(stock.change)} today
        </p>

        <p className="text-xs text-muted-foreground mt-2">
          Vol: {formatVolume(stock.volume)}
        </p>
      </Card>
    </Link>
  )
}