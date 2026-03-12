'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [scrolled,     setScrolled]     = useState(false)
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [mounted,      setMounted]      = useState(false)
  const pathname                        = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'Features',  href: '#features' },
    { label: 'How It Works', href: '#how'   },
    { label: 'Dashboard', href: '/dashboard'},
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50
                     transition-all duration-300 ${
                       scrolled
                         ? 'bg-background/80 backdrop-blur-xl border-b border-border'
                         : 'bg-transparent'
                     }`}>
      <div className="max-w-7xl mx-auto px-6 h-16
                      flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg
                          flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">
            Stock<span className="text-primary">AI</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key  ={link.label}
              href ={link.href}
              className="text-gray-400 hover:text-white
                         transition-colors text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <button className="text-gray-400 hover:text-white
                               transition-colors text-sm
                               font-medium px-4 py-2">
              Login
            </button>
          </Link>
          <Link href="/signup">
            <button className="bg-primary hover:bg-primary/90
                               text-white text-sm font-semibold
                               px-4 py-2 rounded-lg transition-all">
              Get Started
            </button>
          </Link>
        </div>

        <button
          className ="md:hidden text-gray-400 hover:text-white"
          onClick   ={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen
            ? <X className="w-6 h-6" />
            : <Menu className="w-6 h-6" />
          }
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial  ={{ opacity: 0, height: 0 }}
            animate  ={{ opacity: 1, height: 'auto' }}
            exit     ={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface border-b border-border px-6 py-4"
          >
            <div className="flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key     ={link.label}
                  href    ={link.href}
                  onClick ={() => setMobileOpen(false)}
                  className="text-gray-400 hover:text-white
                             transition-colors text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-3 pt-2 border-t border-border">
                <Link href="/login" className="flex-1">
                  <button className="w-full glass py-2 rounded-lg
                                     text-white text-sm font-medium">
                    Login
                  </button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <button className="w-full bg-primary py-2
                                     rounded-lg text-white
                                     text-sm font-semibold">
                    Sign Up
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}