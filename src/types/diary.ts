export interface Diary {
  id: string
  user_id: string
  title: string
  content: string
  mood: string | null
  created_at: string
  updated_at: string
}

export type DiaryInsert = Omit<Diary, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type DiaryUpdate = Partial<DiaryInsert>
