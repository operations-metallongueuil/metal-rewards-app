import type { Metadata } from 'next'
import { Figtree } from 'next/font/google'
import ThemeProvider from '@/components/ThemeProvider'
import './globals.css'

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
})

export const metadata: Metadata = {
  title: 'Metal Rewards — Longueuil',
  description: 'Ferrous metal customer reward tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${figtree.className} bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-200`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
