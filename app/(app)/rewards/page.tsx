import { prisma } from '@/lib/prisma'
import RedeemButton from '@/components/RedeemButton'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function RewardsPage() {
  const [pending, redeemed] = await Promise.all([
    prisma.reward.findMany({
      where: { redeemedAt: null },
      include: { customer: true },
      orderBy: { earnedAt: 'asc' },
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
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Rewards</h1>
        <p className="text-gray-500 text-sm mt-1">$20 gas gift card per 10 points earned</p>
      </div>

      {/* Pending */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-[20px] overflow-hidden mb-5 shadow-sm dark:shadow-none transition-colors">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Pending — Gift Cards to Issue</h2>
          {pending.length > 0 && (
            <span className="bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-500 border border-orange-200 dark:border-orange-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              {pending.length} to issue
            </span>
          )}
        </div>
        {pending.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-400">No pending rewards</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Earned On</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {pending.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/customers/${r.customerId}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-orange-500 transition-colors">
                      {r.customer.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{new Date(r.earnedAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-right"><RedeemButton rewardId={r.id} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Redeemed */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-[20px] overflow-hidden shadow-sm dark:shadow-none transition-colors">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Recently Redeemed</h2>
        </div>
        {redeemed.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-400">No redeemed rewards yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Earned</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Redeemed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {redeemed.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/customers/${r.customerId}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-orange-500 transition-colors">
                      {r.customer.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{new Date(r.earnedAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-gray-500">{new Date(r.redeemedAt!).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
