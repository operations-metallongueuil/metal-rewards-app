import { prisma } from '@/lib/prisma'
import RedeemButton from '@/components/RedeemButton'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function RewardsPage() {
  const [pending, redeemed] = await Promise.all([
    prisma.reward.findMany({
      where: { redeemedAt: null },
      include: { customer: true },
      orderBy: { earnedAt: 'asc' }, // oldest first — longest waiting
    }),
    prisma.reward.findMany({
      where: { NOT: { redeemedAt: null } },
      include: { customer: true },
      orderBy: { redeemedAt: 'desc' },
      take: 50,
    }),
  ])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Rewards</h1>

      {/* Pending */}
      <div className="bg-white rounded-xl border shadow-sm mb-6">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold text-gray-800">Pending — Gas Gift Cards to Issue</h2>
          {pending.length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {pending.length} to issue
            </span>
          )}
        </div>
        {pending.length === 0 ? (
          <p className="p-4 text-sm text-gray-400">No pending rewards</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Earned On</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pending.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/customers/${r.customerId}`}
                      className="font-medium text-gray-900 hover:text-emerald-600"
                    >
                      {r.customer.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(r.earnedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <RedeemButton rewardId={r.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Redeemed */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-gray-800">Recently Redeemed</h2>
        </div>
        {redeemed.length === 0 ? (
          <p className="p-4 text-sm text-gray-400">No redeemed rewards yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Earned</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Redeemed</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {redeemed.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/customers/${r.customerId}`}
                      className="font-medium text-gray-900 hover:text-emerald-600"
                    >
                      {r.customer.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(r.earnedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(r.redeemedAt!).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
