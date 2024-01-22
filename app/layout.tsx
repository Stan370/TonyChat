import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Head from 'next/head'

const inter = Inter({ subsets: ['latin'] })



export const metadata: Metadata = {
  title: 'TonyChat APP',
  description: 'Offer Open-Source customized Agents  The Future of Self-Running AI',
}

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
      </Head>
    
      <body className={inter.className}>{children}</body>
    </html>
  )
}
