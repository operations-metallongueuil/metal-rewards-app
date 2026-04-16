import { POINTS_PER_REWARD } from '@/lib/rewards'

interface ProgressBarProps {
  currentPoints: number
}

export default function ProgressBar({ currentPoints }: ProgressBarProps) {
  const percentage = Math.min((currentPoints / POINTS_PER_REWARD) * 100, 100)

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-orange-500 font-semibold">{currentPoints} pts</span>
        <span className="text-gray-400 dark:text-gray-500">{POINTS_PER_REWARD} pts</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, background: 'linear-gradient(90deg, #ea580c, #f97316)' }}
        />
      </div>
    </div>
  )
}
