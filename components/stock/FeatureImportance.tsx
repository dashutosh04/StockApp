'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Brain } from 'lucide-react'
import { Prediction } from '@/types'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const COLORS = [
  '#6366f1', '#8b5cf6', '#06b6d4',
  '#10b981', '#f59e0b', '#ef4444',
  '#ec4899', '#84cc16', '#f97316',
]

export default function FeatureImportance({
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
          <Skeleton className="h-64 w-full bg-white/5 rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  if (!prediction) return null

  const chartData = Object.entries(prediction.feature_importance)
    .slice(0, 9)
    .map(([name, value]) => ({ name, value }))

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-white text-lg font-semibold
                              flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          AI Decision Factors
        </CardTitle>
        <p className="text-muted-foreground text-xs">
          Features that influenced the prediction most
        </p>
      </CardHeader>

      <CardContent>
        <div className="h-56 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data   ={chartData}
              layout ="vertical"
              margin ={{ top: 0, right: 20, left: 10, bottom: 0 }}
            >
              <XAxis
                type      ="number"
                domain    ={[0, 100]}
                tick      ={{ fill: '#64748b', fontSize: 11 }}
                tickLine  ={false}
                axisLine  ={false}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type     ="category"
                dataKey  ="name"
                tick     ={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine ={false}
                axisLine ={false}
                width    ={65}
              />
              <Tooltip
                cursor          ={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle    ={{
                  background  : '#12121a',
                  border      : '1px solid #1e1e2e',
                  borderRadius: '12px',
                  color       : '#fff',
                  fontSize    : '12px',
                }}
                formatter={(value: any) => {
                  const numValue = typeof value === 'number' ? value : 0;
                  return [`${numValue.toFixed(1)}%`, 'Importance'];
                }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {chartData.map((_, i) => (
                  <Cell
                    key  ={`cell-${i}`}
                    fill ={COLORS[i % COLORS.length]}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          {chartData.map((item, i) => (
            <div key={item.name}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{item.name}</span>
                <span className="text-white font-medium">
                  {item.value.toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial   ={{ width: 0 }}
                  animate   ={{ width: `${item.value}%` }}
                  transition={{ duration: 0.8, delay: i * 0.08 }}
                  className ="h-full rounded-full"
                  style     ={{ background: COLORS[i % COLORS.length] }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}