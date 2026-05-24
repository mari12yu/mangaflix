import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SharePage({ params }: { params: { token: string } }) {
  const supabase = await createClient()

  const { data: link } = await supabase
    .from('private_links')
    .select('*, mangas(*), chapters(*)')
    .eq('token', params.token)
    .single()

  if (!link) return redirect('/')

  // Verificar expiración
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white text-center">
      <div>
        <h1 className="text-2xl font-bold mb-2">Link expirado</h1>
        <p className="text-gray-400">Este enlace ya no está disponible.</p>
      </div>
    </div>
  }

  // Incrementar usos
  await supabase
    .from('private_links')
    .update({ uses: (link.uses || 0) + 1 })
    .eq('token', params.token)

  // Redirigir al manga o capítulo
  if (link.chapter_id) {
    redirect(`/manga/${link.manga_id}/read/${link.chapter_id}`)
  } else if (link.manga_id) {
    redirect(`/manga/${link.manga_id}`)
  }

  return redirect('/')
}