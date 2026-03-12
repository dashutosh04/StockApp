'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TrendingUp, Eye, EyeOff, Loader2, Check } from 'lucide-react'
import { signup } from '@/lib/api'

export default function SignupPage() {
  const router                 = useRouter()
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const passwordStrength = (p: string) => {
    if (p.length === 0) return 0
    if (p.length < 4)   return 1
    if (p.length < 8)   return 2
    return 3
  }

  const strength      = passwordStrength(password)
  const strengthLabel = ['', 'Weak', 'Good', 'Strong']
  const strengthColor = [
    '',
    'bg-red-400',
    'bg-yellow-400',
    'bg-green-400',
  ]

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (password.length < 6) {
        setError('Password must be at least 6 characters')
        setLoading(false)
        return
      }

      const response = await signup(name, email, password)
      
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
        setError('Signup failed. Please try again.')
      }

    } catch (err: any) {
      console.error('Signup error:', err)
      const errorMsg = err?.response?.data?.error?.[0] || 
                       err?.response?.data?.message || 
                       'Signup failed. Please try again.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center
                    justify-center px-4 py-12">

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-72 h-72
                        bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72
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
            Create your free account today.
          </p>
        </div>

        {/* Perks */}
        <div className="flex justify-center gap-6 mb-8">
          {[
            'AI Predictions',
            'Live Prices',
            'Sentiment Analysis',
          ].map((perk) => (
            <div key={perk}
                 className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-gray-400 text-xs">{perk}</span>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="glass rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-6">
            Create Account
          </h1>

          {error && (
            <div className="bg-red-400/10 border border-red-400/20
                            rounded-xl p-3 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium
                                text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type       ="text"
                value      ={name}
                onChange   ={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className  ="w-full bg-white/5 border border-border
                             rounded-xl px-4 py-3 text-white
                             placeholder-gray-600
                             focus:outline-none focus:border-primary
                             transition-colors"
              />
            </div>

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
                  placeholder="Min 6 characters"
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
                  className="absolute right-3 top-1/2
                             -translate-y-1/2 text-gray-400
                             hover:text-white transition-colors"
                >
                  {showPass
                    ? <EyeOff className="w-5 h-5" />
                    : <Eye    className="w-5 h-5" />
                  }
                </button>
              </div>

              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key      ={level}
                        className={`h-1 flex-1 rounded-full
                                    transition-all duration-300 ${
                          level <= strength
                            ? strengthColor[strength]
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${
                    strength === 1 ? 'text-red-400'    :
                    strength === 2 ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {strengthLabel[strength]} password
                  </p>
                </div>
              )}
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login"
                  className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}