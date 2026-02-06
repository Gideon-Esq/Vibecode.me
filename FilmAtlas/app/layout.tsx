import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { Header } from '@/components/shared/header'

export const metadata: Metadata = {
  title: 'FilmAtlas - Explore Movies',
  description: 'A Netflix-style movie discovery platform powered by TMDB',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <Providers>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
