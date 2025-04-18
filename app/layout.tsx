import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import '@rainbow-me/rainbowkit/styles.css'

import { Providers } from '../components/providers'

// const geistSans = localFont({
//   src: './fonts/GeistVF.woff',
//   variable: '--font-geist-sans',
//   weight: '100 900',
// })
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Freysa.ai',
  description: "World's first adversarial agent game",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistMono.variable} ${inter.variable} antialiased relative`}
      >
        <div className="fixed top-4 left-4 z-50 shine-wrapper">
          <Image 
            src="/cluster-logo.jpg"
            alt="Cluster Logo"
            width={50}
            height={50}
            className="rounded-lg"
          />
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
