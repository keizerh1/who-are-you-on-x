'use client'

import { useState, useRef } from 'react'
import './globals.css'

type Role = 'bot' | 'farmer' | 'builder' | 'whale' | 'memelord' | 'rugger' | 'normie'

interface Result {
  handle: string
  role: Role
  line: string
  key: string
}

const roleNames: Record<Role, string> = {
  bot: 'Bot',
  farmer: 'Farmer',
  builder: 'Builder',
  whale: 'Whale',
  memelord: 'Meme Lord',
  rugger: 'Pro Rugger',
  normie: 'Normie'
}

// Fonction pour capturer le résultat en image
const captureToCanvas = async (element: HTMLElement): Promise<Blob | null> => {
  try {
    // Utilisation de html2canvas (méthode native sans librairie externe)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Dimensions de l'élément
    const rect = element.getBoundingClientRect()
    const scale = 2 // Pour une meilleure qualité
    canvas.width = rect.width * scale
    canvas.height = rect.height * scale
    canvas.style.width = rect.width + 'px'
    canvas.style.height = rect.height + 'px'
    ctx.scale(scale, scale)

    // Création d'un foreignObject pour le rendu HTML
    const data = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: ${rect.height}px;
          ">
            ${element.innerHTML}
          </div>
        </foreignObject>
      </svg>
    `

    // Alternative: utiliser la méthode DOM to Image manuelle
    return new Promise((resolve) => {
      // Création d'une image temporaire avec le contenu
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'fixed'
      tempDiv.style.top = '-9999px'
      tempDiv.style.width = rect.width + 'px'
      tempDiv.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      tempDiv.style.padding = '20px'
      tempDiv.innerHTML = element.innerHTML
      
      // Copier les styles
      const styles = window.getComputedStyle(element)
      tempDiv.style.cssText += styles.cssText
      
      document.body.appendChild(tempDiv)
      
      // Utiliser Canvas API pour capturer
      setTimeout(() => {
        canvas.toBlob((blob) => {
          document.body.removeChild(tempDiv)
          resolve(blob)
        }, 'image/png')
      }, 100)
    })
  } catch (error) {
    console.error('Error capturing screenshot:', error)
    return null
  }
}

export default function Home() {
  const [handle, setHandle] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  // Generate a random avatar color based on handle
  const getAvatarColor = (str: string) => {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
      'linear-gradient(135deg, #fdcbf1 0%, #e6dee9 100%)'
    ]
    
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    return colors[Math.abs(hash) % colors.length]
  }

  const checkHandle = async () => {
    if (!handle.trim()) return
    
    setLoading(true)
    setProfilePic(null)
    setImageLoading(true)
    
    try {
      // Lancer les deux requêtes en parallèle
      const [response] = await Promise.all([
        fetch(`/api/result?handle=${encodeURIComponent(handle)}`),
        // Précharger l'image en parallèle
        new Promise((resolve) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.src = `https://unavatar.io/x/${handle.trim().replace(/^@/, '').toLowerCase()}`
          img.onload = () => resolve(img.src)
          img.onerror = () => resolve(null)
          setTimeout(() => resolve(null), 1500) // Timeout court
        })
      ])
      
      const data = await response.json()
      setResult(data)
      
      // Charger la photo de profil
      loadProfilePicture(data.handle)
    } catch (error) {
      console.error('Error:', error)
      setImageLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const loadProfilePicture = (username: string) => {
    setImageLoading(true)
    
    // URL directe sans paramètres pour une meilleure compatibilité
    const primaryUrl = `https://unavatar.io/x/${username}`
    
    const img = new Image()
    
    // Timeout de 2 secondes
    const timeoutId = setTimeout(() => {
      setProfilePic(null)
      setImageLoading(false)
    }, 2000)
    
    img.onload = () => {
      clearTimeout(timeoutId)
      // Vérifier si c'est une vraie photo (pas un avatar par défaut)
      // Les avatars par défaut ont souvent une petite taille
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (ctx && img.width > 48) {  // Filtrer les petites images par défaut
        canvas.width = 1
        canvas.height = 1
        ctx.drawImage(img, 0, 0, 1, 1)
        const pixel = ctx.getImageData(0, 0, 1, 1).data
        
        // Si l'image est majoritairement grise/uniforme, c'est probablement un avatar par défaut
        const isGrayish = Math.abs(pixel[0] - pixel[1]) < 30 && Math.abs(pixel[1] - pixel[2]) < 30
        
        if (!isGrayish) {
          setProfilePic(primaryUrl)
        } else {
          setProfilePic(null)
        }
      } else {
        setProfilePic(null)
      }
      setImageLoading(false)
    }
    
    img.onerror = () => {
      clearTimeout(timeoutId)
      setProfilePic(null)
      setImageLoading(false)
    }
    
    // Charger l'image
    img.src = primaryUrl
  }

  const shareOnX = () => {
    if (!result) return
    
    const text = `I just did my coming out → ${roleNames[result.role]}
${result.line}
@${result.handle}

And you, what are you waiting for?
https://who-are-you-on-x.vercel.app`
    
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const downloadScreenshot = async () => {
    if (!resultRef.current || !result) return
    
    try {
      // Méthode simple : créer un canvas avec le contenu stylé
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        alert('Could not create screenshot. Try taking a manual screenshot instead.')
        return
      }

      // Dimensions pour l'image (format carré pour les réseaux sociaux)
      const size = 800
      canvas.width = size
      canvas.height = size

      // Gradient de fond
      const gradient = ctx.createLinearGradient(0, 0, size, size)
      gradient.addColorStop(0, '#667eea')
      gradient.addColorStop(1, '#764ba2')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, size, size)

      // Carte blanche semi-transparente
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.roundRect(100, 150, 600, 500, 20)
      ctx.fill()

      // Titre
      ctx.fillStyle = 'white'
      ctx.font = 'bold 48px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('Who are you on X?', size / 2, 250)

      // Sous-titre
      ctx.font = '24px system-ui'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.fillText('A playful test for Monad culture', size / 2, 290)

      // Avatar placeholder ou image
      const avatarSize = 100
      const avatarX = size / 2 - avatarSize / 2
      const avatarY = 340
      
      if (profilePic) {
        // Si on a une photo de profil
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          ctx.save()
          ctx.beginPath()
          ctx.arc(size / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
          ctx.clip()
          ctx.drawImage(img, avatarX, avatarY, avatarSize, avatarSize)
          ctx.restore()
          finishDrawing()
        }
        img.onerror = () => {
          drawAvatarPlaceholder()
          finishDrawing()
        }
        img.src = profilePic
      } else {
        drawAvatarPlaceholder()
        finishDrawing()
      }

      function drawAvatarPlaceholder() {
        // Avatar avec gradient
        const avatarGradient = ctx!.createLinearGradient(avatarX, avatarY, avatarX + avatarSize, avatarY + avatarSize)
        const colors = getAvatarColor(result!.handle).match(/#[a-f0-9]{6}/gi) || ['#667eea', '#764ba2']
        avatarGradient.addColorStop(0, colors[0])
        avatarGradient.addColorStop(1, colors[1])
        
        ctx!.fillStyle = avatarGradient
        ctx!.beginPath()
        ctx!.arc(size / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
        ctx!.fill()
        
        // Lettre
        ctx!.fillStyle = 'white'
        ctx!.font = 'bold 48px system-ui'
        ctx!.textAlign = 'center'
        ctx!.fillText(result!.handle.charAt(0).toUpperCase(), size / 2, avatarY + avatarSize / 2 + 15)
      }

      function finishDrawing() {
        // Handle
        ctx!.fillStyle = 'rgba(255, 255, 255, 0.85)'
        ctx!.font = '24px system-ui'
        ctx!.textAlign = 'center'
        ctx!.fillText(`@${result!.handle}`, size / 2, 480)

        // Résultat
        ctx!.fillStyle = 'white'
        ctx!.font = 'bold 36px system-ui'
        ctx!.fillText(`You are: ${roleNames[result!.role]}`, size / 2, 530)

        // Description
        ctx!.fillStyle = 'rgba(255, 255, 255, 0.95)'
        ctx!.font = 'italic 22px system-ui'
        
        // Wrap text si trop long
        const maxWidth = 500
        const lineHeight = 30
        const words = result!.line.split(' ')
        let line = ''
        let y = 570
        
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' '
          const metrics = ctx!.measureText(testLine)
          if (metrics.width > maxWidth && n > 0) {
            ctx!.fillText(line, size / 2, y)
            line = words[n] + ' '
            y += lineHeight
          } else {
            line = testLine
          }
        }
        ctx!.fillText(line, size / 2, y)

        // Watermark
        ctx!.fillStyle = 'rgba(255, 255, 255, 0.5)'
        ctx!.font = '16px system-ui'
        ctx!.fillText('who-are-you-on-x.vercel.app', size / 2, size - 50)

        // Télécharger l'image
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `who-are-you-on-x-${result!.handle}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }
        }, 'image/png')
      }
    } catch (error) {
      console.error('Error creating screenshot:', error)
      alert('Could not create screenshot. Try taking a manual screenshot instead.')
    }
  }

  const tryAgain = () => {
    // Reset state and go back to input
    setResult(null)
    setProfilePic(null)
    setHandle('')
  }

  return (
    <main className="container">
      <div className="card">
        <h1 className="title">Who are you on X?</h1>
        <p className="subtitle">A playful test for Monad culture</p>
        
        {!result ? (
          <div style={{ marginTop: '30px' }}>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && checkHandle()}
              placeholder="Enter your handle"
              className="input"
            />
            <button
              onClick={checkHandle}
              disabled={loading}
              className="button-primary"
            >
              {loading ? 'Checking...' : 'Check'}
            </button>
          </div>
        ) : (
          <div className="result-container" ref={resultRef}>
            <div className="profile-section">
              {/* Profile Picture with Loading State */}
              {imageLoading ? (
                <div className="profile-placeholder" style={{ 
                  background: 'rgba(255, 255, 255, 0.1)',
                  animation: 'pulse 1.5s infinite'
                }}>
                  <span style={{ opacity: 0.5 }}>...</span>
                </div>
              ) : profilePic ? (
                <img 
                  src={profilePic} 
                  alt={`@${result.handle}`}
                  className="profile-pic"
                  onError={() => {
                    setProfilePic(null)
                  }}
                />
              ) : (
                <div 
                  className="profile-placeholder"
                  style={{ 
                    background: getAvatarColor(result.handle),
                    border: 'none'
                  }}
                >
                  {result.handle.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <p className="handle-text">@{result.handle}</p>
            
            <h2 className="role-title">You are: {roleNames[result.role]}</h2>
            <p className="role-line">{result.line}</p>
            
            <div className="button-group">
              <button
                onClick={tryAgain}
                className="button-secondary"
              >
                Try Again
              </button>
              
              <button
                onClick={shareOnX}
                className="button-x"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Share on X
              </button>
            </div>
            
            {/* Bouton de capture d'écran */}
            <button
              onClick={downloadScreenshot}
              className="button-screenshot"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              Save as Image
            </button>
          </div>
        )}
      </div>
    </main>
  )
}