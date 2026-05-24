'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, ImagePlus, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'

export default function UploadPage() {
  const [loading, setLoading] = useState(false)
  const [mangaForm, setMangaForm] = useState({
    title: '', description: '', author: '', genre: '',
    status: 'ongoing', is_public: false
  })
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [chapterTitle, setChapterTitle] = useState('')
  const [chapterNumber, setChapterNumber] = useState('1')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pdfFile) return toast.error('Selecciona un PDF')
    setLoading(true)

    try {
      let coverUrl = ''

      // Subir portada si existe
      if (coverFile) {
        const coverPath = `covers/${Date.now()}-${coverFile.name}`
        const { error } = await supabase.storage
          .from('mangas')
          .upload(coverPath, coverFile, { contentType: coverFile.type })

        if (!error) {
          const { data } = supabase.storage.from('mangas').getPublicUrl(coverPath)
          coverUrl = data.publicUrl
        }
      }

      // Crear manga en BD
      const { data: manga, error: mangaError } = await supabase
        .from('mangas')
        .insert({
          ...mangaForm,
          cover_url: coverUrl,
          genre: mangaForm.genre.split(',').map(g => g.trim()).filter(Boolean)
        })
        .select()
        .single()

      if (mangaError) throw mangaError

      // Subir PDF del capítulo
      const pdfPath = `chapters/${manga.id}/${Date.now()}-${pdfFile.name}`
      const { error: pdfError } = await supabase.storage
        .from('mangas')
        .upload(pdfPath, pdfFile, { contentType: 'application/pdf' })

      if (pdfError) throw pdfError

      // Crear capítulo en BD
      await supabase.from('chapters').insert({
        manga_id: manga.id,
        title: chapterTitle || `Capítulo ${chapterNumber}`,
        chapter_number: parseFloat(chapterNumber),
        pdf_path: pdfPath,
        page_count: 0
      })

      toast.success('¡Manga subido exitosamente!')
      window.location.href = `/manga/${manga.id}`
    } catch (err: unknown) {
  const message = err instanceof Error ? err.message : 'Error al subir el manga'
  toast.error(message)
}

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="text-red-500" size={28} />
          <h1 className="text-2xl font-bold text-white">Subir nuevo manga</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-[#16161f] rounded-2xl p-8 border border-gray-800">
          {/* Título */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Título *</label>
            <input
              type="text"
              value={mangaForm.title}
              onChange={e => setMangaForm(p => ({ ...p, title: e.target.value }))}
              className="w-full bg-[#0a0a0f] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
              placeholder="Nombre del manga"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Descripción</label>
            <textarea
              value={mangaForm.description}
              onChange={e => setMangaForm(p => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full bg-[#0a0a0f] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition-colors resize-none"
              placeholder="Sinopsis del manga..."
            />
          </div>

          {/* Autor y géneros */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Autor</label>
              <input
                type="text"
                value={mangaForm.author}
                onChange={e => setMangaForm(p => ({ ...p, author: e.target.value }))}
                className="w-full bg-[#0a0a0f] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Nombre del autor"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Géneros (separados por coma)</label>
              <input
                type="text"
                value={mangaForm.genre}
                onChange={e => setMangaForm(p => ({ ...p, genre: e.target.value }))}
                className="w-full bg-[#0a0a0f] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Acción, Romance, Fantasy"
              />
            </div>
          </div>

          {/* Opciones */}
          <div className="flex items-center gap-6">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Estado</label>
              <select
                value={mangaForm.status}
                onChange={e => setMangaForm(p => ({ ...p, status: e.target.value }))}
                className="bg-[#0a0a0f] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500"
              >
                <option value="ongoing">En curso</option>
                <option value="completed">Completado</option>
              </select>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                id="is_public"
                checked={mangaForm.is_public}
                onChange={e => setMangaForm(p => ({ ...p, is_public: e.target.checked }))}
                className="w-4 h-4 accent-red-600"
              />
              <label htmlFor="is_public" className="text-sm text-gray-400">
                Público (sin login)
              </label>
            </div>
          </div>

          {/* Portada */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Portada (imagen)</label>
            <label className="flex items-center gap-3 border-2 border-dashed border-gray-700 rounded-xl p-4 cursor-pointer hover:border-red-500 transition-colors">
              <ImagePlus size={20} className="text-gray-500" />
              <span className="text-sm text-gray-500">
                {coverFile ? coverFile.name : 'Seleccionar imagen de portada'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={e => setCoverFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>

          {/* Capítulo */}
          <div className="border-t border-gray-800 pt-6">
            <h3 className="text-white font-semibold mb-4">Primer capítulo</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Número de capítulo</label>
                <input
                  type="number"
                  value={chapterNumber}
                  onChange={e => setChapterNumber(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Título del capítulo</label>
                <input
                  type="text"
                  value={chapterTitle}
                  onChange={e => setChapterTitle(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Opcional"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 border-2 border-dashed border-gray-700 rounded-xl p-4 cursor-pointer hover:border-red-500 transition-colors">
              <Upload size={20} className="text-gray-500" />
              <span className="text-sm text-gray-500">
                {pdfFile ? pdfFile.name : 'Seleccionar PDF del capítulo *'}
              </span>
              <input
                type="file"
                accept="application/pdf"
                onChange={e => setPdfFile(e.target.files?.[0] || null)}
                className="hidden"
                required
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload size={18} />
                Publicar manga
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}