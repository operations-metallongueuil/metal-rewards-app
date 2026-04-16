'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import ThemeToggle from './ThemeToggle'

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/customers', label: 'Customers' },
  { href: '/rewards', label: 'Rewards' },
  { href: '/import', label: 'Import' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div className="w-56 bg-white dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-white/10 flex flex-col shrink-0 transition-colors duration-200">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-200 dark:border-white/10">
        {/* Dark mode logo (white text) */}
        <Image src="/logo.svg" alt="Metal Longueuil" width={140} height={44} priority className="hidden dark:block" />
        {/* Light mode logo (dark text) */}
        <Image src="/logo-light.svg" alt="Metal Longueuil" width={140} height={44} priority className="block dark:hidden" />
        <p className="text-gray-400 dark:text-gray-500 text-[11px] mt-2 uppercase tracking-widest font-medium">
          Rewards Tracker
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 border ${
                isActive
                  ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-200 dark:border-orange-500/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 border-transparent'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom controls */}
      <div className="px-3 pb-4 space-y-2 border-t border-gray-200 dark:border-white/10 pt-3">
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-sm text-gray-400 dark:text-gray-500 hover:text-orange-500 dark:hover:text-orange-500 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-150 font-medium"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
