import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const pdfPath = searchParams.get('path')
  const pageNum = parseInt(searchParams.get('page') || '1')

  if (!pdfPath) {
    return NextResponse.json({ error: 'Path requerido' }, { status: 400 })
  }

  // Verificar autenticación
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Obtener URL firmada del PDF (expira en 60 segundos)
  const { data, error } = await supabase.storage
    .from('mangas')
    .createSignedUrl(pdfPath, 60)

  if (error || !data) {
    return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 })
  }

  // Retornar la URL firmada temporal (solo se puede usar una vez y expira)
  return NextResponse.json({ signedUrl: data.signedUrl, page: pageNum })
}