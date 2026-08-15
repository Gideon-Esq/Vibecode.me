import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'

export const metadata: Metadata = {
  title: 'Cineast - Explore Movies & TV',
  description:
    'Track what you have watched, plan what is next, and keep it in sync with TMDB.',
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
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
