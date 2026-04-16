import { prisma } from '@/lib/prisma'
import { computeRewardState, POINTS_PER_REWARD } from '@/lib/rewards'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [totalCustomers, pendingRewards, allCustomers] = await Promise.all([
    prisma.customer.count(),
    prisma.reward.count({ where: { redeemedAt: null } }),
    prisma.customer.findMany({
      include: {
        transactions: { select: { weight: true, effectiveDate: true } },
        rewards: { select: { id: true, redeemedAt: true } },
      },
    }),
  ])

  const customerStats = allCustomers.map((c) => {
    const { currentPoints } = computeRewardState(
      c.transactions.map((t) => ({ weight: t.weight, effectiveDate: t.effectiveDate }))
    )
    const pendingCount = c.rewards.filter((r) => !r.redeemedAt).length
    return { id: c.id, name: c.name, currentPoints, pendingCount }
  })

  const withPendingRewards = customerStats
    .filter((c) => c.pendingCount > 0)
    .sort((a, b) => b.pendingCount - a.pendingCount)

  const nearThreshold = customerStats
    .filter((c) => c.currentPoints >= POINTS_PER_REWARD - 3 && c.pendingCount === 0)
    .sort((a, b) => b.currentPoints - a.currentPoints)
    .slice(0, 10)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-sm text-gray-400 mb-6">500 lbs = 1 point &middot; 10 points = $20 gas gift card</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalCustomers}</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <p className="text-sm text-gray-500">Rewards to Issue</p>
          <p
            className={`text-3xl font-bold mt-1 ${
              pendingRewards > 0 ? 'text-amber-500' : 'text-gray-900'
            }`}
          >
            {pendingRewards}
          </p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <p className="text-sm text-gray-500">Near 10 pts (7+)</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{nearThreshold.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Pending Rewards */}
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-800">Rewards to Issue</h2>
            <Link href="/rewards" className="text-sm text-emerald-600 hover:underline">
              View all
            </Link>
          </div>
          {withPendingRewards.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">No pending rewards</p>
          ) : (
            <ul className="divide-y">
              {withPendingRewards.map((c) => (
                <li key={c.id} className="flex items-center justify-between px-4 py-3">
                  <Link
                    href={`/customers/${c.id}`}
                    className="font-medium text-gray-800 hover:text-emerald-600 text-sm"
                  >
                    {c.name}
                  </Link>
                  <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-1 rounded-full">
                    {c.pendingCount} card{c.pendingCount > 1 ? 's' : ''} owed
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Near Threshold */}
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-800">Near Threshold</h2>
            <Link href="/customers" className="text-sm text-emerald-600 hover:underline">
              View all
            </Link>
          </div>
          {nearThreshold.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">No customers near threshold</p>
          ) : (
            <ul className="divide-y">
              {nearThreshold.map((c) => (
                <li key={c.id} className="flex items-center justify-between px-4 py-3">
                  <Link
                    href={`/customers/${c.id}`}
                    className="font-medium text-gray-800 hover:text-emerald-600 text-sm"
                  >
                    {c.name}
                  </Link>
                  <span className="text-sm font-medium text-blue-600">
                    {c.currentPoints} / 10 pts
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
