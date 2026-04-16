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
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <span className="text-sm text-gray-400">{customers.length} customers</span>
      </div>

      <form className="mb-4">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name..."
          className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </form>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-44">Points</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Total lbs</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Pending</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Redeemed</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Last Visit</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customerStats.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/customers/${c.id}`}
                    className="font-medium text-gray-900 hover:text-emerald-600"
                  >
                    {c.name}
                  </Link>
                  {c.pendingCount > 0 && (
                    <span className="ml-2 bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded">
                      {c.pendingCount} owed
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <ProgressBar currentPoints={c.currentPoints} />
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {c.totalLbs.toLocaleString()} lbs
                </td>
                <td className="px-4 py-3 text-right text-gray-700">{c.pendingCount}</td>
                <td className="px-4 py-3 text-right text-gray-500">{c.redeemedCount}</td>
                <td className="px-4 py-3 text-right text-gray-500">
                  {c.lastTxDate ? new Date(c.lastTxDate).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
            {customerStats.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
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
