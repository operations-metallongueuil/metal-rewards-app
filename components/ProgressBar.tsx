import { REWARD_THRESHOLD } from '@/lib/rewards'

interface ProgressBarProps {
  current: number
  threshold?: number
}

export default function ProgressBar({
  current,
  threshold = REWARD_THRESHOLD,
}: ProgressBarProps) {
  const percentage = Math.min((current / threshold) * 100, 100)

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>${current.toFixed(2)}</span>
        <span>${threshold}</span>
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
