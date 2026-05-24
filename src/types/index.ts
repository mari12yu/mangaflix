export interface Profile {
  id: string
  email: string
  role: 'user' | 'admin'
  avatar_url?: string
  created_at: string
}

export interface Manga {
  id: string
  title: string
  description?: string
  cover_url?: string
  author?: string
  genre?: string[]
  status: 'ongoing' | 'completed'
  is_public: boolean
  created_at: string
  chapters?: Chapter[]
}

export interface Chapter {
  id: string
  manga_id: string
  title: string
  chapter_number: number
  pdf_path: string
  page_count: number
  created_at: string
}

export interface ReadingHistory {
  id: string
  user_id: string
  chapter_id: string
  last_page: number
  completed: boolean
  updated_at: string
}

export interface PrivateLink {
  id: string
  token: string
  manga_id?: string
  chapter_id?: string
  expires_at?: string
  uses: number
  max_uses?: number
}