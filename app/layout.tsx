import { Inter } from 'next/font/google'
import './globals.css'
import Head from 'next/head'
import  { Metadata } from 'next'
import defaultMetadata from './metadata'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = defaultMetadata


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Head>
        <meta
          name="theme-color"
          content="#c7d6da"
          media="(prefers-color-scheme: dark)"
        />
        <meta
          name="theme-color"
          content="#191a1a"
          media="(prefers-color-scheme: light)"
        />
        <link rel="icon" href="/favicon.ico?v=1" />
        <link
          rel="preload"
          href="/fonts/your-main-font.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </Head>
    
      <body className={inter.className}>{children}</body>
    </html>
  )
}
