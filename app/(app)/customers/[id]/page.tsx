import { prisma } from '@/lib/prisma'
import { computeRewardState, LBS_PER_POINT, POINTS_PER_REWARD } from '@/lib/rewards'
import ProgressBar from '@/components/ProgressBar'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      transactions: { orderBy: { effectiveDate: 'desc' } },
      rewards: { orderBy: { earnedAt: 'desc' } },
    },
  })
  if (!customer) notFound()

  const { currentPoints, totalLbs, rewardsEarned } = computeRewardState(
    customer.transactions.map((t) => ({ weight: t.weight, effectiveDate: t.effectiveDate }))
  )
  const pendingRewards = customer.rewards.filter((r) => !r.redeemedAt)
  const lbsInCurrentPoint = Math.floor(totalLbs % LBS_PER_POINT)

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-5">
        <Link href="/customers" className="text-xs text-gray-400 hover:text-orange-500 transition-colors font-medium uppercase tracking-wider">
          ← Customers
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-[20px] p-6 mb-5 shadow-sm dark:shadow-none transition-colors">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{customer.name}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {customer.transactions.length} transactions &middot; {totalLbs.toLocaleString()} lbs total &middot; {rewardsEarned} gift card{rewardsEarned !== 1 ? 's' : ''} earned
            </p>
          </div>
          {pendingRewards.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-500 border border-orange-200 dark:border-orange-500/20 px-4 py-2 rounded-full text-sm font-bold shrink-0 uppercase tracking-wide">
              {pendingRewards.length} card{pendingRewards.length > 1 ? 's' : ''} owed
            </div>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">
            Points toward next gift card — {lbsInCurrentPoint} / {LBS_PER_POINT} lbs in current point
          </p>
          <ProgressBar currentPoints={currentPoints} />
          <p className="text-xs text-gray-400 mt-1.5">
            {POINTS_PER_REWARD - currentPoints} more point{POINTS_PER_REWARD - currentPoints !== 1 ? 's' : ''} needed &middot; {LBS_PER_POINT} lbs per point
          </p>
        </div>
      </div>

      {/* Reward history */}
      {customer.rewards.length > 0 && (
        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-[20px] overflow-hidden mb-5 shadow-sm dark:shadow-none transition-colors">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Reward History</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Earned</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Redeemed On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {customer.rewards.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{new Date(r.earnedAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    {r.redeemedAt
                      ? <span className="text-xs font-semibold text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 px-2.5 py-1 rounded-full uppercase tracking-wide">Redeemed</span>
                      : <span className="text-xs font-semibold text-orange-600 dark:text-orange-500 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 px-2.5 py-1 rounded-full uppercase tracking-wide">Pending</span>
                    }
                  </td>
                  <td className="px-5 py-3 text-gray-500">{r.redeemedAt ? new Date(r.redeemedAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Transactions */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-[20px] overflow-hidden shadow-sm dark:shadow-none transition-colors">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Transaction History</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date &amp; Time</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Weight (lbs)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {customer.transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-5 py-3 text-gray-700 dark:text-gray-300">
                  {new Date(tx.effectiveDate).toLocaleDateString()}{' '}
                  <span className="text-gray-400">{new Date(tx.effectiveDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </td>
                <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{tx.commodityType}</td>
                <td className="px-5 py-3 text-right font-semibold text-gray-900 dark:text-white">{tx.weight.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
