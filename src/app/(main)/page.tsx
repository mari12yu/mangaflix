import { createClient } from '@/lib/supabase/server'
import MangaCard from '@/components/manga/MangaCard'
import Navbar from '@/components/layout/Navbar'
import { BookOpen, TrendingUp, Clock } from 'lucide-react'
import { Manga } from '@/types'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  const { data: mangas } = await supabase
    .from('mangas')
    .select('*')
    .order('created_at', { ascending: false })

  const recentMangas: Manga[] = mangas || []
  const featuredManga = recentMangas[0]

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar user={user} isAdmin={profile?.role === 'admin'} />

      {featuredManga && (
        <div className="relative h-[70vh] overflow-hidden">
          {featuredManga.cover_url && (
            <div
              className="absolute inset-0 bg-cover bg-center scale-105"
              style={{ backgroundImage: `url(${featuredManga.cover_url})` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
          <div className="relative z-10 h-full flex items-center px-8 md:px-16 max-w-7xl mx-auto">
            <div className="max-w-xl fade-in">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-red-500" />
                <span className="text-red-400 text-sm font-medium uppercase tracking-wider">Destacado</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
                {featuredManga.title}
              </h1>
              <p className="text-gray-300 text-base md:text-lg mb-6 line-clamp-3">
                {featuredManga.description}
              </p>
              <div className="flex gap-3">
                <a href={`/manga/${featuredManga.id}`} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-105">
                  <BookOpen size={18} />
                  Leer ahora
                </a>
                <a href={`/manga/${featuredManga.id}`} className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all backdrop-blur-sm">
                  Más info
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12">
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Clock size={20} className="text-red-500" />
            <h2 className="text-xl font-bold text-white">Recién agregados</h2>
          </div>
          {recentMangas.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {recentMangas.map((manga: Manga) => (
                <MangaCard key={manga.id} manga={manga} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-600">
              <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
              <p>No hay mangas aún.</p>
              {profile?.role === 'admin' && (
                <a href="/admin/upload" className="mt-4 inline-block text-red-500 hover:underline">
                  Subir el primero →
                </a>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}