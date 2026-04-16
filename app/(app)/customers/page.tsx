import { prisma } from '@/lib/prisma'
import { computeRewardState } from '@/lib/rewards'
import ProgressBar from '@/components/ProgressBar'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  const search = searchParams.search?.trim() || ''

  const customers = await prisma.customer.findMany({
    where: search ? { name: { contains: search.toUpperCase() } } : undefined,
    include: {
      transactions: { select: { weight: true, effectiveDate: true } },
      rewards: { select: { id: true, redeemedAt: true } },
    },
    orderBy: { name: 'asc' },
  })

  const customerStats = customers.map((c) => {
    const { currentPoints, totalLbs } = computeRewardState(
      c.transactions.map((t) => ({ weight: t.weight, effectiveDate: t.effectiveDate }))
    )
    const pendingCount = c.rewards.filter((r) => !r.redeemedAt).length
    const redeemedCount = c.rewards.filter((r) => r.redeemedAt).length
    const lastTx = [...c.transactions].sort(
      (a, b) => b.effectiveDate.getTime() - a.effectiveDate.getTime()
    )[0]
    return {
      id: c.id,
      name: c.name,
      currentPoints,
      totalLbs,
      pendingCount,
      redeemedCount,
      lastTxDate: lastTx?.effectiveDate ?? null,
    }
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Customers</h1>
          <p className="text-gray-500 text-sm mt-1">{customers.length} customers</p>
        </div>
      </div>

      {/* Search */}
      <form className="mb-5">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name..."
          className="w-full max-w-sm px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
        />
      </form>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-[20px] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-44">Points</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total lbs</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Redeemed</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Visit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {customerStats.map((c) => (
              <tr key={c.id} className="hover:bg-white/5 transition-colors">
                <td className="px-5 py-3.5">
                  <Link href={`/customers/${c.id}`} className="font-medium text-gray-100 hover:text-orange-500 transition-colors">
                    {c.name}
                  </Link>
                  {c.pendingCount > 0 && (
                    <span className="ml-2 bg-orange-500/15 text-orange-500 border border-orange-500/20 text-xs px-1.5 py-0.5 rounded-full font-semibold">
                      {c.pendingCount} owed
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <ProgressBar currentPoints={c.currentPoints} />
                </td>
                <td className="px-5 py-3.5 text-right text-gray-400">
                  {c.totalLbs.toLocaleString()} lbs
                </td>
                <td className="px-5 py-3.5 text-right text-gray-300">{c.pendingCount}</td>
                <td className="px-5 py-3.5 text-right text-gray-500">{c.redeemedCount}</td>
                <td className="px-5 py-3.5 text-right text-gray-500">
                  {c.lastTxDate ? new Date(c.lastTxDate).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
            {customerStats.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-gray-600">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
