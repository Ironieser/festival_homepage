export type DayKey = '2026-04-17' | '2026-04-18' | '2026-04-19'

export interface BandInfo {
  id: string
  name: string
  day: DayKey
  timeRange: string
  signingTime?: string
  country: string
  tags: string[]
  description: string
  topTracks: string[]
  albums: string[]
  neteaseUrl: string
  note?: string
}
