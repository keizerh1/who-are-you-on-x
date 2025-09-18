import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const username = searchParams.get('username')
  
  if (!username) {
    return NextResponse.json({ hasAvatar: false })
  }
  
  try {
    // Essayer de récupérer l'image depuis unavatar
    const response = await fetch(`https://unavatar.io/x/${username}`, {
      method: 'HEAD',
      redirect: 'follow'
    })
    
    // Si la réponse finale contient "fallback" ou est une redirection vers un placeholder
    const finalUrl = response.url || ''
    const hasDefaultAvatar = finalUrl.includes('fallback') || 
                             finalUrl.includes('default') || 
                             finalUrl.includes('placeholder')
    
    // Vérifier aussi le content-length pour filtrer les petites images
    const contentLength = response.headers.get('content-length')
    const isTooSmall = contentLength ? parseInt(contentLength) < 3000 : false
    
    return NextResponse.json({ 
      hasAvatar: response.ok && !hasDefaultAvatar && !isTooSmall,
      url: !hasDefaultAvatar && !isTooSmall ? `https://unavatar.io/x/${username}` : null
    })
  } catch (error) {
    return NextResponse.json({ hasAvatar: false })
  }
}