import { prisma } from './prisma'

export const REWARD_THRESHOLD = 300

export interface RewardState {
  rewardsEarned: number
  currentBalance: number
  rewardDates: Date[]
}

/**
 * Walks through transactions chronologically and computes how many rewards
 * the customer has earned and what their current running balance is.
 *
 * Every time the running total hits $300, a reward is earned and the counter
 * resets. A single large transaction can trigger multiple rewards.
 */
export function computeRewardState(
  transactions: { cost: number; effectiveDate: Date }[]
): RewardState {
  const sorted = [...transactions].sort(
    (a, b) => a.effectiveDate.getTime() - b.effectiveDate.getTime()
  )

  let runningTotal = 0
  let rewardsEarned = 0
  const rewardDates: Date[] = []

  for (const tx of sorted) {
    runningTotal += tx.cost
    while (runningTotal >= REWARD_THRESHOLD) {
      runningTotal -= REWARD_THRESHOLD
      rewardsEarned++
      rewardDates.push(tx.effectiveDate)
    }
  }

  return {
    rewardsEarned,
    currentBalance: parseFloat(runningTotal.toFixed(2)),
    rewardDates,
  }
}

/**
 * After importing transactions for a customer, call this to create any
 * newly-earned reward records in the database.
 * Returns the number of new rewards created.
 */
export async function syncRewardsForCustomer(customerId: string): Promise<number> {
  const transactions = await prisma.transaction.findMany({
    where: { customerId },
    select: { cost: true, effectiveDate: true },
  })

  const { rewardsEarned, rewardDates } = computeRewardState(
    transactions.map((t) => ({ cost: t.cost, effectiveDate: t.effectiveDate }))
  )

  const existingCount = await prisma.reward.count({ where: { customerId } })

  for (let i = existingCount; i < rewardsEarned; i++) {
    await prisma.reward.create({
      data: { customerId, earnedAt: rewardDates[i] },
    })
  }

  return rewardsEarned - existingCount
}
