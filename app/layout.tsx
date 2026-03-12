import type { Metadata } from 'next'
import './globals.css'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title      : 'StockAI — AI Powered Stock Predictions',
  description: 'Predict stock prices using machine learning and sentiment analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="bg-background text-white antialiased">
        {children}
      </body>
    </html>
  )
}