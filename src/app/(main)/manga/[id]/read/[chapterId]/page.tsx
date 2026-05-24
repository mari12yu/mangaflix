import { createClient } from '@/lib/supabase/server'
import MangaReader from '@/components/reader/MangaReader'
import { notFound } from 'next/navigation'

export default async function ReadPage({
  params
}: {
  params: Promise<{ id: string; chapterId: string }>
}) {
  const { id, chapterId } = await params
  const supabase = await createClient()

  const { data: chapter } = await supabase
    .from('chapters')
    .select('*, mangas(*)')
    .eq('id', chapterId)
    .single()

  if (!chapter) notFound()

  return (
    <div>
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <a href={`/manga/${id}`} className="text-gray-400 hover:text-white transition-colors text-sm">
          ← {chapter.mangas?.title}
        </a>
        <span className="text-white text-sm font-medium">
          Cap. {chapter.chapter_number}: {chapter.title}
        </span>
        <div />
      </div>
      <div className="pt-12">
        <MangaReader
          pdfPath={chapter.pdf_path}
          chapterId={chapter.id}
        />
      </div>
    </div>
  )
}