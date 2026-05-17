export interface DiaryBlock {
  content: string
  reflection: string
}

export interface Diary {
  id: string
  user_id: string
  title: string
  content: string
  reflections: string[]
  blocks: DiaryBlock[] | null
  mood: string | null
  created_at: string
  updated_at: string
}

export const BLOCKS_START_DATE = '2026-05-18'

export function isBlocksMode(targetDate: string): boolean {
  return targetDate >= BLOCKS_START_DATE
}
