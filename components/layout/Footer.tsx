import Link from 'next/link'
import { TrendingUp, Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center
                        justify-between gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg
                            flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">
              Stock<span className="text-primary">AI</span>
            </span>
          </Link>
          <p className="text-gray-500 text-sm text-center">
            This is powered by AI and can be inaccurate.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/dashboard"
                  className="text-gray-400 hover:text-white
                             transition-colors text-sm">
              Dashboard
            </Link>
            <Link href="/login"
                  className="text-gray-400 hover:text-white
                             transition-colors text-sm">
              Login
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border
                        text-center">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} StockAI.
            Built with Next.js, Flask and XGBoost.
          </p>
        </div>
      </div>
    </footer>
  )
}