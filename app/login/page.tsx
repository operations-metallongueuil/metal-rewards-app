'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError('Incorrect password. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-4 transition-colors duration-200">
      {/* Subtle bg glow in dark mode */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] dark:bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-[20px] p-8 shadow-sm dark:shadow-none transition-colors duration-200">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image src="/logo.svg" alt="Metal Longueuil" width={160} height={50} priority className="hidden dark:block" />
            <Image src="/logo-light.svg" alt="Metal Longueuil" width={160} height={50} priority className="block dark:hidden" />
          </div>

          <p className="text-center text-gray-400 dark:text-gray-500 text-xs mb-7 uppercase tracking-widest font-medium">
            Rewards Tracker
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/15 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-full border-2 border-orange-500 bg-transparent text-gray-900 dark:text-white font-bold text-sm uppercase tracking-widest hover:bg-orange-500 hover:text-white disabled:opacity-40 transition-all duration-200 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
