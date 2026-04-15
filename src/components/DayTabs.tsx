import type { DayKey } from '../types'

interface DayTabsProps {
  days: { key: DayKey; label: string }[]
  activeDay: DayKey
  onDayChange: (day: DayKey) => void
}

export function DayTabs({ days, activeDay, onDayChange }: DayTabsProps) {
  return (
    <div className="sticky top-0 z-20 -mx-4 border-y border-sky-100/25 bg-[#4588ae]/85 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex gap-2 overflow-x-auto">
        {days.map((day) => (
          <button
            key={day.key}
            type="button"
            onClick={() => onDayChange(day.key)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeDay === day.key
                ? 'bg-[#f2e6bf] text-[#3f6d86]'
                : 'bg-[#3c789a] text-sky-50 hover:bg-[#356d8c]'
            }`}
            aria-label={`查看 ${day.label} 演出`}
          >
            {day.label}
          </button>
        ))}
      </div>
    </div>
  )
}
