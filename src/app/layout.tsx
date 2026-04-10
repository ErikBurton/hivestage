import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'HiveStage — Utah\'s Home for Live Music',
    template: '%s — HiveStage',
  },
  description: 'Find local shows, discover new bands, and connect with venues across Utah. HiveStage is Utah\'s home for live music.',
  keywords: ['Utah live music', 'Salt Lake City concerts', 'Utah bands', 'live music Utah', 'Utah venues', 'local music Utah'],
  verification: {
    google: "8-WVonOom9Vj11Iu47qL3Nsea36oFok4UNJ-1cSihLc",
  },
  openGraph: {
    title: 'HiveStage — Utah\'s Home for Live Music',
    description: 'Find local shows, discover new bands, and connect with venues across Utah.',
    url: 'https://www.hivestage.live',
    siteName: 'HiveStage',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HiveStage — Utah\'s Home for Live Music',
    description: 'Find local shows, discover new bands, and connect with venues across Utah.',
  },
  metadataBase: new URL('https://www.hivestage.live'),
  alternates: {
    canonical: 'https://www.hivestage.live', 
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}