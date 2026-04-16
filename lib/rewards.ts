import { prisma } from './prisma'

export const LBS_PER_POINT = 500
export const POINTS_PER_REWARD = 10
export const REWARD_VALUE_DOLLARS = 20

export interface RewardState {
  rewardsEarned: number
  currentPoints: number  // 0–9 complete points toward next gift card
  totalLbs: number
  rewardDates: Date[]
}

/**
 * Walks transactions chronologically and computes how many gift cards the
 * customer has earned and how many points they currently have.
 *
 * 500 lbs = 1 point. 10 points = 1 $20 gas gift card (5,000 lbs total).
 * Points reset after each gift card is earned.
 */
export function computeRewardState(
  transactions: { weight: number; effectiveDate: Date }[]
): RewardState {
  const sorted = [...transactions].sort(
    (a, b) => a.effectiveDate.getTime() - b.effectiveDate.getTime()
  )

  let totalLbs = 0
  let rewardsEarned = 0
  const rewardDates: Date[] = []

  for (const tx of sorted) {
    totalLbs += tx.weight
    const totalRewardsNow = Math.floor(totalLbs / (LBS_PER_POINT * POINTS_PER_REWARD))
    while (rewardsEarned < totalRewardsNow) {
      rewardsEarned++
      rewardDates.push(tx.effectiveDate)
    }
  }

  const totalPoints = Math.floor(totalLbs / LBS_PER_POINT)
  const currentPoints = totalPoints % POINTS_PER_REWARD

  return {
    rewardsEarned,
    currentPoints,
    totalLbs,
    rewardDates,
  }
}

/**
 * After importing transactions for a customer, call this to create any
 * newly-earned reward records. Returns the number of new rewards created.
 */
export async function syncRewardsForCustomer(customerId: string): Promise<number> {
  const transactions = await prisma.transaction.findMany({
    where: { customerId },
    select: { weight: true, effectiveDate: true },
  })

  const { rewardsEarned, rewardDates } = computeRewardState(
    transactions.map((t) => ({ weight: t.weight, effectiveDate: t.effectiveDate }))
  )

  const existingCount = await prisma.reward.count({ where: { customerId } })

  for (let i = existingCount; i < rewardsEarned; i++) {
    await prisma.reward.create({
      data: { customerId, earnedAt: rewardDates[i] },
    })
  }

  return rewardsEarned - existingCount
}
