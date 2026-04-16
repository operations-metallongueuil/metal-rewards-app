import { prisma } from '@/lib/prisma'
import { computeRewardState, LBS_PER_POINT, POINTS_PER_REWARD } from '@/lib/rewards'
import ProgressBar from '@/components/ProgressBar'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CustomerDetailPage({
  params,
}: {
  params: { id: string }
}) {
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
      <div className="mb-4">
        <Link href="/customers" className="text-sm text-gray-500 hover:text-emerald-600">
          ← Customers
        </Link>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {customer.transactions.length} transactions &middot;{' '}
              {totalLbs.toLocaleString()} lbs total &middot; {rewardsEarned} gift card
              {rewardsEarned !== 1 ? 's' : ''} earned
            </p>
          </div>
          {pendingRewards.length > 0 && (
            <div className="bg-amber-100 text-amber-700 px-3 py-2 rounded-lg text-sm font-semibold shrink-0">
              {pendingRewards.length} gift card{pendingRewards.length > 1 ? 's' : ''} owed
            </div>
          )}
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
            Points toward next gift card — {lbsInCurrentPoint} / {LBS_PER_POINT} lbs in current point
          </p>
          <ProgressBar currentPoints={currentPoints} />
          <p className="text-xs text-gray-400 mt-1">
            {POINTS_PER_REWARD - currentPoints} more point{POINTS_PER_REWARD - currentPoints !== 1 ? 's' : ''} needed &middot; each point = {LBS_PER_POINT} lbs
          </p>
        </div>
      </div>

      {/* Reward history */}
      {customer.rewards.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm mb-6">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-800">Reward History</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Earned</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Redeemed On</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customer.rewards.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-gray-700">
                    {new Date(r.earnedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {r.redeemedAt ? (
                      <span className="text-green-600 font-medium">Redeemed</span>
                    ) : (
                      <span className="text-amber-600 font-medium">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {r.redeemedAt ? new Date(r.redeemedAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Transaction history */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-gray-800">Transaction History</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date &amp; Time</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Weight (lbs)</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customer.transactions.map((tx) => (
              <tr key={tx.id}>
                <td className="px-4 py-3 text-gray-700">
                  {new Date(tx.effectiveDate).toLocaleDateString()}{' '}
                  <span className="text-gray-400">
                    {new Date(tx.effectiveDate).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{tx.commodityType}</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {tx.weight.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
