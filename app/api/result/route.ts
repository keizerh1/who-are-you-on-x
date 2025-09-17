import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

type Role = 'bot' | 'farmer' | 'builder' | 'whale' | 'memelord' | 'rugger' | 'normie'

interface RoleData {
  key: Role
  name: string
  line: string
}

const roles: RoleData[] = [
  {
    key: 'bot',
    name: 'Bot',
    line: "You're the defective version of MikeWeb, admit it"
  },
  {
    key: 'farmer',
    name: 'Farmer',
    line: "You've got more cousins than your family has members"
  },
  {
    key: 'builder',
    name: 'Builder',
    line: "You build about as well as GPT-3.5"
  },
  {
    key: 'whale',
    name: 'Whale',
    line: "Stop being stingy and send me some MON"
  },
  {
    key: 'memelord',
    name: 'Meme Lord',
    line: "You're funny… or maybe just famous"
  },
  {
    key: 'rugger',
    name: 'Pro Rugger',
    line: "Give us back our money, thief"
  },
  {
    key: 'normie',
    name: 'Normie',
    line: "Who even are you, bro?"
  }
]

// Easy to edit forced table
const forcedTable: Record<string, Role> = {
  'elonmusk': 'memelord',
  'vitalikbuterin': 'whale',
  'satoshinakamoto': 'bot',
  // Add more forced handles here
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const handle = searchParams.get('handle')
  
  if (!handle) {
    return NextResponse.json({ error: 'Handle parameter is required' }, { status: 400 })
  }
  
  // Normalize handle: trim, remove leading @, lowercase
  const normalizedHandle = handle.trim().replace(/^@/, '').toLowerCase()
  
  let role: RoleData
  
  // Check forced table first
  if (forcedTable[normalizedHandle]) {
    const forcedRole = forcedTable[normalizedHandle]
    role = roles.find(r => r.key === forcedRole)!
  } else {
    // Compute deterministic result using SHA-256
    const hash = createHash('sha256').update(normalizedHandle).digest()
    const firstByte = hash[0]
    const roleIndex = firstByte % roles.length
    role = roles[roleIndex]
  }
  
  return NextResponse.json({
    handle: normalizedHandle,
    role: role.key,
    line: role.line,
    key: role.key
  })
}