import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Who are you on X?',
  description: 'A playful test for Monad culture',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}