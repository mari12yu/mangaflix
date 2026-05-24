'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, Heart, LogOut, Settings } from 'lucide-react'

interface NavbarProps {
  user: { id: string; email?: string } | null
  isAdmin: boolean
}

export default function Navbar({ user, isAdmin }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="text-red-500" size={28} />
          <span className="text-2xl font-black tracking-tight text-white">
            Manga<span className="text-red-500">Flix</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-gray-300">
          <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
          <Link href="/favorites" className="hover:text-white transition-colors">Favoritos</Link>
          {isAdmin && (
            <Link href="/admin" className="hover:text-red-400 transition-colors">Admin</Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/favorites">
                <Heart size={20} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer" />
              </Link>
              {isAdmin && (
                <Link href="/admin">
                  <Settings size={20} className="text-gray-400 hover:text-white transition-colors cursor-pointer" />
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}