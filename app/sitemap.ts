import { MetadataRoute } from 'next'

const BASE = 'https://www.tonychat.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '', priority: 1, changeFrequency: 'weekly' },
    { path: '/store', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/usecases', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/chat', priority: 0.7, changeFrequency: 'monthly' },
  ]
  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))
}
