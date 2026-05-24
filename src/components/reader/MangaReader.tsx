'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChevronUp, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

interface MangaReaderProps {
  pdfPath: string
  chapterId: string
}

export default function MangaReader({ pdfPath, chapterId }: MangaReaderProps) {
  const [pages, setPages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [zoom, setZoom] = useState(100)
  const [currentPage, setCurrentPage] = useState(1)
  const supabase = createClient()
  const readerRef = useRef<HTMLDivElement>(null)
  const pagesRef = useRef<string[]>([])

  // Bloquear clic derecho
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault()
    document.addEventListener('contextmenu', handleContextMenu)
    return () => document.removeEventListener('contextmenu', handleContextMenu)
  }, [])

  // Cargar páginas del PDF
  useEffect(() => {
    let cancelled = false

    async function loadPages() {
      setLoading(true)
      setPages([])

      const { data } = await supabase.storage
        .from('mangas')
        .createSignedUrl(pdfPath, 3600)

      if (!data?.signedUrl || cancelled) {
        setLoading(false)
        return
      }

      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`

      const pdf = await pdfjsLib.getDocument(data.signedUrl).promise
      const pageUrls: string[] = []

      for (let i = 1; i <= pdf.numPages; i++) {
        if (cancelled) break
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 2.0 })
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        canvas.width = viewport.width
        canvas.height = viewport.height
        await page.render({ canvasContext: ctx, viewport, canvas }).promise
        pageUrls.push(canvas.toDataURL('image/jpeg', 0.85))
      }

      if (!cancelled) {
        pagesRef.current = pageUrls
        setPages(pageUrls)
        setLoading(false)
      }
    }

    loadPages()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfPath])

  // Guardar progreso (sin setState en el efecto)
  useEffect(() => {
    if (pages.length === 0) return

    const timer = setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('reading_history').upsert({
        user_id: user.id,
        chapter_id: chapterId,
        last_page: currentPage,
        completed: currentPage >= pages.length,
        updated_at: new Date().toISOString()
      })
    }, 2000)

    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pages.length])

  return (
    <div ref={readerRef} className="manga-reader min-h-screen bg-black select-none">
      {/* Controles flotantes */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <button
          onClick={() => setZoom(z => Math.min(z + 10, 200))}
          className="bg-gray-800/90 hover:bg-gray-700 text-white p-2 rounded-lg backdrop-blur-sm transition-colors"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z - 10, 50))}
          className="bg-gray-800/90 hover:bg-gray-700 text-white p-2 rounded-lg backdrop-blur-sm transition-colors"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={() => setZoom(100)}
          className="bg-gray-800/90 hover:bg-gray-700 text-white p-2 rounded-lg backdrop-blur-sm transition-colors"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-red-600/90 hover:bg-red-700 text-white p-2 rounded-lg backdrop-blur-sm transition-colors"
        >
          <ChevronUp size={18} />
        </button>
      </div>

      {/* Indicador de página */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-gray-700">
          {currentPage} / {pages.length || '?'}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Cargando capítulo...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center" style={{ zoom: `${zoom}%` }}>
          {pages.map((pageUrl, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={index}
              src={pageUrl}
              alt={`Página ${index + 1}`}
              className="w-full max-w-3xl block"
              draggable={false}
              onDragStart={e => e.preventDefault()}
              onLoad={() => setCurrentPage(index + 1)}
            />
          ))}
        </div>
      )}
    </div>
  )
}