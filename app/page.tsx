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

  // Fonction corrigée pour le chargement de la photo de profil
  const loadProfilePicture = async (username: string) => {
    setImageLoading(true)
    
    try {
      const imageUrl = `https://unavatar.io/x/${username}`
      
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      let imageLoaded = false
      
      img.onload = () => {
        if (!imageLoaded) {
          imageLoaded = true
          setProfilePic(imageUrl)
          setImageLoading(false)
        }
      }
      
      img.onerror = () => {
        if (!imageLoaded) {
          imageLoaded = true
          setProfilePic(null)
          setImageLoading(false)
        }
      }
      
      // Timeout seulement si l'image n'a pas été chargée
      setTimeout(() => {
        if (!imageLoaded) {
          imageLoaded = true
          setProfilePic(null)
          setImageLoading(false)
        }
      }, 5000) // Augmenté à 5 secondes
      
      img.src = imageUrl
      
    } catch (error) {
      console.log('Error loading avatar:', error)
      setProfilePic(null)
      setImageLoading(false)
    }
  }

  const checkHandle = async () => {
    if (!handle.trim()) return
    
    setLoading(true)
    setProfilePic(null)
    setImageLoading(true)
    
    try {
      const response = await fetch(`/api/result?handle=${encodeURIComponent(handle)}`)
      const data = await response.json()
      setResult(data)
      
      // Load profile picture after getting the result
      loadProfilePicture(data.handle)
    } catch (error) {
      console.error('Error:', error)
      setImageLoading(false)
    } finally {
      setLoading(false)
    }
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
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        alert('Could not create screenshot. Try taking a manual screenshot instead.')
        return
      }

      const size = 800
      canvas.width = size
      canvas.height = size

      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, size, size)
      gradient.addColorStop(0, '#667eea')
      gradient.addColorStop(1, '#764ba2')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, size, size)

      // Semi-transparent card
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.roundRect(100, 150, 600, 500, 20)
      ctx.fill()

      // Title
      ctx.fillStyle = 'white'
      ctx.font = 'bold 48px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('Who are you on X?', size / 2, 250)

      // Subtitle
      ctx.font = '24px system-ui'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.fillText('A playful test for Monad culture', size / 2, 290)

      // Avatar
      const avatarSize = 100
      const avatarX = size / 2 - avatarSize / 2
      const avatarY = 340
      
      if (profilePic) {
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
        const avatarGradient = ctx!.createLinearGradient(avatarX, avatarY, avatarX + avatarSize, avatarY + avatarSize)
        const colors = getAvatarColor(result!.handle).match(/#[a-f0-9]{6}/gi) || ['#667eea', '#764ba2']
        avatarGradient.addColorStop(0, colors[0])
        avatarGradient.addColorStop(1, colors[1])
        
        ctx!.fillStyle = avatarGradient
        ctx!.beginPath()
        ctx!.arc(size / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
        ctx!.fill()
        
        ctx!.fillStyle = 'white'
        ctx!.font = 'bold 48px system-ui'
        ctx!.textAlign = 'center'
        ctx!.fillText(result!.handle.charAt(0).toUpperCase(), size / 2, avatarY + avatarSize / 2 + 15)
      }

      function finishDrawing() {
        ctx!.fillStyle = 'rgba(255, 255, 255, 0.85)'
        ctx!.font = '24px system-ui'
        ctx!.textAlign = 'center'
        ctx!.fillText(`@${result!.handle}`, size / 2, 480)

        ctx!.fillStyle = 'white'
        ctx!.font = 'bold 36px system-ui'
        ctx!.fillText(`You are: ${roleNames[result!.role]}`, size / 2, 530)

        ctx!.fillStyle = 'rgba(255, 255, 255, 0.95)'
        ctx!.font = 'italic 22px system-ui'
        
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

        ctx!.fillStyle = 'rgba(255, 255, 255, 0.5)'
        ctx!.font = '16px system-ui'
        ctx!.fillText('who-are-you-on-x.vercel.app', size / 2, size - 50)

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
                  onError={() => setProfilePic(null)}
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
              <button onClick={tryAgain} className="button-secondary">
                Try Again
              </button>
              <button onClick={shareOnX} className="button-x">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Share on X
              </button>
            </div>
            
            <button onClick={downloadScreenshot} className="button-screenshot">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              Save as Image
            </button>
          </div>
        )}
        
        {/* Single footer outside both conditions */}
        <div className="footer">
          Developed by keizer7h
        </div>
      </div>
    </main>
  )
}