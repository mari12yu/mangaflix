import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const { manga_id, chapter_id, expires_hours, max_uses } = await request.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const expires_at = expires_hours
    ? new Date(Date.now() + expires_hours * 3600000).toISOString()
    : null

  const { data, error } = await supabase
    .from('private_links')
    .insert({ manga_id, chapter_id, expires_at, max_uses })
    .select()
    .single()

  if (error) return NextResponse.json({ error }, { status: 500 })

  const link = `${process.env.NEXT_PUBLIC_APP_URL}/share/${data.token}`
  return NextResponse.json({ link, token: data.token })
}