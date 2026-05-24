'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Manga } from '@/types'
import { BookOpen } from 'lucide-react'

export default function MangaCard({ manga }: { manga: Manga }) {
  return (
    <Link href={`/manga/${manga.id}`}>
      <div className="group relative overflow-hidden rounded-xl bg-[#16161f] cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-900/20">
        <div className="relative aspect-[2/3] overflow-hidden">
          {manga.cover_url ? (
            <Image
              src={manga.cover_url}
              alt={manga.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <BookOpen size={48} className="text-gray-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
            <span className="text-xs text-red-400 font-medium">
              {manga.status === 'ongoing' ? '● En curso' : '✓ Completado'}
            </span>
          </div>
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold text-white line-clamp-1 mb-1">{manga.title}</h3>
          <p className="text-xs text-gray-500">{manga.author || 'Autor desconocido'}</p>
          {manga.genre && manga.genre.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {manga.genre.slice(0, 2).map(g => (
                <span key={g} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{g}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}