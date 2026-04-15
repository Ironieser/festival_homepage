import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import insightsData from './data/band-insights.json'
import metricsData from './data/band-metrics.json'
import lineupData from './data/lineup.json'
import type { BandInfo, DayKey } from './types'

interface BandInsight {
  rating: string | null
  styleTags?: string[]
  spotifyAudience?: string | null
  audience?: string | null
  summary?: string | null
  sections?: {
    history?: string | null
    review?: string | null
    honors?: string | null
  }
}

interface EnhancedBand extends BandInfo {
  rating: string | null
  summary: string
  insightStyleTags: string[]
  spotifyAudience: string | null
  monthlyListeners: number | null
  audience: string | null
  sections: {
    history: string | null
    review: string | null
    honors: string | null
  }
  displayTags: { key: string; label: string }[]
  filterTags: string[]
}

interface BandMetric {
  name: string
  monthlyListeners: number | null
}

const dayConfigs: { key: DayKey; label: string }[] = [
  { key: '2026-04-17', label: '4月17日 (周五)' },
  { key: '2026-04-18', label: '4月18日 (周六)' },
  { key: '2026-04-19', label: '4月19日 (周日)' },
]

const zhTagToCanonical: Record<string, string> = {
  后摇: 'post-rock',
  数学摇滚: 'math-rock',
  后朋克: 'post-punk',
  冷潮: 'coldwave',
  氛围黑金: 'blackgaze',
  后黑金: 'post-black-metal',
  后金属: 'post-metal',
  后民谣: 'post-folk',
  氛围: 'ambient',
  器乐: 'instrumental',
  梦泡: 'shoegaze',
  电子: 'electronic',
  新古典: 'neo-classical',
  器乐摇滚: 'instrumental-rock',
}

const canonicalTagMeta: Record<string, { zh?: string; en?: string }> = {
  'post-rock': { zh: '后摇滚', en: 'Post-rock' },
  'math-rock': { zh: '数学摇滚', en: 'Math-rock' },
  'post-punk': { zh: '后朋克', en: 'Post-punk' },
  coldwave: { zh: '冷浪', en: 'Coldwave' },
  blackgaze: { zh: '黑界', en: 'Blackgaze' },
  shoegaze: { zh: '盯鞋', en: 'Shoegaze' },
  'trip-hop': { zh: '神游舞曲', en: 'Trip-hop' },
  electronic: { zh: '电子', en: 'Electronic' },
  'neo-classical': { zh: '新古典', en: 'Neo-classical' },
  'instrumental-rock': { zh: '器乐摇滚', en: 'Instrumental Rock' },
  'post-black-metal': { zh: '后黑金', en: 'Post-Black Metal' },
  'post-metal': { zh: '后金属', en: 'Post-metal' },
  'post-folk': { zh: '后民谣', en: 'Post-folk' },
  ambient: { zh: '氛围', en: 'Ambient' },
  instrumental: { zh: '器乐', en: 'Instrumental' },
  acoustic: { zh: '原声', en: 'Acoustic' },
  'ambient-piano': { zh: '氛围钢琴', en: 'Ambient piano' },
  'art-rock': { zh: '艺术摇滚', en: 'Art Rock' },
  atmospheric: { zh: '氛围感', en: 'Atmospheric' },
  'atmospheric-black-metal': { zh: '氛围黑金属', en: 'Atmospheric Black Metal' },
  'avant-folk': { zh: '先锋民谣', en: 'Avant-Folk' },
  'avant-prog': { zh: '先锋前卫摇滚', en: 'Avant-Prog' },
  'avant-pop': { zh: '先锋流行', en: 'Avant-pop' },
  'chill-out': { zh: '驰放音乐', en: 'Chill-out' },
  cinematic: { zh: '电影感', en: 'Cinematic' },
  'cinematic-post-rock': { zh: '电影感后摇滚', en: 'Cinematic Post-rock' },
  'crescendo-core': { zh: '渐强核', en: 'Crescendo-core' },
  'dream-pop': { zh: '梦幻流行', en: 'Dream-Pop' },
  'electro-jazz': { zh: '电子爵士', en: 'Electro-jazz' },
  emo: { zh: '情绪硬核', en: 'Emo' },
  experimental: { zh: '实验音乐', en: 'Experimental' },
  folk: { zh: '民谣', en: 'Folk' },
  'folk-rock': { zh: '民谣摇滚', en: 'Folk Rock' },
  'future-jazz': { zh: '未来爵士', en: 'Future Jazz' },
  indie: { zh: '独立音乐', en: 'Indie' },
  'indie-pop': { zh: '独立流行', en: 'Indie Pop' },
  'indie-rock': { zh: '独立摇滚', en: 'Indie Rock' },
  jazz: { zh: '爵士乐', en: 'Jazz' },
  'jazz-hop': { zh: '爵士嘻哈', en: 'Jazz-hop' },
  'jazz-rock': { zh: '爵士摇滚', en: 'Jazz-rock' },
  'latin-rock': { zh: '拉丁摇滚', en: 'Latin Rock' },
  'lo-fi': { zh: '低保真', en: 'Lo-fi' },
  melancholy: { zh: '忧郁', en: 'Melancholy' },
  minimalist: { zh: '极简主义', en: 'Minimalist' },
  'modern-classical': { zh: '现代古典', en: 'Modern Classical' },
  noise: { zh: '噪音音乐', en: 'Noise' },
  'noise-pop': { zh: '噪音流行', en: 'Noise-Pop' },
  nordic: { zh: '北欧风', en: 'Nordic' },
  'orchestral-post-rock': { zh: '交响后摇', en: 'Orchestral Post-rock' },
  'psychedelic-rock': { zh: '迷幻摇滚', en: 'Psychedelic Rock' },
  alternative: { zh: '另类', en: 'Alternative' },
  screamo: { zh: '嘶吼情绪硬核', en: 'Screamo' },
  slowcore: { zh: '慢核', en: 'Slowcore' },
  'traditional-chinese-elements': { zh: '中国传统元素', en: 'Traditional Chinese Elements' },
  tribal: { zh: '部落节拍', en: 'Tribal' },
  'world-music': { zh: '世界音乐', en: 'World Music' },
}

const normalizeTagKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/_/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')

const resolveCanonicalTag = (rawTag: string) => {
  if (zhTagToCanonical[rawTag]) {
    return zhTagToCanonical[rawTag]
  }
  const normalized = normalizeTagKey(rawTag)
  const matched = Object.keys(canonicalTagMeta).find(
    (canonical) => canonical.replace(/-/g, '') === normalized.replace(/-/g, ''),
  )
  return matched ?? normalized
}

const uniqueTags = (items: string[]) => [...new Set(items.map((item) => item.trim()).filter(Boolean))]

const normalizeBandKey = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[øØ]/g, 'o')
    .replace(/[æÆ]/g, 'ae')
    .replace(/[œŒ]/g, 'oe')
    .replace(/[ðÐ]/g, 'd')
    .replace(/[þÞ]/g, 'th')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/!/g, '')
    .replace(/≤/g, '')
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')

const formatMonthlyListeners = (value: number | null) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return null
  }
  if (value < 1000) {
    return '<1K'
  }
  return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`
}

const buildDisplayTagsFromEnglish = (enTags: string[]) => {
  const merged = new Map<string, { zh?: string; en?: string }>()
  enTags.forEach((rawTag) => {
    const canonical = resolveCanonicalTag(rawTag)
    const prev = merged.get(canonical) ?? {}
    merged.set(canonical, { ...prev, en: rawTag })
  })
  return [...merged.entries()].map(([key, value]) => {
    const meta = canonicalTagMeta[key]
    const zh = value.zh ?? meta?.zh
    const en = value.en ?? meta?.en
    return {
      key,
      label: zh && en ? `${en}(${zh})` : en ?? zh ?? key,
    }
  })
}

const getRatingValue = (rating: string | null) => {
  if (!rating) {
    return null
  }
  const fullStars = (rating.match(/★/g) ?? []).length
  if (fullStars > 0) {
    return Math.min(fullStars, 5)
  }
  const numeric = Number.parseFloat(rating)
  if (Number.isFinite(numeric) && numeric > 0) {
    return Math.min(Math.max(Math.round(numeric), 1), 5)
  }
  return null
}

const renderRatingBadge = (rating: string | null, withLabel = false) => {
  const value = getRatingValue(rating)
  if (!value) {
    return (
      <span className="inline-flex items-center rounded-full border border-[#f2e6bf]/60 bg-[#f2e6bf]/20 px-2.5 py-1 text-xs font-semibold text-[#ffe7a6]">
        {withLabel ? '推荐程度：暂无评分' : '暂无评分'}
      </span>
    )
  }

  const stars = Array.from({ length: 5 }, (_, index) => (index < value ? '★' : '☆')).join('')
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#f2e6bf]/70 bg-[#f2e6bf]/25 px-3 py-1 text-sm font-bold tracking-wide text-[#ffe6a2]">
      {withLabel ? <span className="text-xs font-semibold text-[#ffeec4]">推荐</span> : null}
      <span aria-label={`评分 ${value} / 5`}>{stars}</span>
      <span className="text-xs font-semibold text-[#ffeec4]">{value}/5</span>
    </span>
  )
}

function Can2026Page() {
  const lineup = lineupData as BandInfo[]
  const insights = insightsData as Record<string, BandInsight>
  const metrics = metricsData as BandMetric[]
  const [activeDay, setActiveDay] = useState<DayKey>('2026-04-17')
  const [selectedBand, setSelectedBand] = useState<EnhancedBand | null>(null)
  const [copyState, setCopyState] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [visitorCount, setVisitorCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('https://api.counterapi.dev/v1/festival-ironieser/can2026/up')
      .then((res) => res.json())
      .then((data: { count: number }) => setVisitorCount(data.count))
      .catch(() => { /* 静默失败，不影响主功能 */ })
  }, [])

  const metricByBandName = useMemo(() => {
    const map = new Map<string, number | null>()
    metrics.forEach((metric) => {
      map.set(normalizeBandKey(metric.name), metric.monthlyListeners)
    })
    return map
  }, [metrics])

  const bandsInDay = useMemo(
    () =>
      lineup
        .filter((band) => band.day === activeDay)
        .sort((a, b) => a.timeRange.localeCompare(b.timeRange))
        .map((band) => {
          const insight = insights[band.id]
          const mergedTags = buildDisplayTagsFromEnglish(uniqueTags(insight?.styleTags ?? []))
          return {
            ...band,
            rating: insight?.rating ?? null,
            summary: insight?.summary ?? band.description,
            insightStyleTags: insight?.styleTags ?? [],
            spotifyAudience: insight?.spotifyAudience ?? null,
            monthlyListeners: metricByBandName.get(normalizeBandKey(band.name)) ?? null,
            audience: insight?.audience ?? null,
            sections: {
              history: insight?.sections?.history ?? null,
              review: insight?.sections?.review ?? null,
              honors: insight?.sections?.honors ?? null,
            },
            displayTags: mergedTags,
            filterTags: mergedTags.map((tag) => tag.key),
          }
        }),
    [activeDay, insights, lineup, metricByBandName],
  )

  const availableTags = useMemo(() => {
    const tagMap = new Map<string, string>()
    bandsInDay.forEach((band) => {
      band.displayTags.forEach((tag) => {
        if (!tagMap.has(tag.key)) {
          tagMap.set(tag.key, tag.label)
        }
      })
    })
    return [...tagMap.entries()]
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [bandsInDay])

  const visibleBands = useMemo(() => {
    if (selectedTags.length === 0) {
      return bandsInDay
    }
    return bandsInDay.filter((band) =>
      selectedTags.every((tag) => band.filterTags.includes(tag)),
    )
  }, [bandsInDay, selectedTags])

  const currentDayLabel = dayConfigs.find((day) => day.key === activeDay)?.label ?? '当日'

  const copyBandName = async (name: string, source: 'card' | 'modal') => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(name)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = name
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopyState(`${source}-${name}`)
      window.setTimeout(() => setCopyState(null), 1200)
    } catch {
      setCopyState('error')
      window.setTimeout(() => setCopyState(null), 1500)
    }
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl px-4 pb-16 pt-6 text-sky-50 sm:px-6">
      <header className="mb-6 space-y-3">
        <Link
          to="/"
          onClick={() => setSelectedBand(null)}
          className="inline-flex min-h-11 items-center rounded-xl border border-sky-100/45 bg-[#3f86a9]/70 px-3 py-2 text-sm text-sky-50 backdrop-blur transition hover:bg-[#3a7e9f]/80"
        >
          ← 返回主页
        </Link>
        <p className="text-xs uppercase tracking-[0.22em] text-[#f7eccf]">CAN Festival 2026 · Info</p>
        <h1 className="text-3xl font-black leading-tight sm:text-4xl">CAN Festival 2026</h1>
        <p className="max-w-3xl text-sm leading-6 text-sky-100/90">
          汇总 CAN Festival 2026 的演出信息、时间表和乐队要点，便于快速浏览与现场使用。
        </p>
        <p className="text-xs text-sky-100/70">
          已为{' '}
          <span className="font-semibold text-[#f2e6bf]">
            {visitorCount !== null ? visitorCount.toLocaleString() : '--'}
          </span>{' '}
          位乐迷朋友提供帮助
        </p>
        <p className="inline-flex rounded-xl border border-sky-100/45 bg-[#3c7f9f]/65 px-3 py-2 text-xs text-sky-50">
          AI整理：推荐星级与标签用于快速浏览，不构成绝对评价。
        </p>
        <a
          href="/poster.png"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center rounded-lg border border-sky-100/45 bg-[#3f86a9]/70 px-3 text-sm font-semibold text-sky-50 transition hover:bg-[#3a7e9f]/80"
        >
          查看原始海报
        </a>
      </header>

      <div className="sticky top-0 z-20 -mx-4 border-y border-sky-100/30 bg-[#4588ae]/85 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex gap-2 overflow-x-auto">
          {dayConfigs.map((day) => (
            <button
              key={day.key}
              type="button"
              onClick={() => {
                setActiveDay(day.key)
                setSelectedBand(null)
                setSelectedTags([])
              }}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeDay === day.key
                  ? 'bg-[#f2e6bf] text-[#3f6d86]'
                  : 'bg-[#3c789a] text-sky-50 hover:bg-[#356d8c]'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <section className="mt-5 space-y-4">
        <h2 className="text-lg font-semibold text-[#f8edcf]">{currentDayLabel}</h2>
        <p className="text-sm text-sky-100/85">当天演出时间表（按时间排序）+ 乐队要点速览</p>
        {availableTags.length > 0 ? (
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#e7f5ff]">风格筛选</h3>
              <button
                type="button"
                onClick={() => setSelectedTags([])}
                className="text-sm text-[#f4e1a3] underline-offset-2 hover:underline"
              >
                清空
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const active = selectedTags.includes(tag.key)
                return (
                  <button
                    key={tag.key}
                    type="button"
                    onClick={() =>
                      setSelectedTags((prev) =>
                        prev.includes(tag.key)
                          ? prev.filter((item) => item !== tag.key)
                          : [...prev, tag.key],
                      )
                    }
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${
                      active
                        ? 'border-[#f5e9c7] bg-[#f5e9c7] text-[#3a6882]'
                        : 'border-sky-100/45 bg-[#3f83a6]/75 text-sky-50 hover:border-sky-100/70'
                    }`}
                  >
                    {tag.label}
                  </button>
                )
              })}
            </div>
          </section>
        ) : null}
        <p className="text-xs text-sky-100/90">注：🎧 表示 Spotify 月听众。</p>
        <div className="grid gap-4 md:grid-cols-2">
          {visibleBands.map((band) => (
            <article
              key={band.id}
              className="rounded-2xl border border-sky-100/30 bg-[#3e80a5]/80 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[#f2e6bf]">{band.timeRange}</p>
                  <h3 className="text-xl font-bold leading-tight text-white">{band.name}</h3>
                  <p className="mt-1 text-xs text-sky-100/85">
                    {band.country}
                    {band.signingTime ? ` · 签售：${band.signingTime}` : ''}
                    {formatMonthlyListeners(band.monthlyListeners)
                      ? ` · 🎧 ${formatMonthlyListeners(band.monthlyListeners)}`
                      : ''}
                  </p>
                </div>
                <div className="shrink-0">{renderRatingBadge(band.rating)}</div>
              </div>
              {band.displayTags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {band.displayTags.map((tag) => (
                    <span
                      key={`${band.id}-${tag.key}`}
                      className="rounded-full border border-sky-100/40 bg-[#3f83a6]/65 px-2.5 py-1 text-xs text-sky-50"
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              ) : null}
              <p className="mt-3 line-clamp-4 text-sm leading-6 text-sky-50/90">{band.summary}</p>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyBandName(band.name, 'card')}
                  className="h-9 rounded-lg border border-sky-100/45 bg-[#3f86a9]/75 px-3 text-xs font-semibold text-sky-50 transition hover:bg-[#3a7e9f]/85"
                >
                  {copyState === `card-${band.name}`
                    ? '已复制'
                    : copyState === 'error'
                      ? '复制失败'
                      : '复制乐队名'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBand(band)}
                  className="min-h-11 flex-1 rounded-xl bg-[#f2e6bf] px-3 py-2.5 text-sm font-semibold text-[#3f6d86] transition hover:bg-[#f8eecf]"
                >
                  查看完整档案
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {selectedBand ? (
        <div
          className="fixed inset-0 z-40 flex items-end bg-black/60 p-0 md:items-center md:justify-center md:p-6"
          onClick={() => setSelectedBand(null)}
          role="presentation"
        >
          <div
            className="max-h-[88vh] w-full overflow-y-auto rounded-t-3xl border border-sky-100/30 bg-[#3f82a8] p-5 md:max-w-3xl md:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedBand.name} 乐队完整档案`}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedBand.name}</h3>
                <p className="mt-1 text-sm text-sky-100/90">
                  {selectedBand.country}
                  {selectedBand.signingTime ? ` · 签售：${selectedBand.signingTime}` : ''}
                  {formatMonthlyListeners(selectedBand.monthlyListeners)
                    ? ` · 🎧 ${formatMonthlyListeners(selectedBand.monthlyListeners)}`
                    : ''}
                </p>
                <p className="mt-1 text-sm text-sky-100/90">
                  演出：{selectedBand.timeRange}
                </p>
                <div className="mt-1">{renderRatingBadge(selectedBand.rating, true)}</div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => copyBandName(selectedBand.name, 'modal')}
                  className="min-h-11 rounded-full border border-sky-100/45 bg-[#3f86a9]/80 px-4 text-sm text-sky-50"
                >
                  {copyState === `modal-${selectedBand.name}` ? '已复制' : '复制乐队名'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBand(null)}
                  className="min-h-11 rounded-full border border-sky-100/45 bg-[#3f86a9]/80 px-4 text-sm text-sky-50"
                >
                  关闭
                </button>
              </div>
            </div>

            <p className="mb-4 rounded-xl border border-sky-100/45 bg-[#3f86a9]/65 px-3 py-2 text-xs text-sky-50">
              AI整理：以下评估信息仅供参考。
            </p>

            {selectedBand.displayTags.length > 0 ? (
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedBand.displayTags.map((tag) => (
                  <span
                    key={`modal-${selectedBand.id}-${tag.key}`}
                    className="rounded-full border border-sky-100/40 bg-[#3f83a6]/65 px-2.5 py-1 text-xs text-sky-50"
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="space-y-4 text-sm leading-7 text-sky-50/95">
              {selectedBand.sections.history ? (
                <section>
                  <h4 className="text-base font-semibold text-[#f6e9c4]">发展历程与专辑演变</h4>
                  <p className="mt-1">{selectedBand.sections.history}</p>
                </section>
              ) : (
                <section>
                  <h4 className="text-base font-semibold text-[#f6e9c4]">乐队简介</h4>
                  <p className="mt-1">{selectedBand.description}</p>
                </section>
              )}
              {selectedBand.sections.review ? (
                <section>
                  <h4 className="text-base font-semibold text-[#f6e9c4]">AI评价</h4>
                  <p className="mt-1">{selectedBand.sections.review}</p>
                </section>
              ) : null}
              {selectedBand.sections.honors ? (
                <section>
                  <h4 className="text-base font-semibold text-[#f6e9c4]">国际奖项与荣誉</h4>
                  <p className="mt-1">{selectedBand.sections.honors}</p>
                </section>
              ) : null}
              {selectedBand.spotifyAudience ? (
                <section>
                  <h4 className="text-base font-semibold text-[#f6e9c4]">Spotify听众</h4>
                  <p className="mt-1">{selectedBand.spotifyAudience}</p>
                </section>
              ) : null}
              {selectedBand.audience ? (
                <section>
                  <h4 className="text-base font-semibold text-[#f6e9c4]">适合人群</h4>
                  <p className="mt-1">{selectedBand.audience}</p>
                </section>
              ) : null}
              {selectedBand.insightStyleTags.length > 0 ? (
                <section>
                  <h4 className="text-base font-semibold text-[#f6e9c4]">风格</h4>
                  <p className="mt-1">
                    {buildDisplayTagsFromEnglish(selectedBand.insightStyleTags)
                      .map((tag) => tag.label)
                      .join(' / ')}
                  </p>
                </section>
              ) : null}
              <section>
                <h4 className="text-base font-semibold text-[#f6e9c4]">代表曲目</h4>
                <p className="mt-1">{selectedBand.topTracks.join(' / ')}</p>
              </section>
              <section>
                <h4 className="text-base font-semibold text-[#f6e9c4]">推荐专辑</h4>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {selectedBand.albums.map((album) => (
                    <li key={`${selectedBand.id}-album-${album}`}>{album}</li>
                  ))}
                </ul>
              </section>
              {selectedBand.note ? (
                <section>
                  <h4 className="text-base font-semibold text-[#f6e9c4]">补充说明</h4>
                  <p className="mt-1">{selectedBand.note}</p>
                </section>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <footer className="mt-8 rounded-2xl border border-sky-100/30 bg-[#3f82a8]/70 p-4 text-xs leading-6 text-sky-50/95">
        本页整理了演出信息、时间表和乐队要点，方便到场前后快速查阅；具体演出时间请以现场公告为准。
        <br />
        作者
        <span className="font-semibold text-[#f5e9c7]"> @ironieser</span>（
        <span className="font-semibold text-[#f5e9c7]">ironieser@gmail.com</span>），如发现信息错误或有更新、补充建议，欢迎联系。
      </footer>
    </main>
  )
}

function HomePage() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl px-4 pb-16 pt-10 text-sky-50 sm:px-6">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.22em] text-[#f7eccf]">FESTIVAL.IRONIESER.CC</p>
        <h1 className="text-3xl font-black leading-tight sm:text-4xl">音乐节主页</h1>
        <p className="max-w-3xl text-sm leading-6 text-sky-100/90">
          这是音乐节信息的统一入口，当前收录 CAN Festival 2026，后续将持续补充新的音乐节页面。
        </p>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-sky-100/30 bg-[#3e80a5]/80 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-[#f8edcf]">2026</p>
          <h2 className="mt-1 text-2xl font-bold text-white">CAN Festival</h2>
          <p className="mt-3 text-sm leading-6 text-sky-50/90">
            汇总 CAN Festival 2026 的演出信息、时间表和乐队要点。
          </p>
          <Link
            to="/can2026"
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#f2e6bf] px-4 py-2.5 font-semibold text-[#3f6d86] transition hover:bg-[#f8eecf]"
          >
            查看详情
          </Link>
        </article>
      </section>

      <footer className="mt-8 rounded-2xl border border-sky-100/30 bg-[#3f82a8]/70 p-4 text-xs leading-6 text-sky-50/95">
        本页整理了演出信息、时间表和乐队要点，方便到场前后快速查阅；具体演出时间请以现场公告为准。
        <br />
        作者
        <span className="font-semibold text-[#f5e9c7]"> @ironieser</span>（
        <span className="font-semibold text-[#f5e9c7]">ironieser@gmail.com</span>），如发现信息错误或有更新、补充建议，欢迎联系。
      </footer>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/can2026" element={<Can2026Page />} />
      <Route path="/can2026/" element={<Can2026Page />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
