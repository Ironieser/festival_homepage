import type { BandInfo } from '../types'

interface BandCardProps {
  band: BandInfo
  onOpen: (band: BandInfo) => void
}

export function BandCard({ band, onOpen }: BandCardProps) {
  return (
    <article className="rounded-2xl border border-sky-100/30 bg-[#3e80a5]/80 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#f2e6bf]">{band.timeRange}</p>
          <h3 className="mt-1 text-xl font-bold leading-tight text-white">{band.name}</h3>
        </div>
        <span className="rounded-full border border-sky-100/25 bg-[#356d8c] px-2.5 py-1 text-xs text-sky-50">
          {band.country}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {band.tags.map((tag) => (
          <span
            key={`${band.id}-${tag}`}
            className="rounded-full border border-sky-100/25 bg-[#356d8c] px-2.5 py-1 text-xs text-sky-50"
          >
            #{tag}
          </span>
        ))}
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-6 text-sky-50/90">{band.description}</p>

      <button
        type="button"
        onClick={() => onOpen(band)}
        className="mt-4 min-h-11 w-full rounded-xl bg-[#f2e6bf] px-4 py-2.5 font-semibold text-[#3f6d86] transition hover:bg-[#f8eecf]"
      >
        查看详情
      </button>
    </article>
  )
}
