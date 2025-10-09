import { Metadata } from 'next'

const defaultMetadata: Metadata = {
  metadataBase: new URL('https://tony-chat-nine.vercel.app'),
  title: {
    default: 'TonyChat - Your Personal and Business Chatbot',
    template: '%s | TonyChat'
  },
  description: 'TonyChat is an open-source, multifunctional Chatbot suitable for both personal and business purposes. It allows for customized chatbot deployment, easy model fine-tuning, and ensures safety and privacy.',
  keywords: ['chatbot', 'AI', 'business chat', 'personal assistant', 'open source'],
  authors: [{ name: 'TonyChat' }],
  creator: 'TonyChat',
  publisher: 'TonyChat',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.tonychat.com',
    siteName: 'TonyChat',
    title: 'TonyChat - Your Personal and Business Chatbot',
    description: 'Open-source multifunctional chatbot platform for personal and business use',
    images: [
      {
        url: '/T_icon.png',
        width: 1200,
        height: 630,
        alt: 'TonyChat Logo'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TonyChat - Your Personal and Business Chatbot',
    description: 'Open-source multifunctional chatbot platform for personal and business use',
    images: ['/T_icon.png']
  }
}

export default defaultMetadata 