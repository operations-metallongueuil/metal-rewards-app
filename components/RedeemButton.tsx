'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RedeemButton({ rewardId }: { rewardId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleRedeem() {
    if (!confirm('Mark this reward as redeemed?')) return
    setLoading(true)
    await fetch(`/api/rewards/${rewardId}/redeem`, { method: 'POST' })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleRedeem}
      disabled={loading}
      className="text-xs font-semibold px-4 py-1.5 rounded-full border-2 border-orange-500 text-white bg-black hover:bg-orange-500 disabled:opacity-40 transition-all duration-200 uppercase tracking-wide"
    >
      {loading ? 'Saving...' : 'Mark Redeemed'}
    </button>
  )
}
