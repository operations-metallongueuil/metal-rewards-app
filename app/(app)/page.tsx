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
      {/* Page header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">500 lbs = 1 point &middot; 10 points = $20 gas gift card</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        <div className="bg-[#1a1a1a] border border-white/10 rounded-[20px] p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">Total Customers</p>
          <p className="text-3xl font-bold text-white">{totalCustomers}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-[20px] p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">Rewards to Issue</p>
          <p className={`text-3xl font-bold ${pendingRewards > 0 ? 'text-orange-500' : 'text-white'}`}>
            {pendingRewards}
          </p>
        </div>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-[20px] p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">Near 10 pts (7+)</p>
          <p className="text-3xl font-bold text-orange-500/70">{nearThreshold.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Pending Rewards */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-[20px] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h2 className="font-semibold text-white text-sm uppercase tracking-wider">Rewards to Issue</h2>
            <Link href="/rewards" className="text-xs text-orange-500 hover:text-orange-400 font-medium uppercase tracking-wider transition-colors">
              View all
            </Link>
          </div>
          {withPendingRewards.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-600">No pending rewards</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {withPendingRewards.map((c) => (
                <li key={c.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors">
                  <Link href={`/customers/${c.id}`} className="text-sm font-medium text-gray-200 hover:text-orange-500 transition-colors">
                    {c.name}
                  </Link>
                  <span className="bg-orange-500/15 text-orange-500 border border-orange-500/20 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {c.pendingCount} card{c.pendingCount > 1 ? 's' : ''} owed
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Near Threshold */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-[20px] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h2 className="font-semibold text-white text-sm uppercase tracking-wider">Near Threshold</h2>
            <Link href="/customers" className="text-xs text-orange-500 hover:text-orange-400 font-medium uppercase tracking-wider transition-colors">
              View all
            </Link>
          </div>
          {nearThreshold.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-600">No customers near threshold</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {nearThreshold.map((c) => (
                <li key={c.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors">
                  <Link href={`/customers/${c.id}`} className="text-sm font-medium text-gray-200 hover:text-orange-500 transition-colors">
                    {c.name}
                  </Link>
                  <span className="text-sm font-semibold text-orange-500/80">
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
