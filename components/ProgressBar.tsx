import { POINTS_PER_REWARD } from '@/lib/rewards'

interface ProgressBarProps {
  currentPoints: number
}

export default function ProgressBar({ currentPoints }: ProgressBarProps) {
  const percentage = Math.min((currentPoints / POINTS_PER_REWARD) * 100, 100)

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{currentPoints} pts</span>
        <span>{POINTS_PER_REWARD} pts</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full bg-emerald-500 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
