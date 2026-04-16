'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch — only render after client mount
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-8" />

  return (
    <div className="flex items-center bg-gray-100 dark:bg-white/10 rounded-full p-1 w-full">
      <button
        onClick={() => setTheme('light')}
        className={`flex-1 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
          theme === 'light'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        }`}
      >
        Light
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`flex-1 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
          theme === 'dark'
            ? 'bg-[#1a1a1a] text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        }`}
      >
        Dark
      </button>
    </div>
  )
}
