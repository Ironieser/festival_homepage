import { useMemo, useState } from 'react'
import { BandCard } from './components/BandCard'
import { BandDetailDrawer } from './components/BandDetailDrawer'
import { DayTabs } from './components/DayTabs'
import { TagFilter } from './components/TagFilter'
import lineupData from './data/lineup.json'
import type { BandInfo, DayKey } from './types'

const days: { key: DayKey; label: string }[] = [
  { key: '2026-04-17', label: '4.17 Fri' },
  { key: '2026-04-18', label: '4.18 Sat' },
  { key: '2026-04-19', label: '4.19 Sun' },
]

const lineup = lineupData as BandInfo[]

function App() {
  const [activeDay, setActiveDay] = useState<DayKey>('2026-04-17')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedBand, setSelectedBand] = useState<BandInfo | null>(null)

  const bandsInDay = useMemo(
    () => lineup.filter((band) => band.day === activeDay),
    [activeDay],
  )

  const availableTags = useMemo(
    () => [...new Set(bandsInDay.flatMap((band) => band.tags))].sort(),
    [bandsInDay],
  )

  const filteredBands = useMemo(() => {
    if (selectedTags.length === 0) {
      return bandsInDay
    }
    return bandsInDay.filter((band) =>
      selectedTags.every((tag) => band.tags.includes(tag)),
    )
  }, [bandsInDay, selectedTags])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    )
  }

  const handleDayChange = (day: DayKey) => {
    setActiveDay(day)
    setSelectedTags([])
    setSelectedBand(null)
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-4xl px-4 pb-16 pt-6 text-sky-50 sm:px-6">
      <header className="mb-6 space-y-3">
        <p className="text-xs uppercase tracking-[0.22em] text-[#f0e6c8]">
          CAN Festival 2026 · Zhoushan
        </p>
        <h1 className="text-3xl font-black leading-tight sm:text-4xl">
          CAN Festival 2026 舟山音乐节
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-sky-100/90">
          CAN Festival 2026 舟山站阵容总览，按日期和风格快速浏览每日演出。
        </p>
        <p className="text-xs text-sky-100/80">
          页面作者：<span className="font-semibold text-[#f4e1a3]">@ironieser</span>
        </p>
      </header>

      <DayTabs days={days} activeDay={activeDay} onDayChange={handleDayChange} />

      <section className="mt-5 space-y-5">
        <TagFilter
          tags={availableTags}
          selectedTags={selectedTags}
          onToggleTag={toggleTag}
          onReset={() => setSelectedTags([])}
        />

        {filteredBands.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredBands.map((band) => (
              <BandCard key={band.id} band={band} onOpen={setSelectedBand} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-sky-100/30 bg-[#3f82a8]/70 p-5 text-sm text-sky-50">
            当前筛选条件下没有匹配乐队，试试减少标签条件。
          </p>
        )}
      </section>

      <footer className="mt-8 rounded-2xl border border-sky-100/30 bg-[#3f82a8]/70 p-4 text-xs leading-6 text-sky-50/95">
        CAN Festival 2026 舟山站阵容总览，按日期和风格快速浏览每日演出。实际演出时间请以现场公告为准。网页作者
        <span className="font-semibold text-[#f4e1a3]"> @ironieser</span>。
      </footer>

      <BandDetailDrawer band={selectedBand} onClose={() => setSelectedBand(null)} />
    </main>
  )
}

export default App
