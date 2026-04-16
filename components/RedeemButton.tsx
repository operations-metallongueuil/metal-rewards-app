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
      className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors font-medium"
    >
      {loading ? 'Saving...' : 'Mark Redeemed'}
    </button>
  )
}
