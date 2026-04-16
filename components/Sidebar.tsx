'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'

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
    <div className="w-56 bg-[#1a1a1a] border-r border-white/10 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <Image src="/logo.svg" alt="Metal Longueuil" width={140} height={44} priority />
        <p className="text-gray-500 text-[11px] mt-2 uppercase tracking-widest font-medium">
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
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-sm text-gray-500 hover:text-orange-500 text-left rounded-lg hover:bg-white/5 transition-all duration-150 font-medium"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
