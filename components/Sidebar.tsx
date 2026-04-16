'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

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
    <div className="w-52 bg-gray-900 text-white flex flex-col shrink-0">
      <div className="px-5 py-6 border-b border-gray-700">
        <h1 className="text-lg font-bold text-emerald-400">Metal Rewards</h1>
        <p className="text-gray-400 text-xs mt-0.5">Ferrous Tracker</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="px-3 py-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-sm text-gray-400 hover:text-white text-left rounded-lg hover:bg-gray-800 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
