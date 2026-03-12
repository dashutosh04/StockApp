'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
  TrendingUp,
  Brain,
  Newspaper,
  BarChart2,
  Shield,
  Zap,
  ArrowRight,
} from 'lucide-react'

function Counter({
  end,
  suffix = '',
  duration = 2,
}: {
  end     : number
  suffix ?: string
  duration?: number
}) {
  const [count, setCount]     = useState(0)
  const [started, setStarted] = useState(false)
  const ref                   = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [started, end, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon       : React.ReactNode
  title      : string
  description: string
  delay      : number
}) {
  return (
    <motion.div
      initial    ={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition ={{ duration: 0.5, delay }}
      viewport   ={{ once: true }}
      className  ="glass rounded-2xl p-6 hover:border-primary/40
                   transition-all duration-300 group cursor-default"
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10
                      flex items-center justify-center mb-4
                      group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-400 text-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}

const TICKER_DATA = [
  { symbol: 'AAPL',  price: '\$182.34', change: '+1.4%', up: true  },
  { symbol: 'NVDA',  price: '\$720.50', change: '+3.2%', up: true  },
  { symbol: 'TSLA',  price: '\$210.12', change: '-0.7%', up: false },
  { symbol: 'MSFT',  price: '\$415.20', change: '+0.8%', up: true  },
  { symbol: 'GOOGL', price: '\$141.23', change: '+1.1%', up: true  },
  { symbol: 'AMZN',  price: '\$178.90', change: '+2.3%', up: true  },
  { symbol: 'META',  price: '\$485.60', change: '-0.3%', up: false },
  { symbol: 'JPM',   price: '\$198.45', change: '+0.5%', up: true  },
]

function TickerTape() {
  return (
    <div className="w-full overflow-hidden bg-surface/50
                    border-y border-border py-3">
      <div className="flex animate-marquee whitespace-nowrap gap-0">
        {[...TICKER_DATA, ...TICKER_DATA].map((item, i) => (
          <div key={i} className="flex items-center gap-2 mx-8">
            <span className="text-white font-semibold text-sm">
              {item.symbol}
            </span>
            <span className="text-gray-400 text-sm">
              {item.price}
            </span>
            <span className={`text-sm font-medium ${
              item.up ? 'text-green-400' : 'text-red-400'
            }`}>
              {item.change}
            </span>
            <span className="text-border ml-6">|</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MockPredictionCard() {
  return (
    <motion.div
      initial   ={{ opacity: 0, scale: 0.95, y: 20 }}
      animate   ={{ opacity: 1, scale: 1,    y: 0  }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className ="glass rounded-2xl p-6 w-full max-w-sm
                  border border-primary/20 glow"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20
                          flex items-center justify-center">
            <span className="text-primary font-bold text-sm">AI</span>
          </div>
          <div>
            <p className="text-white font-semibold">AAPL</p>
            <p className="text-gray-400 text-xs">Apple Inc.</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium
                         bg-green-400/10 text-green-400
                         border border-green-400/20">
          STRONG BUY
        </span>
      </div>

      <div className="mb-6">
        <p className="text-gray-400 text-xs mb-1">Predicted Tomorrow</p>
        <div className="flex items-end gap-3">
          <span className="text-4xl font-bold text-white">\$186.90</span>
          <span className="text-green-400 font-semibold mb-1">+2.5%</span>
        </div>
        <p className="text-gray-500 text-xs mt-1">Current: \$182.34</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'Trend',      value: 'Bullish',  color: 'text-green-400' },
          { label: 'Confidence', value: '92%',      color: 'text-primary'   },
          { label: 'Sentiment',  value: 'Positive', color: 'text-green-400' },
          { label: 'Risk',       value: 'Medium',   color: 'text-yellow-400'},
        ].map((item) => (
          <div key={item.label}
               className="bg-white/5 rounded-xl p-3">
            <p className="text-gray-400 text-xs mb-1">{item.label}</p>
            <p className={`font-semibold text-sm ${item.color}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-gray-400 text-xs mb-3">AI Decision Factors</p>
        {[
          { label: 'MA10',   pct: 35 },
          { label: 'RSI',    pct: 22 },
          { label: 'Volume', pct: 18 },
          { label: 'MACD',   pct: 14 },
        ].map((item) => (
          <div key={item.label}
               className="flex items-center gap-2 mb-2">
            <span className="text-gray-500 text-xs w-12">
              {item.label}
            </span>
            <div className="flex-1 bg-white/5 rounded-full h-1.5">
              <motion.div
                initial   ={{ width: 0 }}
                animate   ={{ width: `${item.pct}%` }}
                transition={{ duration: 1.2, delay: 0.8 }}
                className ="bg-gradient-to-r from-primary
                            to-secondary h-1.5 rounded-full"
              />
            </div>
            <span className="text-gray-500 text-xs w-8 text-right">
              {item.pct}%
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function StepCard({
  number,
  title,
  description,
  delay,
}: {
  number     : number
  title      : string
  description: string
  delay      : number
}) {
  return (
    <motion.div
      initial    ={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0  }}
      transition ={{ duration: 0.5, delay }}
      viewport   ={{ once: true }}
      className  ="flex gap-4"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full
                      bg-primary/20 border border-primary/30
                      flex items-center justify-center
                      text-primary font-bold text-sm">
        {number}
      </div>
      <div>
        <h4 className="text-white font-semibold mb-1">{title}</h4>
        <p className="text-gray-400 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  )
}

export default function LandingPage() {

  const features = [
    {
      icon       : <TrendingUp className="w-6 h-6 text-primary" />,
      title      : 'AI Price Prediction',
      description: 'XGBoost model trained on 2 years of data predicts next-day prices with technical indicators as features.',
      delay      : 0.1,
    },
    {
      icon       : <Newspaper className="w-6 h-6 text-primary" />,
      title      : 'Sentiment Analysis',
      description: 'VADER analyzes real-time news headlines to score market sentiment around any US stock.',
      delay      : 0.2,
    },
    {
      icon       : <Brain className="w-6 h-6 text-primary" />,
      title      : 'Smart Recommendations',
      description: 'Buy, Sell or Hold signals by combining AI trend prediction with live news sentiment scores.',
      delay      : 0.3,
    },
    {
      icon       : <BarChart2 className="w-6 h-6 text-primary" />,
      title      : 'Technical Indicators',
      description: 'Full suite including RSI, MACD, Bollinger Bands, ATR and Moving Averages shown visually.',
      delay      : 0.4,
    },
    {
      icon       : <Shield className="w-6 h-6 text-primary" />,
      title      : 'Risk Assessment',
      description: 'Every prediction includes a risk label and confidence score adjusted by sentiment analysis.',
      delay      : 0.5,
    },
    {
      icon       : <Zap className="w-6 h-6 text-primary" />,
      title      : 'Live Market Data',
      description: 'Real-time prices, market indices, trending stocks and market overview updated every minute.',
      delay      : 0.6,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative min-h-screen flex items-center
                          justify-center overflow-hidden pt-20">

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96
                          bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96
                          bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-[600px]
                          h-[600px] -translate-x-1/2 -translate-y-1/2
                          bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6
                        flex flex-col lg:flex-row items-center
                        gap-16 py-24">

          <div className="flex-1 text-center lg:text-left">

            <motion.div
              initial   ={{ opacity: 0, y: 20 }}
              animate   ={{ opacity: 1, y: 0  }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4
                               py-2 rounded-full bg-primary/10
                               border border-primary/20 text-primary
                               text-sm font-medium mb-6">
                <Zap className="w-3.5 h-3.5" />
                AI Powered Stock Predictions
              </span>
            </motion.div>

            <motion.h1
              initial   ={{ opacity: 0, y: 20 }}
              animate   ={{ opacity: 1, y: 0  }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className ="text-5xl lg:text-7xl font-bold
                          text-white leading-tight mb-6"
            >
              Predict Stocks
              <br />
              <span className="gradient-text">With AI</span>
            </motion.h1>

            <motion.p
              initial   ={{ opacity: 0, y: 20 }}
              animate   ={{ opacity: 1, y: 0  }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className ="text-gray-400 text-lg lg:text-xl
                          leading-relaxed mb-10 max-w-xl
                          mx-auto lg:mx-0"
            >
              Machine learning meets market sentiment.
              Get AI-powered next-day price predictions,
              news sentiment analysis, and smart
              Buy/Sell recommendations for any US stock.
            </motion.p>

            <motion.div
              initial   ={{ opacity: 0, y: 20 }}
              animate   ={{ opacity: 1, y: 0  }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className ="flex flex-col sm:flex-row gap-4
                          justify-center lg:justify-start"
            >
              <Link href="/signup">
                <button className="flex items-center gap-2 px-8 py-4
                                   bg-primary hover:bg-primary/90
                                   text-white font-semibold rounded-xl
                                   transition-all duration-200
                                   shadow-lg shadow-primary/25 glow">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="flex items-center gap-2 px-8 py-4
                                   glass hover:border-primary/30
                                   text-white font-semibold rounded-xl
                                   transition-all duration-200">
                  View Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>
          </div>
          <div className="flex-1 flex justify-center lg:justify-end">
            <MockPredictionCard />
          </div>
        </div>
      </section>
      <TickerTape />
      <section className="py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { end: 500,  suffix: '+',  label: 'Stocks Covered'      },
              { end: 95,   suffix: '%',  label: 'Prediction Accuracy'  },
              { end: 2,    suffix: 'yr', label: 'Training Data'        },
              { end: 16,   suffix: '',   label: 'Technical Indicators' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial    ={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0  }}
                transition ={{ duration: 0.5, delay: i * 0.1 }}
                viewport   ={{ once: true }}
                className  ="text-center"
              >
                <div className="text-4xl lg:text-5xl font-bold
                                gradient-text mb-2">
                  <Counter
                    end     ={stat.end}
                    suffix  ={stat.suffix}
                    duration={2}
                  />
                </div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial    ={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0  }}
            transition ={{ duration: 0.5 }}
            viewport   ={{ once: true }}
            className  ="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold
                           text-white mb-4">
              Everything You Need To
              <span className="gradient-text"> Invest Smarter</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A complete AI-powered toolkit combining machine learning,
              sentiment analysis and real-time market data.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2
                          lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-border" id="how">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2
                          gap-16 items-center">

            <div>
              <motion.div
                initial    ={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0  }}
                transition ={{ duration: 0.5 }}
                viewport   ={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-white mb-4">
                  How It
                  <span className="gradient-text"> Works</span>
                </h2>
                <p className="text-gray-400 mb-10 leading-relaxed">
                  Our system combines historical price data,
                  technical indicators and live news sentiment
                  to generate accurate predictions.
                </p>
              </motion.div>

              <div className="space-y-8">
                {[
                  {
                    number     : 1,
                    title      : 'Search Any US Stock',
                    description: 'Enter a ticker symbol like AAPL or TSLA. Our system fetches 2 years of historical data automatically.',
                    delay      : 0.1,
                  },
                  {
                    number     : 2,
                    title      : 'AI Model Trains & Predicts',
                    description: 'XGBoost model calculates 16 technical indicators and predicts next-day closing price.',
                    delay      : 0.2,
                  },
                  {
                    number     : 3,
                    title      : 'Sentiment Analysis Runs',
                    description: 'Latest news headlines are fetched and analyzed by VADER to score market sentiment.',
                    delay      : 0.3,
                  },
                  {
                    number     : 4,
                    title      : 'Get Your Recommendation',
                    description: 'Prediction + sentiment are combined to generate a final Buy, Sell or Hold signal with confidence score.',
                    delay      : 0.4,
                  },
                ].map((step) => (
                  <StepCard key={step.number} {...step} />
                ))}
              </div>
            </div>

            <motion.div
              initial    ={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0  }}
              transition ={{ duration: 0.6 }}
              viewport   ={{ once: true }}
              className  ="glass rounded-2xl p-8"
            >
          
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-white font-bold text-xl">NVDA</p>
                  <p className="text-gray-400 text-sm">NVIDIA Corporation</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-xl">\$720.50</p>
                  <p className="text-green-400 text-sm">+3.2%</p>
                </div>
              </div>

              <div className="h-32 flex items-end gap-1 mb-6">
                {[40, 55, 45, 60, 50, 70, 65, 80, 72, 85,
                  78, 90, 82, 95, 88].map((h, i) => (
                  <motion.div
                    key={i}
                    initial   ={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    viewport  ={{ once: true }}
                    className ={`flex-1 rounded-sm ${
                      i % 3 === 0
                        ? 'bg-red-400/60'
                        : 'bg-green-400/60'
                    }`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'RSI',  value: '67',       color: 'text-yellow-400' },
                  { label: 'MACD', value: 'Positive', color: 'text-green-400'  },
                  { label: 'MA20', value: '\$698.40',  color: 'text-primary'    },
                ].map((ind) => (
                  <div key={ind.label}
                       className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-gray-400 text-xs mb-1">
                      {ind.label}
                    </p>
                    <p className={`text-sm font-semibold ${ind.color}`}>
                      {ind.value}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-border">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial    ={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0  }}
            transition ={{ duration: 0.6 }}
            viewport   ={{ once: true }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20
                              rounded-full blur-3xl" />
              <div className="relative glass rounded-3xl p-12
                              border border-primary/20">
                <h2 className="text-4xl lg:text-5xl font-bold
                               text-white mb-4">
                  Start Predicting
                  <span className="gradient-text"> Today</span>
                </h2>
                <p className="text-gray-400 text-lg mb-8
                              max-w-xl mx-auto">
                  Join and get AI-powered stock predictions,
                  sentiment analysis and smart recommendations
                  completely free.
                </p>
                <div className="flex flex-col sm:flex-row gap-4
                                justify-center">
                  <Link href="/signup">
                    <button className="flex items-center gap-2
                                       px-8 py-4 bg-primary
                                       hover:bg-primary/90
                                       text-white font-semibold
                                       rounded-xl transition-all
                                       shadow-lg shadow-primary/25">
                      Create Free Account
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                  <Link href="/dashboard">
                    <button className="flex items-center gap-2
                                       px-8 py-4 glass
                                       hover:border-primary/30
                                       text-white font-semibold
                                       rounded-xl transition-all">
                      Explore Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}