import type { BandInfo } from '../types'

interface BandDetailDrawerProps {
  band: BandInfo | null
  onClose: () => void
}

export function BandDetailDrawer({ band, onClose }: BandDetailDrawerProps) {
  if (!band) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end bg-black/60 p-0 md:items-center md:justify-center md:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[88vh] w-full overflow-y-auto rounded-t-3xl border border-sky-100/30 bg-[#3b7b9e] p-5 md:max-w-2xl md:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${band.name} 乐队详情`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-[#f2e6bf]">{band.timeRange}</p>
            <h3 className="text-2xl font-bold text-white">{band.name}</h3>
            <p className="mt-1 text-sm text-sky-100">{band.country}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-full border border-sky-100/30 bg-[#356d8c] px-4 text-sm text-sky-50"
            aria-label="关闭详情"
          >
            关闭
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {band.tags.map((tag) => (
            <span
              key={`${band.id}-${tag}`}
              className="rounded-full border border-sky-100/30 bg-[#356d8c] px-3 py-1 text-xs text-sky-50"
            >
              #{tag}
            </span>
          ))}
        </div>

        <section className="space-y-4 text-sm leading-7 text-sky-50/95">
          <div>
            <h4 className="text-base font-semibold text-white">乐队简介</h4>
            <p>{band.description}</p>
          </div>
          <div>
            <h4 className="text-base font-semibold text-white">知名曲</h4>
            <p>{band.topTracks.join(' / ')}</p>
          </div>
          <div>
            <h4 className="text-base font-semibold text-white">推荐专辑</h4>
            <p>{band.albums.join(' / ')}</p>
          </div>
          {band.note ? (
            <p className="rounded-xl border border-[#f2e6bf]/60 bg-[#f2e6bf]/20 p-3 text-[#fff7df]">
              {band.note}
            </p>
          ) : null}
        </section>

        <a
          href={band.neteaseUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 flex min-h-11 w-full items-center justify-center rounded-xl bg-[#f2e6bf] px-4 py-3 font-semibold text-[#3f6d86] transition hover:bg-[#f8eecf]"
        >
          打开网易云
        </a>
      </div>
    </div>
  )
}
