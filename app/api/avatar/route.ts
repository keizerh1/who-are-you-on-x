import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const username = searchParams.get('username')
  
  if (!username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 })
  }
  
  try {
    // Récupérer l'image depuis unavatar côté serveur (pas de CORS)
    const response = await fetch(`https://unavatar.io/x/${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Avatar-Proxy/1.0)',
      }
    })
    
    if (!response.ok) {
      return NextResponse.json({ hasAvatar: false }, { status: 404 })
    }
    
    // Vérifier si c'est une vraie image ou un placeholder
    const contentType = response.headers.get('content-type')
    const contentLength = response.headers.get('content-length')
    
    if (!contentType?.startsWith('image/') || 
        (contentLength && parseInt(contentLength) < 1000)) {
      return NextResponse.json({ hasAvatar: false }, { status: 404 })
    }
    
    // Retourner l'image directement
    const imageBuffer = await response.arrayBuffer()
    
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache 1h
        'Access-Control-Allow-Origin': '*',
      }
    })
    
  } catch (error) {
    return NextResponse.json({ hasAvatar: false }, { status: 500 })
  }
}