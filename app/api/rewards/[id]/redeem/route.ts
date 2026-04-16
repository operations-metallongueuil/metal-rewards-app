import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reward = await prisma.reward.update({
      where: { id: params.id },
      data: { redeemedAt: new Date() },
      include: { customer: true },
    })
    return NextResponse.json(reward)
  } catch {
    return NextResponse.json({ error: 'Reward not found' }, { status: 404 })
  }
}
