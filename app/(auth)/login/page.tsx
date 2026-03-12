'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TrendingUp, Eye, EyeOff, Loader2 } from 'lucide-react'
import { login } from '@/lib/api'

export default function LoginPage() {
  const router               = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await login(email, password)
      
      if (response && response.length > 0 && response[0].data) {
        const { user, access_token, refresh_token } = response[0].data
        
        // Store tokens and user info
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', refresh_token)
          localStorage.setItem('stockai_user', JSON.stringify(user))
        }
        
        router.push('/dashboard')
      } else {
        setError('Login failed. Please try again.')
      }

    } catch (err: any) {
      console.error('Login error:', err)
      const errorMsg = err?.response?.data?.error?.[0] || 
                       err?.response?.data?.message || 
                       'Login failed. Please check your credentials.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center
                    justify-center px-4">

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72
                        bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72
                        bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial   ={{ opacity: 0, y: 20 }}
        animate   ={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.5 }}
        className ="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl
                            flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-2xl">
              Stock<span className="text-primary">AI</span>
            </span>
          </Link>
          <p className="text-gray-400 mt-3">
            Welcome back! Sign in to continue.
          </p>
        </div>

        {/* Form Card */}
        <div className="glass rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-6">
            Sign In
          </h1>

          {error && (
            <div className="bg-red-400/10 border border-red-400/20
                            rounded-xl p-3 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium
                                text-gray-300 mb-2">
                Email
              </label>
              <input
                type       ="email"
                value      ={email}
                onChange   ={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className  ="w-full bg-white/5 border border-border
                             rounded-xl px-4 py-3 text-white
                             placeholder-gray-600
                             focus:outline-none focus:border-primary
                             transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium
                                text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type       ={showPass ? 'text' : 'password'}
                  value      ={password}
                  onChange   ={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className  ="w-full bg-white/5 border border-border
                               rounded-xl px-4 py-3 text-white
                               placeholder-gray-600 pr-12
                               focus:outline-none focus:border-primary
                               transition-colors"
                />
                <button
                  type    ="button"
                  onClick ={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-white
                             transition-colors"
                >
                  {showPass
                    ? <EyeOff className="w-5 h-5" />
                    : <Eye    className="w-5 h-5" />
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type     ="submit"
              disabled ={loading}
              className="w-full bg-primary hover:bg-primary/90
                         disabled:opacity-50 disabled:cursor-not-allowed
                         text-white font-semibold py-3 rounded-xl
                         transition-all flex items-center
                         justify-center gap-2"
            >
              {loading && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup"
                  className="text-primary hover:underline font-medium">
              Sign up free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}